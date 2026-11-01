import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
	docuSignRequest,
	docuSignGetAll,
	assertSafeId,
	accountPath,
	templatePath,
} from '../../transport';
import { applyDeliveryMethod } from '../../utils/recipientDelivery';
import { buildNotificationBody, completeNotification } from '../../utils/notification';

/**
 * Handle all Template resource operations.
 */
/** Maps the picker's rotation values to DocuSign's left/right turns; 180 degrees is two right turns. */
const ROTATION_TURNS: Record<string, string[]> = {
	clockwise90: ['right'],
	clockwise180: ['right', 'right'],
	counterclockwise90: ['left'],
};

export async function handleTemplate(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const acctPath = accountPath(ctx.getNodeParameter('accountId', i) as string);
	const basePath = `${acctPath}/templates`;

	switch (operation) {
		case 'create': {
			const templateName = ctx.getNodeParameter('templateName', i) as string;
			const description = ctx.getNodeParameter('description', i, '') as string;
			const emailSubject = ctx.getNodeParameter('emailSubject', i) as string;
			const additionalFields = ctx.getNodeParameter('additionalFields', i, {}) as IDataObject;

			// Build documents
			const docsData = ctx.getNodeParameter('documents', i, {}) as IDataObject;
			const docsList = (docsData.document || []) as IDataObject[];
			const documents: IDataObject[] = [];
			for (const doc of docsList) {
				const document: IDataObject = {
					name: doc.name as string,
					documentId: (doc.documentId as string) || '1',
					fileExtension: doc.fileExtension as string,
				};
				if (doc.source === 'binary' && doc.binaryProperty) {
					const binaryData = ctx.helpers.assertBinaryData(i, doc.binaryProperty as string);
					// binaryData.data is only a storage reference in filesystem and S3 binary mode.
					const buffer = await ctx.helpers.getBinaryDataBuffer(i, doc.binaryProperty as string);
					document.documentBase64 = buffer.toString('base64');
					if (binaryData.fileName) document.name = document.name || binaryData.fileName;
				} else if (doc.source === 'base64' && doc.documentBase64) {
					document.documentBase64 = doc.documentBase64;
				} else if (doc.source === 'remoteUrl' && doc.remoteUrl) {
					document.remoteUrl = doc.remoteUrl;
				}
				if (doc.order && Number(doc.order) > 0) document.order = String(doc.order);
				if (doc.transformPdfFields === 'true') document.transformPdfFields = 'true';
				if (doc.includeInDownload === 'false') document.includeInDownload = 'false';
				documents.push(document);
			}

			// Build recipients (signers)
			const recipientsData = ctx.getNodeParameter('recipients', i, {}) as IDataObject;
			const signersList = (recipientsData.signer || []) as IDataObject[];
			const signers = signersList.map((s) => {
				const signer: IDataObject = {
					roleName: s.roleName as string,
					recipientId: (s.recipientId as string) || '1',
					routingOrder: (s.routingOrder as string) || '1',
				};
				if (s.email) signer.email = s.email;
				if (s.name) signer.name = s.name;
				if (s.accessCode) signer.accessCode = s.accessCode;
				if (s.idCheckConfigurationName) signer.idCheckConfigurationName = s.idCheckConfigurationName;
				if (s.deliveryMethod && s.deliveryMethod !== 'email') {
					applyDeliveryMethod(signer, s.deliveryMethod, s.phoneNumber);
				}
				if (s.emailNotificationSubject || s.emailNotificationBody) {
					signer.emailNotification = {
						emailSubject: s.emailNotificationSubject || '',
						emailBody: s.emailNotificationBody || '',
					};
				}
				return signer;
			});

			const recipients: IDataObject = { signers };

			// Carbon copies from additionalFields
			const ccData = additionalFields.carbonCopies as IDataObject | undefined;
			if (ccData?.recipient) {
				recipients.carbonCopies = (ccData.recipient as IDataObject[]).map((r) => {
					const cc: IDataObject = { roleName: r.roleName };
					if (r.recipientId) cc.recipientId = r.recipientId;
					if (r.routingOrder) cc.routingOrder = r.routingOrder;
					if (r.email) cc.email = r.email;
					if (r.name) cc.name = r.name;
					return cc;
				});
			}

			const body: IDataObject = {
				name: templateName,
				emailSubject,
				documents,
				recipients,
			};

			if (description) body.description = description;

			// Simple additional fields
			const simpleFields = [
				'emailBlurb', 'brandId', 'signingLocation', 'enableWetSign',
				'allowMarkup', 'allowReassign', 'enforceSignerVisibility',
				'messageLock', 'recipientsLock', 'authoritativeCopy',
				'autoMatch', 'shared', 'password',
			];
			for (const field of simpleFields) {
				if (additionalFields[field] !== undefined && additionalFields[field] !== '') {
					body[field] = additionalFields[field];
				}
			}

			// Notification
			if (additionalFields.expireAfter || additionalFields.reminderDelay || additionalFields.reminderFrequency) {
				const notification: IDataObject = {};
				if (additionalFields.expireAfter) {
					notification.expirations = { expireEnabled: 'true', expireAfter: String(additionalFields.expireAfter) };
				}
				// Either value turns reminders on; an unset one keeps its earlier default.
				if (additionalFields.reminderDelay || additionalFields.reminderFrequency) {
					notification.reminders = {
						reminderEnabled: 'true',
						reminderDelay: String(additionalFields.reminderDelay || 3),
						reminderFrequency: String(additionalFields.reminderFrequency || 2),
					};
				}
				body.notification = completeNotification(notification);
			}

			return docuSignRequest(ctx, 'POST', basePath, body);
		}

		case 'get': {
			const tmplPath = templatePath(
				ctx.getNodeParameter('accountId', i) as string,
				ctx.getNodeParameter('templateId', i) as string,
			);
			return docuSignRequest(ctx, 'GET', tmplPath);
		}

		case 'getAll': {
			const maxResults = ctx.getNodeParameter('maxResults', i, 100) as number;
			const filters = ctx.getNodeParameter('filters', i, {}) as IDataObject;
			const qs: IDataObject = {};
			if (filters.searchText) qs.search_text = filters.searchText;
			// DocuSign has no folder parameter; Folder is a single folder ID, so it joins folder_ids.
			const folderIds = [filters.folder, filters.folderIds].filter(Boolean).map(String).join(',');
			if (folderIds) qs.folder_ids = folderIds;
			if (filters.sharedByMe) qs.shared_by_me = filters.sharedByMe;
			if (filters.orderBy) qs.order_by = filters.orderBy;
			if (filters.order) qs.order = filters.order;
			return docuSignGetAll(ctx, 'GET', basePath, 'envelopeTemplates', qs, maxResults);
		}

		case 'update': {
			const tmplPath = templatePath(
				ctx.getNodeParameter('accountId', i) as string,
				ctx.getNodeParameter('templateId', i) as string,
			);
			const updateFields = ctx.getNodeParameter('updateFields', i, {}) as IDataObject;
			const body: IDataObject = {};
			for (const [key, value] of Object.entries(updateFields)) {
				if (value !== undefined && value !== '') body[key] = value;
			}
			return docuSignRequest(ctx, 'PUT', tmplPath, body);
		}

		case 'deleteDocumentPage': {
			const tmplPath = templatePath(
				ctx.getNodeParameter('accountId', i) as string,
				ctx.getNodeParameter('templateId', i) as string,
			);
			const documentId = assertSafeId(ctx.getNodeParameter('documentId', i) as string, 'Document ID');
			const pageNumber = assertSafeId(ctx.getNodeParameter('pageNumber', i) as string, 'Page Number');
			return docuSignRequest(ctx, 'DELETE', `${tmplPath}/documents/${documentId}/pages/${pageNumber}`);
		}

		case 'getNotificationSettings': {
			const tmplPath = templatePath(
				ctx.getNodeParameter('accountId', i) as string,
				ctx.getNodeParameter('templateId', i) as string,
			);
			return docuSignRequest(ctx, 'GET', `${tmplPath}/notification`);
		}

		case 'updateNotificationSettings': {
			const tmplPath = templatePath(
				ctx.getNodeParameter('accountId', i) as string,
				ctx.getNodeParameter('templateId', i) as string,
			);
			// Sends exactly what was set, nested as DocuSign expects; 0 stays 0 (e.g. no warning email).
			const settings = ctx.getNodeParameter('notificationSettings', i, {}) as IDataObject;
			return docuSignRequest(ctx, 'PUT', `${tmplPath}/notification`, buildNotificationBody(settings));
		}

		case 'getPageImages': {
			const tmplPath = templatePath(
				ctx.getNodeParameter('accountId', i) as string,
				ctx.getNodeParameter('templateId', i) as string,
			);
			const documentId = assertSafeId(ctx.getNodeParameter('documentId', i) as string, 'Document ID');
			return docuSignRequest(ctx, 'GET', `${tmplPath}/documents/${documentId}/pages`);
		}

		case 'rotateDocumentPage': {
			const tmplPath = templatePath(
				ctx.getNodeParameter('accountId', i) as string,
				ctx.getNodeParameter('templateId', i) as string,
			);
			const documentId = assertSafeId(ctx.getNodeParameter('documentId', i) as string, 'Document ID');
			const pageNumber = assertSafeId(ctx.getNodeParameter('pageNumber', i) as string, 'Page Number');
			// DocuSign's pageRequest.rotate accepts only left or right, each a 90 degree turn.
			const rotation = ctx.getNodeParameter('rotation', i) as string;
			const turns = ROTATION_TURNS[rotation];
			if (!turns) throw new NodeOperationError(ctx.getNode(), `Unsupported rotation: ${rotation}`, { itemIndex: i });
			const pagePath = `${tmplPath}/documents/${documentId}/pages/${pageNumber}/page_image`;
			let result: unknown;
			for (const rotate of turns) result = await docuSignRequest(ctx, 'PUT', pagePath, { rotate });
			return result;
		}

		case 'updateGroupShare': {
			const templateId = assertSafeId(ctx.getNodeParameter('templateId', i) as string, 'Template ID');
			const groupIds = (ctx.getNodeParameter('groupIds', i) as string)
				.split(',').map((s) => s.trim()).filter(Boolean);
			const groups = groupIds.map((gid) => ({ groupId: assertSafeId(gid, 'Group ID') }));
			return docuSignRequest(ctx, 'PUT', `${acctPath}/templates/${templateId}/groups`, {
				groups,
			});
		}

		case 'deleteGroupShare': {
			const templateId = assertSafeId(ctx.getNodeParameter('templateId', i) as string, 'Template ID');
			const groupIds = (ctx.getNodeParameter('groupIds', i) as string)
				.split(',').map((s) => s.trim()).filter(Boolean);
			const groups = groupIds.map((gid) => ({ groupId: assertSafeId(gid, 'Group ID') }));
			return docuSignRequest(ctx, 'DELETE', `${acctPath}/templates/${templateId}/groups`, {
				groups,
			});
		}

		default:
			throw new Error(`Unsupported template operation: ${operation}`);
	}
}
