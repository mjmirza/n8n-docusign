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
			{ name: 'Approve', value: 'approveTabs' },
			{ name: 'Checkbox', value: 'checkboxTabs' },
			{ name: 'Company', value: 'companyTabs' },
			{ name: 'Date', value: 'dateTabs' },
			{ name: 'Date Signed', value: 'dateSignedTabs' },
			{ name: 'Decline', value: 'declineTabs' },
			{ name: 'Email', value: 'emailTabs' },
			{ name: 'Email Address', value: 'emailAddressTabs' },
			{ name: 'Formula', value: 'formulaTabs' },
			{ name: 'Full Name', value: 'fullNameTabs' },
			{ name: 'Initial Here', value: 'initialHereTabs' },
			{ name: 'List (Dropdown)', value: 'listTabs' },
			{ name: 'Note', value: 'noteTabs' },
			{ name: 'Number', value: 'numberTabs' },
			{ name: 'Radio Group', value: 'radioGroupTabs' },
			{ name: 'Sign Here', value: 'signHereTabs' },
			{ name: 'SSN', value: 'ssnTabs' },
			{ name: 'Text', value: 'textTabs' },
			{ name: 'Title', value: 'titleTabs' },
			{ name: 'View', value: 'viewTabs' },
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
					{ displayName: 'Anchor Case Sensitive', name: 'anchorCaseSensitive', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
					{ displayName: 'Anchor Horizontal Alignment', name: 'anchorHorizontalAlignment', type: 'options', options: [{ name: 'Left', value: 'left' }, { name: 'Right', value: 'right' }], default: 'left' },
					{ displayName: 'Anchor Ignore If Not Present', name: 'anchorIgnoreIfNotPresent', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false', description: 'Ignore anchor if string not found in document' },
					{ displayName: 'Anchor Match Whole Word', name: 'anchorMatchWholeWord', type: 'options', options: [{ name: 'DocuSign Default', value: '' }, { name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: '', description: 'DocuSign Default leaves the setting to DocuSign, as earlier versions did' },
					{ displayName: 'Anchor String', name: 'anchorString', type: 'string', default: '', displayOptions: { show: { placementMethod: ['anchor'] } } },
					{ displayName: 'Anchor Units', name: 'anchorUnits', type: 'options', options: [{ name: 'Pixels', value: 'pixels' }, { name: 'Inches', value: 'inches' }, { name: 'CMs', value: 'cms' }, { name: 'MMs', value: 'mms' }], default: 'pixels', displayOptions: { show: { placementMethod: ['anchor'] } } },
					{ displayName: 'Anchor X Offset', name: 'anchorXOffset', type: 'string', default: '0', displayOptions: { show: { placementMethod: ['anchor'] } } },
					{ displayName: 'Anchor Y Offset', name: 'anchorYOffset', type: 'string', default: '0', displayOptions: { show: { placementMethod: ['anchor'] } } },
					{ displayName: 'Bold', name: 'bold', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
					{ displayName: 'Conceal Value on Document', name: 'concealValueOnDocument', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false', description: 'Mask the value on the document' },
					{ displayName: 'Conditional Parent Label', name: 'conditionalParentLabel', type: 'string', default: '', description: 'Tab label of the parent tab for conditional visibility' },
					{ displayName: 'Conditional Parent Value', name: 'conditionalParentValue', type: 'string', default: '', description: 'Value of the parent tab that makes this tab visible' },
					{ displayName: 'Custom Tab ID', name: 'customTabId', type: 'string', default: '', description: 'Link to a custom tab definition' },
					{ displayName: 'Disable Auto Size', name: 'disableAutoSize', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
					{ displayName: 'Document ID', name: 'documentId', type: 'string', default: '1', required: true },
					{ displayName: 'Font', name: 'font', type: 'options', options: [{ name: 'Arial', value: 'arial' }, { name: 'Calibri', value: 'calibri' }, { name: 'Courier New', value: 'courierNew' }, { name: 'Default', value: 'default' }, { name: 'Georgia', value: 'georgia' }, { name: 'Helvetica', value: 'helvetica' }, { name: 'Lucida Console', value: 'lucidaConsole' }, { name: 'MS Gothic', value: 'msGothic' }, { name: 'MS Mincho', value: 'msMincho' }, { name: 'OCR-A', value: 'ocrA' }, { name: 'Tahoma', value: 'tahoma' }, { name: 'Times New Roman', value: 'timesNewRoman' }, { name: 'Trebuchet', value: 'trebuchet' }, { name: 'Verdana', value: 'verdana' }], default: 'default' },
					{ displayName: 'Font Color', name: 'fontColor', type: 'options', options: [{ name: 'Account Default', value: '' }, { name: 'Black', value: 'Black' }, { name: 'Bright Blue', value: 'BrightBlue' }, { name: 'Bright Red', value: 'BrightRed' }, { name: 'Dark Green', value: 'DarkGreen' }, { name: 'Dark Red', value: 'DarkRed' }, { name: 'Gold', value: 'Gold' }, { name: 'Green', value: 'Green' }, { name: 'Navy Blue', value: 'NavyBlue' }, { name: 'Purple', value: 'Purple' }, { name: 'White', value: 'White' }], default: '', description: 'Font color DocuSign uses for the tab text' },
					{ displayName: 'Font Size', name: 'fontSize', type: 'options', options: [{ name: 'Account Default', value: '' }, { name: 'Size 10', value: 'size10' }, { name: 'Size 11', value: 'size11' }, { name: 'Size 12', value: 'size12' }, { name: 'Size 14', value: 'size14' }, { name: 'Size 16', value: 'size16' }, { name: 'Size 18', value: 'size18' }, { name: 'Size 20', value: 'size20' }, { name: 'Size 22', value: 'size22' }, { name: 'Size 24', value: 'size24' }, { name: 'Size 26', value: 'size26' }, { name: 'Size 28', value: 'size28' }, { name: 'Size 36', value: 'size36' }, { name: 'Size 48', value: 'size48' }, { name: 'Size 7', value: 'size7' }, { name: 'Size 72', value: 'size72' }, { name: 'Size 8', value: 'size8' }, { name: 'Size 9', value: 'size9' }], default: '', description: 'Account Default leaves the size to the DocuSign account setting' },
					{ displayName: 'Formula', name: 'formula', type: 'string', default: '', description: 'Calculation for a formula tab, for example [Price]*[Quantity]' },
					{ displayName: 'Group Name', name: 'groupName', type: 'string', default: '', description: 'Radio group name for a radio group tab' },
					{ displayName: 'Height', name: 'height', type: 'number', default: 0, description: 'Tab height in pixels (0 = auto)' },
					{ displayName: 'Italic', name: 'italic', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
					{ displayName: 'List Items (JSON)', name: 'listItems', type: 'json', default: '', description: 'Dropdown choices for a list tab, as a JSON array of objects with text and value' },
					{ displayName: 'Locked', name: 'locked', type: 'options', options: [{ name: 'Default', value: '' }, { name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: '' },
					{ displayName: 'Max Length', name: 'maxLength', type: 'number', default: 0, description: 'Max characters for text tabs (0 = unlimited)' },
					{ displayName: 'Name', name: 'name', type: 'string', default: '', description: 'Tab name (distinct from tabLabel)' },
					{ displayName: 'Optional', name: 'optional', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
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
					{ displayName: 'Radios (JSON)', name: 'radios', type: 'json', default: '', description: 'Buttons for a radio group tab, as a JSON array of objects with value, pageNumber, xPosition and yPosition' },
					{ displayName: 'Recipient ID', name: 'recipientId', type: 'string', default: '', description: 'Override the recipient for this specific tab' },
					{ displayName: 'Required', name: 'required', type: 'options', options: [{ name: 'Default', value: '' }, { name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: '' },
					{ displayName: 'Sender Required', name: 'senderRequired', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false', description: 'Sender must fill this tab before sending' },
					{ displayName: 'Shared', name: 'shared', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false', description: 'Share this tab across all recipients' },
					{ displayName: 'Tab Group Labels', name: 'tabGroupLabels', type: 'string', default: '', description: 'Comma-separated group labels to assign this tab to' },
					{ displayName: 'Tab ID', name: 'tabId', type: 'string', default: '', description: 'Required for update operations' },
					{ displayName: 'Tab Label', name: 'tabLabel', type: 'string', default: '' },
					{ displayName: 'Tab Order', name: 'tabOrder', type: 'string', default: '', description: 'Tab navigation order' },
					{ displayName: 'Tooltip', name: 'tooltip', type: 'string', default: '', description: 'Tooltip text shown on hover' },
					{ displayName: 'Underline', name: 'underline', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
					{ displayName: 'Validation Message', name: 'validationMessage', type: 'string', default: '', description: 'Error message shown when validation fails' },
					{ displayName: 'Validation Pattern', name: 'validationPattern', type: 'string', default: '', description: 'Regex pattern to validate tab input' },
					{ displayName: 'Value', name: 'value', type: 'string', default: '', description: 'Pre-filled value (for text/number/date tabs)' },
					{ displayName: 'Width', name: 'width', type: 'number', default: 0, description: 'Tab width in pixels (0 = auto)' },
					{ displayName: 'X Position', name: 'xPosition', type: 'string', default: '100', displayOptions: { show: { placementMethod: ['fixed'] } } },
					{ displayName: 'Y Position', name: 'yPosition', type: 'string', default: '100', displayOptions: { show: { placementMethod: ['fixed'] } } },
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
	{
		displayName: 'Send Empty and No Values',
		name: 'sendEmptyValues',
		type: 'boolean',
		default: false,
		description:
			'Whether to also send fields left empty or set to No, so an update can clear text, unlock a tab or turn Required off. Off sends only filled-in fields, as before.',
		displayOptions: {
			show: { resource: ['envelopeRecipientTab'], operation: ['update'] },
		},
	},
];
