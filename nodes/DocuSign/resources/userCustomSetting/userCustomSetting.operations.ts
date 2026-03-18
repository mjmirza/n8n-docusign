import type { INodeProperties } from 'n8n-workflow';

export const userCustomSettingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['userCustomSetting'] } },
		options: [
			{ name: 'Delete', value: 'delete', description: 'Delete user custom settings', action: 'Delete user custom settings' },
			{ name: 'Get Many', value: 'list', description: 'List user custom settings', action: 'List user custom settings' },
			{ name: 'Update', value: 'update', description: 'Update user custom settings', action: 'Update user custom settings' },
		],
		default: 'list',
	},
];
