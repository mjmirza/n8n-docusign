import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { applyDeliveryMethod, buildRecipientEmailNotification } from '../../utils/recipientDelivery';
import {
	docuSignRequest,
	docuSignGetAll,
	assertSafeId,
	envelopePath,
	accountPath,
} from '../../transport';
import { buildNotificationBody, completeNotification } from '../../utils/notification';

/**
 * Build the recipients object with signer tabs from node parameters.
 */
function buildSignerTabs(
	ctx: IExecuteFunctions,
	i: number,
): Record<string, unknown>[] | undefined {
	const additionalFields = ctx.getNodeParameter(
		'additionalFields',
		i,
		{},
	) as IDataObject;
	const signHereTabsData = additionalFields.signHereTabs as
		| IDataObject
		| undefined;
	if (!signHereTabsData?.tab) return undefined;

	const tabs = signHereTabsData.tab as Array<{
		recipientId: string;
		documentId: string;
		pageNumber: string;
		placementMethod: string;
		anchorString?: string;
		anchorXOffset?: string;
		anchorYOffset?: string;
		xPosition?: string;
		yPosition?: string;
	}>;

	const tabsByRecipient: Record<string, unknown[]> = {};
	for (const tab of tabs) {
		if (!tabsByRecipient[tab.recipientId]) {
			tabsByRecipient[tab.recipientId] = [];
		}

		const signHereTab: IDataObject = {
			documentId: tab.documentId,
			pageNumber: tab.pageNumber,
		};

		if (tab.placementMethod === 'anchor' && tab.anchorString) {
			signHereTab.anchorString = tab.anchorString;
			if (tab.anchorXOffset)
				signHereTab.anchorXOffset = tab.anchorXOffset;
			if (tab.anchorYOffset)
				signHereTab.anchorYOffset = tab.anchorYOffset;
		} else {
			signHereTab.xPosition = tab.xPosition || '100';
			signHereTab.yPosition = tab.yPosition || '100';
		}

		tabsByRecipient[tab.recipientId].push(signHereTab);
	}

	return Object.entries(tabsByRecipient).map(
		([recipientId, signHereTabs]) => ({
			recipientId,
			tabs: { signHereTabs },
		}),
	);
}

/**
 * Handle all Envelope resource operations.
 */
