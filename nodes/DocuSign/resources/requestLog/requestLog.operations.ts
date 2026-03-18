import type { INodeProperties } from 'n8n-workflow';

export const requestLogOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['requestLog'] } },
		options: [
			{ name: 'Delete', value: 'delete', description: 'Delete all request logs', action: 'Delete all request logs' },
			{ name: 'Get', value: 'get', description: 'Get a specific request log', action: 'Get a request log' },
			{ name: 'Get Settings', value: 'getSettings', description: 'Get the API request logging settings', action: 'Get API request logging settings' },
			{ name: 'List', value: 'list', description: 'List all request logs', action: 'List all request logs' },
			{ name: 'Update Settings', value: 'updateSettings', description: 'Update the API request logging settings', action: 'Update API request logging settings' },
		],
		default: 'list',
	},
];
