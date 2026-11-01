import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const accountTabSettingFields: INodeProperties[] = [
	accountIdField(['accountTabSetting']),

	// ------------------------------------------------------------------
	// Update: Tab Settings
	// ------------------------------------------------------------------
	{
		displayName: 'Tab Settings',
		name: 'tabSettings',
		type: 'collection',
		placeholder: 'Add Setting',
		default: {},
		required: true,
		displayOptions: {
			show: { resource: ['accountTabSetting'], operation: ['update'] },
		},
		options: [
			{
				displayName: 'Allow Tab Order',
				name: 'allowTabOrder',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
				default: 'true',
				description: 'Whether to allow tab ordering',
			},
			{
				displayName: 'Confirm Initial Envelope Send',
				name: 'confirmInitialEnvelopeSend',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
				default: 'false',
				description: 'Whether to confirm initial envelope send',
			},
			{
				displayName: 'Enable Auto Stamp',
				name: 'enableAutoStamp',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
				default: 'true',
				description: 'Whether automatic stamping is enabled',
			},
			{
				displayName: 'Tab Locking Enabled',
				name: 'tabLockingEnabled',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
				default: 'false',
				description: 'Whether tab locking is enabled',
			},
			{
				displayName: 'Tab Text Formatting Enabled',
				name: 'tabTextFormattingEnabled',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
				default: 'false',
				description: 'Whether tab text formatting is enabled',
			},
		],
	},
];
