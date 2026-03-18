import type { INodeProperties } from 'n8n-workflow';

export const accountTabSettingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['accountTabSetting'] } },
		options: [
			{ name: 'Get', value: 'get', description: 'Get account tab settings', action: 'Get account tab settings' },
			{ name: 'Update', value: 'update', description: 'Update account tab settings', action: 'Update account tab settings' },
		],
		default: 'get',
	},
];
