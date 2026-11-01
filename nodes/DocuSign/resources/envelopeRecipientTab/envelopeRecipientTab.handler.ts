import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, envelopePath, assertSafeId } from '../../transport';
import { buildTabList } from '../../utils/tabBuilder';

const VALID_TAB_TYPES = new Set([
	'signHereTabs', 'initialHereTabs', 'dateSignedTabs', 'textTabs',
	'numberTabs', 'dateTabs', 'checkboxTabs', 'listTabs', 'radioGroupTabs',
	'formulaTabs', 'noteTabs', 'fullNameTabs', 'emailTabs', 'companyTabs',
	'titleTabs', 'approveTabs', 'declineTabs', 'viewTabs',
	'emailAddressTabs', 'ssnTabs', 'zipTabs',
]);

function assertValidTabType(value: string): string {
	if (!VALID_TAB_TYPES.has(value)) {
		throw new Error(`Invalid tab type. Must be one of: ${[...VALID_TAB_TYPES].join(', ')}`);
	}
	return value;
}

/**
 * Handle Envelope Recipient Tab operations.
 */
export async function handleEnvelopeRecipientTab(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const recipientId = assertSafeId(
		ctx.getNodeParameter('recipientId', i) as string,
		'Recipient ID',
	);
	const basePath = `${envelopePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('envelopeId', i) as string,
	)}/recipients/${recipientId}/tabs`;

	switch (operation) {
		case 'list': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'create': {
			const tabType = assertValidTabType(
				ctx.getNodeParameter('tabType', i) as string,
			);
			const tabs = buildTabList(ctx, i);
			return docuSignRequest(ctx, 'POST', basePath, { [tabType]: tabs });
		}

		case 'update': {
			const tabType = assertValidTabType(
				ctx.getNodeParameter('tabType', i) as string,
			);
			const sendEmptyValues = ctx.getNodeParameter('sendEmptyValues', i, false) as boolean;
			const tabs = buildTabList(ctx, i, sendEmptyValues);
			return docuSignRequest(ctx, 'PUT', basePath, { [tabType]: tabs });
		}

		case 'delete': {
			const tabType = assertValidTabType(
				ctx.getNodeParameter('tabType', i) as string,
			);
			const tabIdsRaw = ctx.getNodeParameter('tabIds', i, '') as string;
			const tabIds = tabIdsRaw.split(',').map((s) => s.trim()).filter(Boolean);

			const tabsToDelete = tabIds.map((id) => ({
				tabId: assertSafeId(id, 'Tab ID'),
			}));

			return docuSignRequest(ctx, 'DELETE', basePath, {
				[tabType]: tabsToDelete,
			});
		}

		default:
			throw new Error(`Unsupported envelope recipient tab operation: ${operation}`);
	}
}
