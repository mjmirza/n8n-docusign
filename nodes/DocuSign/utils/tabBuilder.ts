import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

/** Yes/No tab properties; by default only Yes is sent, so No can only reach DocuSign explicitly. */
const FLAG_FIELDS = [
	'required', 'locked', 'optional', 'shared', 'senderRequired', 'concealValueOnDocument',
	'disableAutoSize', 'bold', 'italic', 'underline',
];

/** Text tab properties that an update may need to clear. */
const TEXT_FIELDS = [
	'tabLabel', 'value', 'validationPattern', 'validationMessage', 'tooltip', 'tabOrder', 'name',
	'conditionalParentLabel', 'conditionalParentValue', 'fontColor',
];

/** With Send Empty and No Values on, flags and text fields go out exactly as set, including No and empty. */
function applyExplicitValues(tab: IDataObject, t: IDataObject): void {
	for (const key of FLAG_FIELDS) {
		if (t[key] !== undefined) tab[key] = String(t[key]);
	}
	for (const key of TEXT_FIELDS) {
		if (t[key] !== undefined) tab[key] = String(t[key] ?? '');
	}
	if (t.fontSize !== undefined) tab.fontSize = t.fontSize;
	if (t.font !== undefined) tab.font = t.font;
}

/** List and radio tabs carry arrays; accept them as JSON text or as an expression-supplied array. */
function parseTabArray(ctx: IExecuteFunctions, i: number, raw: unknown, field: string): IDataObject[] | undefined {
	if (raw === undefined || raw === null || raw === '') return undefined;
	let value: unknown = raw;
	if (typeof raw === 'string') {
		try {
			value = JSON.parse(raw);
		} catch {
			throw new NodeOperationError(ctx.getNode(), `${field} must be a JSON array`, { itemIndex: i });
		}
	}
	if (!Array.isArray(value)) {
		throw new NodeOperationError(ctx.getNode(), `${field} must be a JSON array`, { itemIndex: i });
	}
	return value as IDataObject[];
}

export function buildTabList(ctx: IExecuteFunctions, i: number, sendEmptyValues = false): IDataObject[] {
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

		// List, radio group and formula configuration
		const listItems = parseTabArray(ctx, i, t.listItems, 'List Items');
		if (listItems) tab.listItems = listItems;
		const radios = parseTabArray(ctx, i, t.radios, 'Radios');
		if (radios) tab.radios = radios;
		if (t.groupName) tab.groupName = t.groupName;
		if (t.formula) tab.formula = t.formula;

		if (sendEmptyValues) applyExplicitValues(tab, t);
		return tab;
	});
}
