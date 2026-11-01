import type { INodeProperties } from 'n8n-workflow';

export const envelopeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['envelope'] } },
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new envelope (draft or sent)',
				action: 'Create an envelope',
			},
			{
				name: 'Create From Template',
				value: 'createFromTemplate',
				description: 'Create an envelope from a template',
				action: 'Create an envelope from template',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Move an envelope to the recycle bin',
				action: 'Delete an envelope',
			},
			{
				name: 'Download Documents',
				value: 'downloadDocuments',
				description: 'Download the combined documents from an envelope',
				action: 'Download envelope documents',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an envelope by ID',
				action: 'Get an envelope',
			},
			{
				name: 'Get Embedded Signing URL',
				value: 'getSigningUrl',
				description: 'Generate an embedded signing URL for a recipient',
				action: 'Get embedded signing URL',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many envelopes',
				action: 'Get many envelopes',
			},
			{
				name: 'Get Notification Settings',
				value: 'getNotificationSettings',
				description: 'Get the reminder and expiration settings of an envelope',
				action: 'Get envelope notification settings',
			},
			{
				name: 'List Audit Events',
				value: 'listAuditEvents',
				description: 'List the audit trail events of an envelope',
				action: 'List envelope audit events',
			},
			{
				name: 'List Status Changes',
				value: 'listStatusChanges',
				description: 'List envelopes whose status changed in a date range (one page)',
				action: 'List envelope status changes',
			},
			{
				name: 'Send',
				value: 'send',
				description: 'Send a draft envelope',
				action: 'Send an envelope',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an envelope',
				action: 'Update an envelope',
			},
			{
				name: 'Update Notification Settings',
				value: 'updateNotificationSettings',
				description: 'Change the reminder and expiration settings of an envelope',
				action: 'Update envelope notification settings',
			},
			{
				name: 'Void',
				value: 'void',
				description: 'Void an envelope to prevent further signing',
				action: 'Void an envelope',
			},
		],
		default: 'create',
	},
];