export async function handleEnvelope(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const accountId = ctx.getNodeParameter('accountId', i) as string;
	const basePath = `${accountPath(accountId)}/envelopes`;

	switch (operation) {
		case 'create': {
			const emailSubject = ctx.getNodeParameter(
				'emailSubject',
				i,
			) as string;
			const status = ctx.getNodeParameter('status', i) as string;
			const additionalFields = ctx.getNodeParameter(
				'additionalFields',
				i,
				{},
			) as IDataObject;

			// Build signers with all DocuSign signer fields
			const signersData = ctx.getNodeParameter('signers', i, {}) as IDataObject;
			const signersList = (signersData.signer || []) as IDataObject[];

			const signers = signersList.map((s) => {
				const signer: IDataObject = {
					email: s.email as string,
					name: s.name as string,
					recipientId: (s.recipientId as string) || '1',
					routingOrder: (s.routingOrder as string) || '1',
				};
				if (s.clientUserId) signer.clientUserId = s.clientUserId;
				if (s.accessCode) signer.accessCode = s.accessCode;
				if (s.roleName) signer.roleName = s.roleName;
				if (s.note) signer.note = s.note;
				applyDeliveryMethod(signer, s.deliveryMethod, s.phoneNumber);
				if (s.idCheckConfigurationName) signer.idCheckConfigurationName = s.idCheckConfigurationName;
				// An ID check only applies with requireIdLookup true, so choosing one turns it on.
				if (s.requireIdLookup === 'true' || s.idCheckConfigurationName) signer.requireIdLookup = 'true';
				if (s.requireSignOnPaper === 'true') signer.requireSignOnPaper = 'true';
				if (s.embeddedRecipientStartURL) signer.embeddedRecipientStartURL = s.embeddedRecipientStartURL;
				// Per-recipient email notification override; a language alone is enough to send it.
				const emailNotification = buildRecipientEmailNotification(s);
				if (emailNotification) signer.emailNotification = emailNotification;
				return signer;
			});

			// Apply tabs to signers if configured
			const tabOverrides = buildSignerTabs(ctx, i);
			if (tabOverrides) {
				for (const override of tabOverrides) {
					const signer = signers.find(
						(s) =>
							String(s.recipientId) ===
							String(override.recipientId),
					);
					if (signer) {
						signer.tabs = (override as IDataObject).tabs;
					}
				}
			}

			// Build documents with all DocuSign document fields
			const documentsData = ctx.getNodeParameter('documents', i, {}) as IDataObject;
			const documentsList = (documentsData.document || []) as IDataObject[];

			const documents: IDataObject[] = [];
			for (const doc of documentsList) {
				const document: IDataObject = {
					name: doc.name as string,
					documentId: (doc.documentId as string) || '1',
					fileExtension: doc.fileExtension as string,
				};

				// Document content source
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

				// Optional document fields
				if (doc.order && Number(doc.order) > 0) document.order = String(doc.order);
				if (doc.transformPdfFields === 'true') document.transformPdfFields = 'true';
				if (doc.display) document.display = doc.display;
				if (doc.includeInDownload === 'false') document.includeInDownload = 'false';
				if (doc.signerMustAcknowledge) document.signerMustAcknowledge = doc.signerMustAcknowledge;
				if (doc.authoritativeCopy === 'true') document.authoritativeCopy = 'true';

				documents.push(document);
			}

			// Build envelope body
			const recipients: IDataObject = { signers };
			const body: IDataObject = { emailSubject, status, documents, recipients };

			// Helper to extract recipient list from additionalFields fixedCollection
			const extractRecipients = (key: string, childKey: string): IDataObject[] | undefined => {
				const data = additionalFields[key] as IDataObject | undefined;
				if (!data?.[childKey]) return undefined;
				return (data[childKey] as IDataObject[]).map((r) => {
					const recipient: IDataObject = {};
					for (const [k, v] of Object.entries(r)) {
						if (v !== '' && v !== undefined && v !== null) recipient[k] = v;
					}
					return recipient;
				});
			};

			// All recipient types
			const ccList = extractRecipients('carbonCopies', 'recipient');
			if (ccList) recipients.carbonCopies = ccList;

			const agentList = extractRecipients('agents', 'agent');
			if (agentList) recipients.agents = agentList;

			const editorList = extractRecipients('editors', 'editor');
			if (editorList) recipients.editors = editorList;

			const intermediaryList = extractRecipients('intermediaries', 'intermediary');
			if (intermediaryList) recipients.intermediaries = intermediaryList;

			const certifiedList = extractRecipients('certifiedDeliveries', 'recipient');
			if (certifiedList) recipients.certifiedDeliveries = certifiedList;

			const witnessList = extractRecipients('witnesses', 'witness');
			if (witnessList) recipients.witnesses = witnessList;

			const inPersonList = extractRecipients('inPersonSigners', 'inPersonSigner');
			if (inPersonList) recipients.inPersonSigners = inPersonList;

			// Envelope-level fields from additionalFields
			const simpleFields = [
				'emailBlurb', 'brandId', 'signingLocation', 'envelopeIdStamping',
				'allowMarkup', 'allowReassign', 'enableWetSign', 'enforceSignerVisibility',
				'disableResponsiveDocument', 'useDisclosure', 'messageLock',
				'recipientsLock', 'authoritativeCopy', 'autoNavigation', 'transactionId',
			];
			for (const field of simpleFields) {
				if (additionalFields[field] !== undefined && additionalFields[field] !== '') {
					body[field] = additionalFields[field];
				}
			}

			// Notification settings
			if (additionalFields.expireAfter || additionalFields.reminderDelay || additionalFields.reminderFrequency) {
				const notification: IDataObject = {};
				if (additionalFields.expireAfter) {
					notification.expirations = {
						expireEnabled: 'true',
						expireAfter: String(additionalFields.expireAfter),
					};
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

			// Event notification (per-envelope webhook)
			const eventData = additionalFields.eventNotification as IDataObject | undefined;
			if (eventData?.config) {
				const configs = eventData.config as IDataObject[];
				if (configs.length > 0) {
					const cfg = configs[0];
					const envelopeEvents = cfg.envelopeEvents
						? String(cfg.envelopeEvents).split(',').map((e: string) => ({
							envelopeEventStatusCode: e.trim(),
						}))
						: [];
					const recipientEvents = cfg.recipientEvents
						? String(cfg.recipientEvents).split(',').map((e: string) => ({
							recipientEventStatusCode: e.trim(),
						}))
						: [];
					body.eventNotification = {
						url: cfg.url,
						loggingEnabled: cfg.loggingEnabled || 'true',
						requireAcknowledgment: cfg.requireAcknowledgment || 'true',
						includeDocuments: cfg.includeDocuments || 'false',
						envelopeEvents,
						recipientEvents,
					};
				}
			}

			return docuSignRequest(ctx, 'POST', basePath, body);
		}

		case 'createFromTemplate': {
			const templateId = assertSafeId(
				ctx.getNodeParameter('templateId', i) as string,
				'Template ID',
			);
			const templateStatus = ctx.getNodeParameter(
				'templateStatus',
				i,
			) as string;
			const templateEmailSubject = ctx.getNodeParameter(
				'templateEmailSubject',
				i,
				'',
			) as string;

			const rolesData = ctx.getNodeParameter(
				'templateRoles',
				i,
				{},
			) as IDataObject;
			const rolesList = (rolesData.role || []) as IDataObject[];
			const templateRoles = rolesList.map(buildTemplateRole);

			const body: IDataObject = {
				templateId,
				templateRoles,
				status: templateStatus,
			};

			if (templateEmailSubject) {
				body.emailSubject = templateEmailSubject;
			}

			return docuSignRequest(ctx, 'POST', basePath, body);
		}

		case 'get': {
			const envelopeId = assertSafeId(
				ctx.getNodeParameter('envelopeId', i) as string,
				'Envelope ID',
			);
			return docuSignRequest(
				ctx,
				'GET',
				`${basePath}/${envelopeId}`,
			);
		}

		case 'getAll': {
			const maxResults = ctx.getNodeParameter(
				'maxResults',
				i,
				100,
			) as number;
			const filters = ctx.getNodeParameter(
				'filters',
				i,
				{},
			) as IDataObject;

			const qs = buildEnvelopeListQuery(filters);

			return docuSignGetAll(
				ctx,
				'GET',
				basePath,
				'envelopes',
				qs,
				maxResults,
			);
		}

		case 'update': {
			const envelopeId = assertSafeId(
				ctx.getNodeParameter('envelopeId', i) as string,
				'Envelope ID',
			);
			const updateFields = ctx.getNodeParameter(
				'updateFields',
				i,
				{},
			) as IDataObject;

			const body = buildEnvelopeUpdateBody(updateFields);
			if (body.status === 'voided' && !body.voidedReason) {
				throw new NodeOperationError(ctx.getNode(), 'Voided Reason is required when Status is Voided', {
					itemIndex: i,
				});
			}

			return docuSignRequest(
				ctx,
				'PUT',
				`${basePath}/${envelopeId}`,
				body,
			);
		}

		case 'send': {
			const envelopeId = assertSafeId(
				ctx.getNodeParameter('envelopeId', i) as string,
				'Envelope ID',
			);
			return docuSignRequest(
				ctx,
				'PUT',
				`${basePath}/${envelopeId}`,
				{ status: 'sent' },
			);
		}

		case 'void': {
			const envelopeId = assertSafeId(
				ctx.getNodeParameter('envelopeId', i) as string,
				'Envelope ID',
			);
			const voidReason = ctx.getNodeParameter(
				'voidReason',
				i,
			) as string;
			return docuSignRequest(
				ctx,
				'PUT',
				`${basePath}/${envelopeId}`,
				{ status: 'voided', voidedReason: voidReason },
			);
		}

		case 'delete': {
			const envelopeId = assertSafeId(
				ctx.getNodeParameter('envelopeId', i) as string,
				'Envelope ID',
			);
			// DocuSign deletes by moving the envelope into the recycle bin folder.
			// Voiding is a different action and fails for drafts and completed envelopes.
			await docuSignRequest(
				ctx,
				'PUT',
				`${accountPath(accountId)}/folders/recyclebin`,
				{ envelopeIds: [envelopeId] },
			);
			return { envelopeId, deleted: true };
		}

		case 'downloadDocuments': {
			const envelopeId = assertSafeId(
				ctx.getNodeParameter('envelopeId', i) as string,
				'Envelope ID',
			);
			const documentId = assertSafeId(
				ctx.getNodeParameter('documentId', i, 'combined') as string,
				'Document ID',
			);
			const binaryPropertyName = ctx.getNodeParameter(
				'binaryPropertyName',
				i,
				'data',
			) as string;

			const response = (await docuSignRequest(
				ctx,
				'GET',
				`${basePath}/${envelopeId}/documents/${documentId}`,
				undefined,
				undefined,
				{ encoding: null, json: false },
			)) as Buffer;

			const mimeType =
				documentId === 'archive'
					? 'application/zip'
					: 'application/pdf';
			const extension =
				documentId === 'archive' ? 'zip' : 'pdf';
			const fileName = `envelope_${envelopeId}_${documentId}.${extension}`;

			const binaryData = await ctx.helpers.prepareBinaryData(
				response,
				fileName,
				mimeType,
			);

			return {
				json: { envelopeId, documentId, fileName },
				binary: { [binaryPropertyName]: binaryData },
			} as INodeExecutionData;
		}

		case 'getSigningUrl': {
			const envelopeId = assertSafeId(
				ctx.getNodeParameter('envelopeId', i) as string,
				'Envelope ID',
			);
			const signerEmail = ctx.getNodeParameter(
				'signerEmail',
				i,
			) as string;
			const signerName = ctx.getNodeParameter(
				'signerName',
				i,
			) as string;
			const clientUserId = ctx.getNodeParameter(
				'signerClientUserId',
				i,
			) as string;
			const returnUrl = ctx.getNodeParameter(
				'returnUrl',
				i,
			) as string;

			return docuSignRequest(
				ctx,
				'POST',
				`${basePath}/${envelopeId}/views/recipient`,
				{
					email: signerEmail,
					userName: signerName,
					clientUserId,
					returnUrl,
					authenticationMethod: 'none',
				},
			);
		}

		case 'listAuditEvents': {
			const envPath = envelopePath(
				accountId,
				ctx.getNodeParameter('envelopeId', i) as string,
			);
			return docuSignRequest(
				ctx,
				'GET',
				`${envPath}/audit_events`,
			);
		}

		case 'listStatusChanges': {
			const filters = ctx.getNodeParameter(
				'filters',
				i,
				{},
			) as IDataObject;
			// Same filters as Get Many, mapped to DocuSign's query names; returns one page.
			const qs = buildEnvelopeListQuery(filters);
			return docuSignRequest(
				ctx,
				'GET',
				basePath,
				undefined,
				qs,
			);
		}

		case 'getNotificationSettings': {
			const envPath = envelopePath(
				accountId,
				ctx.getNodeParameter('envelopeId', i) as string,
			);
			return docuSignRequest(
				ctx,
				'GET',
				`${envPath}/notification`,
			);
		}

		case 'updateNotificationSettings': {
			const envPath = envelopePath(
				accountId,
				ctx.getNodeParameter('envelopeId', i) as string,
			);
			const settings = ctx.getNodeParameter(
				'notificationSettings',
				i,
				{},
			) as IDataObject;
			return docuSignRequest(
				ctx,
				'PUT',
				`${envPath}/notification`,
				buildNotificationBody(settings),
			);
		}

		default:
			throw new Error(
				`Unsupported envelope operation: ${operation}`,
			);
	}
}

/** Maps one Template Role entry to the DocuSign templateRole shape, keeping every set field. */
export function buildTemplateRole(r: IDataObject): IDataObject {
	const role: IDataObject = {
		roleName: r.roleName,
		email: r.email,
		name: r.name,
	};
	if (r.clientUserId) role.clientUserId = r.clientUserId;
	if (r.accessCode) role.accessCode = r.accessCode;
	if (r.emailNotificationSubject || r.emailNotificationBody) {
		const emailNotification: IDataObject = {};
		if (r.emailNotificationSubject) emailNotification.emailSubject = r.emailNotificationSubject;
		if (r.emailNotificationBody) emailNotification.emailBody = r.emailNotificationBody;
		role.emailNotification = emailNotification;
	}
	applyDeliveryMethod(role, r.deliveryMethod, r.phoneNumber);
	return role;
}

/** Envelope Update fields as the v2.1 envelope model names them; unset options are left out. */
export function buildEnvelopeUpdateBody(fields: IDataObject): IDataObject {
	const body: IDataObject = {};
	for (const key of ['emailSubject', 'emailBlurb', 'brandId', 'purgeState', 'status', 'voidedReason']) {
		if (fields[key] !== undefined && fields[key] !== '') body[key] = fields[key];
	}
	for (const key of ['messageLock', 'recipientsLock']) {
		if (fields[key] !== undefined && fields[key] !== '') body[key] = String(fields[key]);
	}
	return body;
}


/** Maps the envelope Filters collection to GET /envelopes query names; from_date defaults to 30 days ago. */
export function buildEnvelopeListQuery(filters: IDataObject): IDataObject {
	const qs: IDataObject = {};
	if (filters.fromDate) qs.from_date = filters.fromDate;
	if (filters.toDate) qs.to_date = filters.toDate;
	if (filters.searchText) qs.search_text = filters.searchText;
	if (filters.folderIds) qs.folder_ids = filters.folderIds;
	if (filters.orderBy) qs.order_by = filters.orderBy;
	if (filters.order) qs.order = filters.order;
	if (Array.isArray(filters.status) && filters.status.length > 0) {
		qs.status = (filters.status as string[]).join(',');
	}
	// DocuSign requires from_date (or envelope IDs); default to the last 30 days.
	if (!qs.from_date) {
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		qs.from_date = thirtyDaysAgo.toISOString();
	}
	return qs;
}
