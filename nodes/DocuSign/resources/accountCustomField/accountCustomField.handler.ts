import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all Account Custom Field operations.
 */
export async function handleAccountCustomField(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
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
			const fieldId = assertSafeId(
				ctx.getNodeParameter('customFieldId', i) as string,
				'Custom Field ID',
			);
			const body = buildCustomFieldBody(ctx, i);
			return docuSignRequest(ctx, 'PUT', `${basePath}/${fieldId}`, body);
		}

		case 'delete': {
			const fieldId = assertSafeId(
				ctx.getNodeParameter('customFieldId', i) as string,
				'Custom Field ID',
			);
			return docuSignRequest(ctx, 'DELETE', `${basePath}/${fieldId}`);
		}

		default:
			throw new Error(`Unsupported account custom field operation: ${operation}`);
	}
}

function buildCustomFieldBody(ctx: IExecuteFunctions, i: number): IDataObject {
	const fieldType = ctx.getNodeParameter('fieldType', i) as string;
	const name = ctx.getNodeParameter('name', i) as string;
	const additionalFields = ctx.getNodeParameter('additionalFields', i, {}) as IDataObject;

	// The spec's customField names the type customFieldType (text or list).
	const body: IDataObject = {
		customFieldType: fieldType,
		name,
	};

	if (additionalFields.required !== undefined) {
		body.required = additionalFields.required;
	}
	if (additionalFields.show !== undefined) {
		body.show = additionalFields.show;
	}
	if (additionalFields.value !== undefined) {
		body.value = additionalFields.value;
	}
	if (additionalFields.listItems) {
		body.listItems = String(additionalFields.listItems)
			.split(';')
			.map((s: string) => s.trim());
	}

	return body;
}
