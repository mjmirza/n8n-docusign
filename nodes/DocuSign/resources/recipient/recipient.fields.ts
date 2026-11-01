import type { INodeProperties } from 'n8n-workflow';

export const recipientFields: INodeProperties[] = [
	// ------------------------------------------------------------------
	// Account ID
	// ------------------------------------------------------------------
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		required: true,
		default: '',
		description:
			'The DocuSign Account ID (GUID). Find it in DocuSign Admin > Account > API.',
		displayOptions: {
			show: { resource: ['recipient', 'envelopeRecipient'] },
		},
	},

	// ------------------------------------------------------------------
	// Envelope ID — required for all recipient operations
	// ------------------------------------------------------------------
	{
		displayName: 'Envelope ID',
		name: 'envelopeId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID (GUID) of the envelope',
		displayOptions: {
			show: { resource: ['recipient', 'envelopeRecipient'] },
		},
	},

	// ------------------------------------------------------------------
	// Recipient Type — for add and update
	// ------------------------------------------------------------------
	{
		displayName: 'Recipient Type',
		name: 'recipientType',
		type: 'options',
		options: [
			{ name: 'Signer', value: 'signers' },
			{ name: 'Carbon Copy', value: 'carbonCopies' },
			{ name: 'Certified Delivery', value: 'certifiedDeliveries' },
			{ name: 'In-Person Signer', value: 'inPersonSigners' },
		],
		default: 'signers',
		required: true,
		displayOptions: {
			show: { resource: ['recipient', 'envelopeRecipient'], operation: ['add', 'update'] },
		},
	},

	// ------------------------------------------------------------------
	// Add: Recipient Details
	// ------------------------------------------------------------------
	{
		displayName: 'Email',
		name: 'recipientEmail',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['recipient', 'envelopeRecipient'], operation: ['add'] },
		},
	},
	{
		displayName: 'Name',
		name: 'recipientName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['recipient', 'envelopeRecipient'], operation: ['add'] },
		},
	},
	{
		displayName: 'Recipient ID',
		name: 'recipientId',
		type: 'string',
		default: '',
		description: 'A unique ID for this recipient. Auto-generated if left empty.',
		displayOptions: {
			show: { resource: ['recipient', 'envelopeRecipient'], operation: ['add'] },
		},
	},
	{
		displayName: 'Routing Order',
		name: 'routingOrder',
		type: 'string',
		default: '1',
		description: 'The signing order for this recipient',
		displayOptions: {
			show: { resource: ['recipient', 'envelopeRecipient'], operation: ['add'] },
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['recipient', 'envelopeRecipient'], operation: ['add'] },
		},
		options: [
			{ displayName: 'Access Code', name: 'accessCode', type: 'string', default: '', description: 'Access code for recipient authentication' },
			{ displayName: 'Client User ID', name: 'clientUserId', type: 'string', default: '', description: 'Set this for embedded signing' },
			{ displayName: 'Delivery Method', name: 'deliveryMethod', type: 'options', options: [{ name: 'Email', value: 'email' }, { name: 'SMS', value: 'sms' }], default: 'email' },
			{ displayName: 'Email Notification Body', name: 'emailNotificationBody', type: 'string', default: '', description: 'Override email body for this recipient' },
			{ displayName: 'Email Notification Language', name: 'supportedLanguage', type: 'string', default: '', description: 'Language code (e.g., en, fr, de)' },
			{ displayName: 'Email Notification Subject', name: 'emailNotificationSubject', type: 'string', default: '', description: 'Override email subject for this recipient' },
			{ displayName: 'Embedded Recipient Start URL', name: 'embeddedRecipientStartURL', type: 'string', default: '' },
			{ displayName: 'Host Email (In-Person)', name: 'hostEmail', type: 'string', default: '', description: 'Host email for in-person signers' },
			{ displayName: 'Host Name (In-Person)', name: 'hostName', type: 'string', default: '', description: 'Host name for in-person signers' },
			{ displayName: 'ID Check Config Name', name: 'idCheckConfigurationName', type: 'options', options: [{ name: 'None', value: '' }, { name: 'ID Check $', value: 'ID Check $' }, { name: 'ID Check $$', value: 'ID Check $$' }, { name: 'Phone Auth $', value: 'Phone Auth $' }], default: '' },
			{ displayName: 'Note', name: 'note', type: 'string', default: '', description: 'A note sent to the recipient' },
			{ displayName: 'Phone Number (for SMS)', name: 'phoneNumber', type: 'string', default: '', description: 'Required when delivery method is SMS. Country code, a space, then the number, e.g. +49 1701234567.' },
			{ displayName: 'Require ID Lookup', name: 'requireIdLookup', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false', description: 'Require knowledge-based authentication' },
			{ displayName: 'Require Sign on Paper', name: 'requireSignOnPaper', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
			{ displayName: 'Role Name', name: 'roleName', type: 'string', default: '', description: 'Role name for template-based flows' },
			{ displayName: 'Signer Name (In-Person)', name: 'signerName', type: 'string', default: '', description: 'Actual signer name for in-person signers' },
			{ displayName: 'Signing Group ID', name: 'signingGroupId', type: 'string', default: '', description: 'Assign to a signing group' },
		],
	},

	// ------------------------------------------------------------------
	// Update: Recipient ID
	// ------------------------------------------------------------------
	{
		displayName: 'Recipient ID',
		name: 'recipientId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the recipient to update',
		displayOptions: {
			show: { resource: ['recipient', 'envelopeRecipient'], operation: ['update'] },
		},
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['recipient', 'envelopeRecipient'], operation: ['update'] },
		},
		options: [
			{ displayName: 'Access Code', name: 'accessCode', type: 'string', default: '' },
			{ displayName: 'Client User ID', name: 'clientUserId', type: 'string', default: '' },
			{ displayName: 'Delivery Method', name: 'deliveryMethod', type: 'options', options: [{ name: 'Email', value: 'email' }, { name: 'SMS', value: 'sms' }], default: 'email' },
			{ displayName: 'Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '' },
			{ displayName: 'Email Notification Body', name: 'emailNotificationBody', type: 'string', default: '' },
			{ displayName: 'Email Notification Subject', name: 'emailNotificationSubject', type: 'string', default: '' },
			{ displayName: 'Name', name: 'name', type: 'string', default: '' },
			{ displayName: 'Note', name: 'note', type: 'string', default: '' },
			{ displayName: 'Routing Order', name: 'routingOrder', type: 'string', default: '' },
		],
	},

	// ------------------------------------------------------------------
	// Delete: Recipient ID
	// ------------------------------------------------------------------
	{
		displayName: 'Recipient ID',
		name: 'recipientId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the recipient to remove',
		displayOptions: {
			show: { resource: ['recipient', 'envelopeRecipient'], operation: ['delete'] },
		},
	},
];
