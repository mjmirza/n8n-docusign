import type { INodeProperties } from 'n8n-workflow';

export const accountOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['account'] } },
		options: [
			{ name: 'Get', value: 'get', description: 'Get account information', action: 'Get account information' },
			{ name: 'Get Billing Charges', value: 'getBillingCharges', description: 'Get billing charge information for the account', action: 'Get account billing charges' },
			{ name: 'Get Envelope Purge Configuration', value: 'getEnvelopePurgeConfiguration', description: 'Get the envelope purge configuration', action: 'Get envelope purge configuration' },
			{ name: 'Get Notification Defaults', value: 'getNotificationDefaults', description: 'Get notification default settings', action: 'Get notification defaults' },
			{ name: 'List Recipient Names by Email', value: 'listRecipientNamesByEmail', description: 'Get recipient names associated with an email address', action: 'List recipient names by email' },
			{ name: 'List Settings', value: 'listSettings', description: 'Get account settings', action: 'List account settings' },
			{ name: 'List Shared Access', value: 'listSharedAccess', description: 'Get shared access information', action: 'List shared access' },
			{ name: 'List Supported Languages', value: 'listSupportedLanguages', description: 'Get supported languages for the account', action: 'List supported languages' },
			{ name: 'List Unsupported File Types', value: 'listUnsupportedFileTypes', description: 'Get unsupported file types', action: 'List unsupported file types' },
			{ name: 'Update Envelope Purge Configuration', value: 'updateEnvelopePurgeConfiguration', description: 'Update the envelope purge configuration', action: 'Update envelope purge configuration' },
			{ name: 'Update Notification Defaults', value: 'updateNotificationDefaults', description: 'Update notification default settings', action: 'Update notification defaults' },
			{ name: 'Update Settings', value: 'updateSettings', description: 'Update account settings', action: 'Update account settings' },
			{ name: 'Update Shared Access', value: 'updateSharedAccess', description: 'Update shared access information', action: 'Update shared access' },
		],
		default: 'get',
	},
];
