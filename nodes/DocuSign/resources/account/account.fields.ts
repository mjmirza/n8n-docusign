import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const accountFields: INodeProperties[] = [
	accountIdField(['account']),

	// ------------------------------------------------------------------
	// listRecipientNamesByEmail: Email
	// ------------------------------------------------------------------
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		default: '',
		description: 'The email address to look up recipient names for',
		displayOptions: {
			show: { resource: ['account'], operation: ['listRecipientNamesByEmail'] },
		},
	},

	// ------------------------------------------------------------------
	// updateEnvelopePurgeConfiguration: JSON body
	// ------------------------------------------------------------------
	{
		displayName: 'Purge Configuration (JSON)',
		name: 'purgeConfiguration',
		type: 'json',
		default: '{}',
		required: true,
		description: 'The envelope purge configuration as JSON',
		displayOptions: {
			show: { resource: ['account'], operation: ['updateEnvelopePurgeConfiguration'] },
		},
	},

	// ------------------------------------------------------------------
	// updateNotificationDefaults: JSON body
	// ------------------------------------------------------------------
	{
		displayName: 'Notification Defaults (JSON)',
		name: 'notificationDefaults',
		type: 'json',
		default: '{}',
		required: true,
		description: 'The notification default settings as JSON',
		displayOptions: {
			show: { resource: ['account'], operation: ['updateNotificationDefaults'] },
		},
	},

	// ------------------------------------------------------------------
	// updateSettings: JSON body
	// ------------------------------------------------------------------
	{
		displayName: 'Settings (JSON)',
		name: 'settings',
		type: 'json',
		default: '{}',
		required: true,
		description: 'The account settings as JSON',
		displayOptions: {
			show: { resource: ['account'], operation: ['updateSettings'] },
		},
	},

	// ------------------------------------------------------------------
	// updateSharedAccess: JSON body
	// ------------------------------------------------------------------
	{
		displayName: 'Shared Access (JSON)',
		name: 'sharedAccess',
		type: 'json',
		default: '{}',
		required: true,
		description: 'The shared access configuration as JSON',
		displayOptions: {
			show: { resource: ['account'], operation: ['updateSharedAccess'] },
		},
	},
];
