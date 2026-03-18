import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, templatePath, assertSafeId } from '../../transport';

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
 * Handle Template Recipient Tab operations.
 */
export async function handleTemplateRecipientTab(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const recipientId = assertSafeId(
		ctx.getNodeParameter('recipientId', i) as string,
		'Recipient ID',
	);
	const basePath = `${templatePath(
		ctx.getNodeParameter('accountId', i) as string,
		ctx.getNodeParameter('templateId', i) as string,
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
			const tabs = buildTabList(ctx, i);
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
			throw new Error(`Unsupported template recipient tab operation: ${operation}`);
	}
}

function buildTabList(ctx: IExecuteFunctions, i: number): IDataObject[] {
	const tabsData = ctx.getNodeParameter('tabs', i, {}) as IDataObject;
	const tabEntries = (tabsData.tab || []) as IDataObject[];

	return tabEntries.map((t) => {
		const tab: IDataObject = {
			documentId: t.documentId || '1',
			pageNumber: t.pageNumber || '1',
		};

		if (t.placementMethod === 'anchor' && t.anchorString) {
			tab.anchorString = t.anchorString;
			if (t.anchorXOffset) tab.anchorXOffset = t.anchorXOffset;
			if (t.anchorYOffset) tab.anchorYOffset = t.anchorYOffset;
			if (t.anchorUnits) tab.anchorUnits = t.anchorUnits;
		} else if (t.placementMethod === 'fixed') {
			tab.xPosition = t.xPosition || '100';
			tab.yPosition = t.yPosition || '100';
		}

		// Tab content and behavior
		if (t.tabLabel) tab.tabLabel = t.tabLabel;
		if (t.value) tab.value = t.value;
		if (t.required === 'true') tab.required = 'true';
		if (t.locked === 'true') tab.locked = 'true';
		if (t.optional === 'true') tab.optional = 'true';
		if (t.shared === 'true') tab.shared = 'true';
		if (t.senderRequired === 'true') tab.senderRequired = 'true';
		if (t.concealValueOnDocument === 'true') tab.concealValueOnDocument = 'true';
		if (t.disableAutoSize === 'true') tab.disableAutoSize = 'true';

		// Styling
		if (t.fontSize && t.fontSize !== 'size12') tab.fontSize = t.fontSize;
		if (t.bold === 'true') tab.bold = 'true';
		if (t.italic === 'true') tab.italic = 'true';
		if (t.underline === 'true') tab.underline = 'true';
		if (t.font && t.font !== 'default') tab.font = t.font;
		if (t.fontColor) tab.fontColor = t.fontColor;

		// Dimensions
		if (t.width && Number(t.width) > 0) tab.width = String(t.width);
		if (t.height && Number(t.height) > 0) tab.height = String(t.height);
		if (t.maxLength && Number(t.maxLength) > 0) tab.maxLength = String(t.maxLength);

		// Validation
		if (t.validationPattern) tab.validationPattern = t.validationPattern;
		if (t.validationMessage) tab.validationMessage = t.validationMessage;
		if (t.tooltip) tab.tooltip = t.tooltip;
		if (t.tabOrder) tab.tabOrder = t.tabOrder;
		if (t.name) tab.name = t.name;

		// Conditional visibility
		if (t.conditionalParentLabel) tab.conditionalParentLabel = t.conditionalParentLabel;
		if (t.conditionalParentValue) tab.conditionalParentValue = t.conditionalParentValue;

		// Anchor advanced options
		if (t.anchorIgnoreIfNotPresent === 'true') tab.anchorIgnoreIfNotPresent = 'true';
		if (t.anchorCaseSensitive === 'true') tab.anchorCaseSensitive = 'true';
		if (t.anchorMatchWholeWord === 'true') tab.anchorMatchWholeWord = 'true';
		if (t.anchorHorizontalAlignment && t.anchorHorizontalAlignment !== 'left') {
			tab.anchorHorizontalAlignment = t.anchorHorizontalAlignment;
		}

		// References
		if (t.customTabId) tab.customTabId = t.customTabId;
		if (t.recipientId) tab.recipientId = t.recipientId;
		if (t.tabGroupLabels) {
			tab.tabGroupLabels = String(t.tabGroupLabels).split(',').map((s: string) => s.trim());
		}

		if (t.tabId) tab.tabId = t.tabId;

		return tab;
	});
}
