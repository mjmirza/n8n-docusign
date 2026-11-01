import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const accountPermissionProfileFields: INodeProperties[] = [
	accountIdField(['accountPermissionProfile']),

	// ------------------------------------------------------------------
	// Permission Profile ID
	// ------------------------------------------------------------------
	{
		displayName: 'Permission Profile ID',
		name: 'permissionProfileId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the permission profile',
		displayOptions: {
			show: {
				resource: ['accountPermissionProfile'],
				operation: ['get', 'update', 'delete'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Create: Profile Name
	// ------------------------------------------------------------------
	{
		displayName: 'Permission Profile Name',
		name: 'permissionProfileName',
		type: 'string',
		required: true,
		default: '',
		description: 'The name of the new permission profile',
		displayOptions: {
			show: { resource: ['accountPermissionProfile'], operation: ['create'] },
		},
	},

	// ------------------------------------------------------------------
	// Create / Update: Settings
	// ------------------------------------------------------------------
	{
		displayName: 'Settings',
		name: 'settings',
		type: 'collection',
		placeholder: 'Add Setting',
		default: {},
		displayOptions: {
			show: { resource: ['accountPermissionProfile'], operation: ['create', 'update'] },
		},
		options: [
			{
				displayName: 'Allow API Access',
				name: 'allowApiAccess',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
				default: 'true',
			},
			{
				displayName: 'Allow API Access to Account',
				name: 'allowApiAccessToAccount',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
				default: 'true',
			},
			{
				displayName: 'Allow API Sending on Behalf of Others',
				name: 'allowApiSendingOnBehalfOfOthers',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
				default: 'false',
			},
			{
				displayName: 'Allow Bulk Sending',
				name: 'allowBulkSending',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
				default: 'true',
			},
			{
				displayName: 'Allow Envelope Sending',
				name: 'allowEnvelopeSending',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
				default: 'true',
			},
			{
				displayName: 'Allow Signer Attachments',
				name: 'allowSignerAttachments',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
				default: 'true',
			},
			{
				displayName: 'Allow Tagging in Send and Correct',
				name: 'allowTaggingInSendAndCorrect',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
				default: 'true',
			},
			{
				displayName: 'Allow Wet Signing Override',
				name: 'allowWetSigningOverride',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
				default: 'true',
			},
			{
				displayName: 'Enable Recipient Viewing Notifications',
				name: 'enableRecipientViewingNotifications',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
				default: 'true',
			},
			{
				displayName: 'Enable Sequential Signing API',
				name: 'enableSequentialSigningAPI',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
				default: 'true',
			},
			{
				displayName: 'Enable Transaction Point Integration',
				name: 'enableTransactionPointIntegration',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
				default: 'false',
			},
			{
				displayName: 'Enable Vaulting',
				name: 'enableVaulting',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
				default: 'false',
			},
			{
				displayName: 'Use New DocuSign Experience Interface',
				name: 'useNewDocuSignExperienceInterface',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
				default: 'true',
			},
		],
	},
];
