import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, templateIdField } from '../../utils/descriptions';

export const templateFields: INodeProperties[] = [
	accountIdField(['template']),
	templateIdField(['template'], ['get', 'update', 'deleteDocumentPage', 'getNotificationSettings', 'getPageImages', 'rotateDocumentPage', 'updateGroupShare', 'deleteGroupShare', 'updateNotificationSettings']),

	// ==================================================================
	// Create: All template fields
	// ==================================================================
	{
		displayName: 'Template Name',
		name: 'templateName',
		type: 'string',
		required: true,
		default: '',
		description: 'The name of the template',
		displayOptions: { show: { resource: ['template'], operation: ['create'] } },
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		description: 'A description of the template',
		displayOptions: { show: { resource: ['template'], operation: ['create'] } },
	},
	{
		displayName: 'Email Subject',
		name: 'emailSubject',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Please sign this document',
		description: 'Default email subject for envelopes created from this template',
		displayOptions: { show: { resource: ['template'], operation: ['create'] } },
	},
	{
		displayName: 'Documents',
		name: 'documents',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: {},
		placeholder: 'Add Document',
		displayOptions: { show: { resource: ['template'], operation: ['create'] } },
		options: [
			{
				displayName: 'Document',
				name: 'document',
				values: [
					{ displayName: 'Base64 Content', name: 'documentBase64', type: 'string', default: '', displayOptions: { show: { source: ['base64'] } } },
					{ displayName: 'Binary Property', name: 'binaryProperty', type: 'string', default: 'data', displayOptions: { show: { source: ['binary'] } } },
					{ displayName: 'Document ID', name: 'documentId', type: 'string', default: '1', required: true },
					{ displayName: 'Document Name', name: 'name', type: 'string', default: '', required: true },
					{ displayName: 'File Extension', name: 'fileExtension', type: 'options', options: [{ name: 'DOC', value: 'doc' }, { name: 'DOCX', value: 'docx' }, { name: 'HTML', value: 'html' }, { name: 'JPG', value: 'jpg' }, { name: 'PDF', value: 'pdf' }, { name: 'PNG', value: 'png' }, { name: 'TXT', value: 'txt' }], default: 'pdf' },
					{ displayName: 'Include in Download', name: 'includeInDownload', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'true' },
					{ displayName: 'Order', name: 'order', type: 'number', default: 0 },
					{ displayName: 'Remote URL', name: 'remoteUrl', type: 'string', default: '', displayOptions: { show: { source: ['remoteUrl'] } } },
					{
						displayName: 'Source',
						name: 'source',
						type: 'options',
						options: [
							{ name: 'Binary Data', value: 'binary' },
							{ name: 'Base64 String', value: 'base64' },
							{ name: 'Remote URL', value: 'remoteUrl' },
						],
						default: 'binary',
					},
					{ displayName: 'Transform PDF Fields', name: 'transformPdfFields', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
				],
			},
		],
	},
	{
		displayName: 'Recipients',
		name: 'recipients',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: {},
		placeholder: 'Add Recipient Role',
		displayOptions: { show: { resource: ['template'], operation: ['create'] } },
		options: [
			{
				displayName: 'Signer',
				name: 'signer',
				values: [
					{ displayName: 'Access Code', name: 'accessCode', type: 'string', default: '' },
					{ displayName: 'Default Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '', description: 'Default email (can be overridden when creating envelope)' },
					{ displayName: 'Default Name', name: 'name', type: 'string', default: '', description: 'Default name (can be overridden when creating envelope)' },
					{ displayName: 'Delivery Method', name: 'deliveryMethod', type: 'options', options: [{ name: 'Email', value: 'email' }, { name: 'SMS', value: 'sms' }], default: 'email' },
					{ displayName: 'Email Notification Body', name: 'emailNotificationBody', type: 'string', default: '' },
					{ displayName: 'Email Notification Subject', name: 'emailNotificationSubject', type: 'string', default: '' },
					{ displayName: 'ID Check Config Name', name: 'idCheckConfigurationName', type: 'options', options: [{ name: 'None', value: '' }, { name: 'ID Check $', value: 'ID Check $' }, { name: 'ID Check $$', value: 'ID Check $$' }], default: '' },
					{ displayName: 'Phone Number', name: 'phoneNumber', type: 'string', default: '', placeholder: '+14155550100', description: 'Phone number in international format, used when the delivery method is SMS' },
					{ displayName: 'Recipient ID', name: 'recipientId', type: 'string', default: '1' },
					{ displayName: 'Role Name', name: 'roleName', type: 'string', default: '', required: true, description: 'Role name (e.g., "Signer 1", "Manager")' },
					{ displayName: 'Routing Order', name: 'routingOrder', type: 'string', default: '1' },
				],
			},
		],
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['template'], operation: ['create'] } },
		options: [
			{ displayName: 'Allow Markup', name: 'allowMarkup', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
			{ displayName: 'Allow Reassign', name: 'allowReassign', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'true' },
			{ displayName: 'Authoritative Copy', name: 'authoritativeCopy', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
			{ displayName: 'Auto Match', name: 'autoMatch', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false', description: 'Auto-match templates to documents with similar content' },
			{ displayName: 'Brand ID', name: 'brandId', type: 'string', default: '' },
			{
				displayName: 'Carbon Copies',
				name: 'carbonCopies',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				default: {},
				options: [{ displayName: 'Recipient', name: 'recipient', values: [
					{ displayName: 'Default Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '' },
					{ displayName: 'Default Name', name: 'name', type: 'string', default: '' },
					{ displayName: 'Recipient ID', name: 'recipientId', type: 'string', default: '10' },
					{ displayName: 'Role Name', name: 'roleName', type: 'string', default: '', required: true },
					{ displayName: 'Routing Order', name: 'routingOrder', type: 'string', default: '2' },
				] }],
			},
			{ displayName: 'Email Blurb', name: 'emailBlurb', type: 'string', default: '' },
			{ displayName: 'Enable Wet Sign', name: 'enableWetSign', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
			{ displayName: 'Enforce Signer Visibility', name: 'enforceSignerVisibility', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
			{ displayName: 'Expire After (Days)', name: 'expireAfter', type: 'number', typeOptions: { minValue: 1, maxValue: 999 }, default: 120 },
			{ displayName: 'Message Lock', name: 'messageLock', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
			{ displayName: 'Password', name: 'password', type: 'string', typeOptions: { password: true }, default: '', description: 'Password to protect the template' },
			{ displayName: 'Recipients Lock', name: 'recipientsLock', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
			{ displayName: 'Reminder Delay (Days)', name: 'reminderDelay', type: 'number', typeOptions: { minValue: 1, maxValue: 999 }, default: 3 },
			{ displayName: 'Reminder Frequency (Days)', name: 'reminderFrequency', type: 'number', typeOptions: { minValue: 1, maxValue: 999 }, default: 2 },
			{ displayName: 'Shared', name: 'shared', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false', description: 'Share template with all users in the account' },
			{ displayName: 'Signing Location', name: 'signingLocation', type: 'options', options: [{ name: 'Online', value: 'online' }, { name: 'In Person', value: 'inPerson' }], default: 'online' },
		],
	},

	// ==================================================================
	// Update: Fields
	// ==================================================================
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['template'], operation: ['update'] } },
		options: [
			{ displayName: 'Allow Markup', name: 'allowMarkup', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
			{ displayName: 'Auto Match', name: 'autoMatch', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
			{ displayName: 'Brand ID', name: 'brandId', type: 'string', default: '' },
			{ displayName: 'Description', name: 'description', type: 'string', default: '' },
			{ displayName: 'Email Blurb', name: 'emailBlurb', type: 'string', default: '' },
			{ displayName: 'Email Subject', name: 'emailSubject', type: 'string', default: '' },
			{ displayName: 'Enable Wet Sign', name: 'enableWetSign', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
			{ displayName: 'Message Lock', name: 'messageLock', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
			{ displayName: 'Name', name: 'name', type: 'string', default: '' },
			{ displayName: 'Password', name: 'password', type: 'string', typeOptions: { password: true }, default: '' },
			{ displayName: 'Recipients Lock', name: 'recipientsLock', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
			{ displayName: 'Shared', name: 'shared', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
		],
	},

	// ==================================================================
	// Get Many: Filters
	// ==================================================================
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['template'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Folder', name: 'folder', type: 'string', default: '' },
			{ displayName: 'Folder IDs', name: 'folderIds', type: 'string', default: '' },
			{ displayName: 'Order By', name: 'orderBy', type: 'options', options: [{ name: 'Name', value: 'name' }, { name: 'Modified', value: 'modified' }, { name: 'Used', value: 'used' }], default: 'name' },
			{ displayName: 'Order Direction', name: 'order', type: 'options', options: [{ name: 'Ascending', value: 'asc' }, { name: 'Descending', value: 'desc' }], default: 'asc' },
			{ displayName: 'Search Text', name: 'searchText', type: 'string', default: '' },
			{ displayName: 'Shared By Me', name: 'sharedByMe', type: 'options', options: [{ name: 'Any', value: '' }, { name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: '' },
		],
	},
	{
		displayName: 'Max Results',
		name: 'maxResults',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 500 },
		default: 100,
		displayOptions: { show: { resource: ['template'], operation: ['getAll'] } },
	},

	// ==================================================================
	// Page operations: Document ID + Page Number
	// ==================================================================
	{
		displayName: 'Document ID',
		name: 'documentId',
		type: 'string',
		required: true,
		default: '1',
		displayOptions: { show: { resource: ['template'], operation: ['deleteDocumentPage', 'getPageImages', 'rotateDocumentPage'] } },
	},
	{
		displayName: 'Page Number',
		name: 'pageNumber',
		type: 'string',
		required: true,
		default: '1',
		displayOptions: { show: { resource: ['template'], operation: ['deleteDocumentPage', 'rotateDocumentPage'] } },
	},
	{
		displayName: 'Rotation',
		name: 'rotation',
		type: 'options',
		options: [
			{ name: '90° Clockwise', value: 'clockwise90' },
			{ name: '180°', value: 'clockwise180' },
			{ name: '90° Counter-Clockwise', value: 'counterclockwise90' },
		],
		default: 'clockwise90',
		displayOptions: { show: { resource: ['template'], operation: ['rotateDocumentPage'] } },
	},

	// ==================================================================
	// Group Share: Group IDs
	// ==================================================================
	{
		displayName: 'Group IDs',
		name: 'groupIds',
		type: 'string',
		required: true,
		default: '',
		description: 'Comma-separated group IDs to share with',
		displayOptions: { show: { resource: ['template'], operation: ['updateGroupShare', 'deleteGroupShare'] } },
	},

	// ==================================================================
	// Notification Settings
	// ==================================================================
	{
		displayName: 'Notification Settings',
		name: 'notificationSettings',
		type: 'collection',
		placeholder: 'Add Setting',
		default: {},
		displayOptions: { show: { resource: ['template'], operation: ['updateNotificationSettings'] } },
		options: [
			{ displayName: 'Expire After (Days)', name: 'expireAfter', type: 'number', default: 120 },
			{ displayName: 'Expire Enabled', name: 'expireEnabled', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'true' },
			{ displayName: 'Expire Warn (Days Before)', name: 'expireWarn', type: 'number', default: 3 },
			{ displayName: 'Reminder Delay (Days)', name: 'reminderDelay', type: 'number', default: 3 },
			{ displayName: 'Reminder Enabled', name: 'reminderEnabled', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'true' },
			{ displayName: 'Reminder Frequency (Days)', name: 'reminderFrequency', type: 'number', default: 2 },
		],
	},
];
