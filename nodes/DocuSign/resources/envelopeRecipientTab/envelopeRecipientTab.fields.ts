import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, envelopeIdField, recipientIdField } from '../../utils/descriptions';

export const envelopeRecipientTabFields: INodeProperties[] = [
	accountIdField(['envelopeRecipientTab']),
	envelopeIdField(['envelopeRecipientTab']),
	recipientIdField(['envelopeRecipientTab']),

	// ------------------------------------------------------------------
	// Create / Update: Tab Definitions
	// ------------------------------------------------------------------
	{
		displayName: 'Tab Type',
		name: 'tabType',
		type: 'options',
		options: [
			{ name: 'Sign Here', value: 'signHereTabs' },
			{ name: 'Initial Here', value: 'initialHereTabs' },
			{ name: 'Date Signed', value: 'dateSignedTabs' },
			{ name: 'Text', value: 'textTabs' },
			{ name: 'Number', value: 'numberTabs' },
			{ name: 'Date', value: 'dateTabs' },
			{ name: 'Checkbox', value: 'checkboxTabs' },
			{ name: 'List (Dropdown)', value: 'listTabs' },
			{ name: 'Radio Group', value: 'radioGroupTabs' },
			{ name: 'Formula', value: 'formulaTabs' },
			{ name: 'Note', value: 'noteTabs' },
			{ name: 'Full Name', value: 'fullNameTabs' },
			{ name: 'Email', value: 'emailTabs' },
			{ name: 'Company', value: 'companyTabs' },
			{ name: 'Title', value: 'titleTabs' },
			{ name: 'Approve', value: 'approveTabs' },
			{ name: 'Decline', value: 'declineTabs' },
			{ name: 'View', value: 'viewTabs' },
			{ name: 'Email Address', value: 'emailAddressTabs' },
			{ name: 'SSN', value: 'ssnTabs' },
			{ name: 'ZIP', value: 'zipTabs' },
		],
		default: 'signHereTabs',
		displayOptions: {
			show: { resource: ['envelopeRecipientTab'], operation: ['create', 'update', 'delete'] },
		},
	},

	// ------------------------------------------------------------------
	// Tab Definitions (for create/update)
	// ------------------------------------------------------------------
	{
		displayName: 'Tabs',
		name: 'tabs',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: {},
		placeholder: 'Add Tab',
		displayOptions: {
			show: { resource: ['envelopeRecipientTab'], operation: ['create', 'update'] },
		},
		options: [
			{
				displayName: 'Tab',
				name: 'tab',
				values: [
					{ displayName: 'Document ID', name: 'documentId', type: 'string', default: '1', required: true },
					{ displayName: 'Page Number', name: 'pageNumber', type: 'string', default: '1', required: true },
					{
						displayName: 'Placement Method',
						name: 'placementMethod',
						type: 'options',
						options: [
							{ name: 'Anchor String', value: 'anchor' },
							{ name: 'Fixed Position (X/Y)', value: 'fixed' },
						],
						default: 'anchor',
					},
					{ displayName: 'Anchor String', name: 'anchorString', type: 'string', default: '', displayOptions: { show: { placementMethod: ['anchor'] } } },
					{ displayName: 'Anchor X Offset', name: 'anchorXOffset', type: 'string', default: '0', displayOptions: { show: { placementMethod: ['anchor'] } } },
					{ displayName: 'Anchor Y Offset', name: 'anchorYOffset', type: 'string', default: '0', displayOptions: { show: { placementMethod: ['anchor'] } } },
					{ displayName: 'Anchor Units', name: 'anchorUnits', type: 'options', options: [{ name: 'Pixels', value: 'pixels' }, { name: 'Inches', value: 'inches' }, { name: 'CMs', value: 'cms' }, { name: 'MMs', value: 'mms' }], default: 'pixels', displayOptions: { show: { placementMethod: ['anchor'] } } },
					{ displayName: 'X Position', name: 'xPosition', type: 'string', default: '100', displayOptions: { show: { placementMethod: ['fixed'] } } },
					{ displayName: 'Y Position', name: 'yPosition', type: 'string', default: '100', displayOptions: { show: { placementMethod: ['fixed'] } } },
					{ displayName: 'Tab Label', name: 'tabLabel', type: 'string', default: '' },
					{ displayName: 'Value', name: 'value', type: 'string', default: '', description: 'Pre-filled value (for text/number/date tabs)' },
					{ displayName: 'Required', name: 'required', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
					{ displayName: 'Locked', name: 'locked', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
					{ displayName: 'Font Size', name: 'fontSize', type: 'options', options: [{ name: 'Size 7', value: 'size7' }, { name: 'Size 8', value: 'size8' }, { name: 'Size 9', value: 'size9' }, { name: 'Size 10', value: 'size10' }, { name: 'Size 11', value: 'size11' }, { name: 'Size 12', value: 'size12' }, { name: 'Size 14', value: 'size14' }, { name: 'Size 16', value: 'size16' }, { name: 'Size 18', value: 'size18' }, { name: 'Size 20', value: 'size20' }, { name: 'Size 22', value: 'size22' }, { name: 'Size 24', value: 'size24' }, { name: 'Size 26', value: 'size26' }, { name: 'Size 28', value: 'size28' }, { name: 'Size 36', value: 'size36' }, { name: 'Size 48', value: 'size48' }, { name: 'Size 72', value: 'size72' }], default: 'size12' },
					{ displayName: 'Bold', name: 'bold', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
					{ displayName: 'Italic', name: 'italic', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
					{ displayName: 'Underline', name: 'underline', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
					{ displayName: 'Font', name: 'font', type: 'options', options: [{ name: 'Default', value: 'default' }, { name: 'Arial', value: 'arial' }, { name: 'Calibri', value: 'calibri' }, { name: 'Courier New', value: 'courierNew' }, { name: 'Georgia', value: 'georgia' }, { name: 'Helvetica', value: 'helvetica' }, { name: 'Lucida Console', value: 'lucidaConsole' }, { name: 'MS Gothic', value: 'msGothic' }, { name: 'MS Mincho', value: 'msMincho' }, { name: 'OCR-A', value: 'ocrA' }, { name: 'Tahoma', value: 'tahoma' }, { name: 'Times New Roman', value: 'timesNewRoman' }, { name: 'Trebuchet', value: 'trebuchet' }, { name: 'Verdana', value: 'verdana' }], default: 'default' },
					{ displayName: 'Font Color', name: 'fontColor', type: 'string', default: '', description: 'Font color as hex (e.g., "#000000") or color name (e.g., "Black", "Blue", "Red")' },
					{ displayName: 'Width', name: 'width', type: 'number', default: 0, description: 'Tab width in pixels (0 = auto)' },
					{ displayName: 'Height', name: 'height', type: 'number', default: 0, description: 'Tab height in pixels (0 = auto)' },
					{ displayName: 'Max Length', name: 'maxLength', type: 'number', default: 0, description: 'Max characters for text tabs (0 = unlimited)' },
					{ displayName: 'Validation Pattern', name: 'validationPattern', type: 'string', default: '', description: 'Regex pattern to validate tab input' },
					{ displayName: 'Validation Message', name: 'validationMessage', type: 'string', default: '', description: 'Error message shown when validation fails' },
					{ displayName: 'Tooltip', name: 'tooltip', type: 'string', default: '', description: 'Tooltip text shown on hover' },
					{ displayName: 'Tab Order', name: 'tabOrder', type: 'string', default: '', description: 'Tab navigation order' },
					{ displayName: 'Conceal Value on Document', name: 'concealValueOnDocument', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false', description: 'Mask the value on the document' },
					{ displayName: 'Conditional Parent Label', name: 'conditionalParentLabel', type: 'string', default: '', description: 'Tab label of the parent tab for conditional visibility' },
					{ displayName: 'Conditional Parent Value', name: 'conditionalParentValue', type: 'string', default: '', description: 'Value of the parent tab that makes this tab visible' },
					{ displayName: 'Shared', name: 'shared', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false', description: 'Share this tab across all recipients' },
					{ displayName: 'Sender Required', name: 'senderRequired', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false', description: 'Sender must fill this tab before sending' },
					{ displayName: 'Optional', name: 'optional', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
					{ displayName: 'Disable Auto Size', name: 'disableAutoSize', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
					{ displayName: 'Name', name: 'name', type: 'string', default: '', description: 'Tab name (distinct from tabLabel)' },
					{ displayName: 'Anchor Ignore If Not Present', name: 'anchorIgnoreIfNotPresent', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false', description: 'Ignore anchor if string not found in document' },
					{ displayName: 'Anchor Case Sensitive', name: 'anchorCaseSensitive', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
					{ displayName: 'Anchor Match Whole Word', name: 'anchorMatchWholeWord', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
					{ displayName: 'Anchor Horizontal Alignment', name: 'anchorHorizontalAlignment', type: 'options', options: [{ name: 'Left', value: 'left' }, { name: 'Center', value: 'center' }, { name: 'Right', value: 'right' }], default: 'left' },
					{ displayName: 'Custom Tab ID', name: 'customTabId', type: 'string', default: '', description: 'Link to a custom tab definition' },
					{ displayName: 'Tab Group Labels', name: 'tabGroupLabels', type: 'string', default: '', description: 'Comma-separated group labels to assign this tab to' },
					{ displayName: 'Recipient ID', name: 'recipientId', type: 'string', default: '', description: 'Override the recipient for this specific tab' },
					{ displayName: 'Tab ID', name: 'tabId', type: 'string', default: '', description: 'Required for update operations' },
				],
			},
		],
	},

	// ------------------------------------------------------------------
	// Delete: Tab IDs
	// ------------------------------------------------------------------
	{
		displayName: 'Tab IDs',
		name: 'tabIds',
		type: 'string',
		default: '',
		description: 'Comma-separated tab IDs to delete',
		displayOptions: {
			show: { resource: ['envelopeRecipientTab'], operation: ['delete'] },
		},
	},
];
