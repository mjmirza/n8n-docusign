import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, templatePath, assertSafeId } from '../../transport';

/**
 * Handle all Template Custom Field operations.
 */
export async function handleTemplateCustomField(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${templatePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('templateId', i) as string,
	)}/custom_fields`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'create': {
			const body = buildCustomFieldBody(ctx, i);
			return docuSignRequest(ctx, 'POST', basePath, body);
		}

		case 'update': {
			const body = buildCustomFieldBody(ctx, i);
			return docuSignRequest(ctx, 'PUT', basePath, body);
		}

		case 'delete': {
			const fieldId = assertSafeId(
				ctx.getNodeParameter('customFieldId', i) as string,
				'Custom Field ID',
			);
			return docuSignRequest(ctx, 'DELETE', `${basePath}/${fieldId}`);
		}

		default:
			throw new Error(`Unsupported template custom field operation: ${operation}`);
	}
}

function buildCustomFieldBody(ctx: IExecuteFunctions, i: number): IDataObject {
	const body: IDataObject = {};

	const textData = ctx.getNodeParameter('textCustomFields', i, {}) as IDataObject;
	if (textData.field) {
		body.textCustomFields = (textData.field as IDataObject[]).map((f) => ({
			fieldId: f.fieldId || undefined,
			name: f.name,
			value: f.value || '',
			required: f.required || 'false',
			show: f.show || 'true',
		}));
	}

	const listData = ctx.getNodeParameter('listCustomFields', i, {}) as IDataObject;
	if (listData.field) {
		body.listCustomFields = (listData.field as IDataObject[]).map((f) => ({
			fieldId: f.fieldId || undefined,
			name: f.name,
			listItems: f.listItems ? String(f.listItems).split(';').map((s: string) => s.trim()) : [],
			value: f.value || '',
			required: f.required || 'false',
			show: f.show || 'true',
		}));
	}

	return body;
}
