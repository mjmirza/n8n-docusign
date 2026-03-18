import type { INodeProperties } from 'n8n-workflow';

export const tabsBlobOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['tabsBlob'] } },
		options: [
			{ name: 'Get', value: 'get', description: 'Get tabs blob data for an envelope', action: 'Get tabs blob' },
			{ name: 'Update', value: 'update', description: 'Update tabs blob data for an envelope', action: 'Update tabs blob' },
		],
		default: 'get',
	},
];
