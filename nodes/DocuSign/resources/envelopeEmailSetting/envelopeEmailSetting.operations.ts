import type { INodeProperties } from 'n8n-workflow';

export const envelopeEmailSettingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['envelopeEmailSetting'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Add email override settings', action: 'Create email settings' },
			{ name: 'Delete', value: 'delete', description: 'Remove email override settings', action: 'Delete email settings' },
			{ name: 'Get', value: 'get', description: 'Get email override settings', action: 'Get email settings' },
			{ name: 'Update', value: 'update', description: 'Update email override settings', action: 'Update email settings' },
		],
		default: 'get',
	},
];
