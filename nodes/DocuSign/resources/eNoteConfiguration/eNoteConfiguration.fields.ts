import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const eNoteConfigurationFields: INodeProperties[] = [
	accountIdField(['eNoteConfiguration']),

	// ------------------------------------------------------------------
	// Update: eNote configuration fields
	// ------------------------------------------------------------------
	{
		displayName: 'Connect Configured',
		name: 'connectConfigured',
		type: 'options',
		options: [
			{ name: 'True', value: 'true' },
			{ name: 'False', value: 'false' },
			{ name: '(Not Set)', value: '' },
		],
		default: '',
		description: 'Whether Connect is configured for the account',
		displayOptions: {
			show: { resource: ['eNoteConfiguration'], operation: ['update'] },
		},
	},
	{
		displayName: 'eNote Enabled',
		name: 'eNoteEnabled',
		type: 'options',
		options: [
			{ name: 'True', value: 'true' },
			{ name: 'False', value: 'false' },
			{ name: '(Not Set)', value: '' },
		],
		default: '',
		description: 'Whether eNote is enabled for the account',
		displayOptions: {
			show: { resource: ['eNoteConfiguration'], operation: ['update'] },
		},
	},
	{
		displayName: 'Organization',
		name: 'organization',
		type: 'string',
		default: '',
		description: 'The organization name for the eNote configuration',
		displayOptions: {
			show: { resource: ['eNoteConfiguration'], operation: ['update'] },
		},
	},
	{
		displayName: 'Password',
		name: 'password',
		type: 'string',
		typeOptions: { password: true },
		default: '',
		description: 'The password for the eNote configuration',
		displayOptions: {
			show: { resource: ['eNoteConfiguration'], operation: ['update'] },
		},
	},
	{
		displayName: 'User Name',
		name: 'eNoteUserName',
		type: 'string',
		default: '',
		description: 'The user name for the eNote configuration',
		displayOptions: {
			show: { resource: ['eNoteConfiguration'], operation: ['update'] },
		},
	},
];
