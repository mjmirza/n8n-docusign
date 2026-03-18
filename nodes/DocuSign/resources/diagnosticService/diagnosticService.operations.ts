import type { INodeProperties } from 'n8n-workflow';

export const diagnosticServiceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['diagnosticService'] } },
		options: [
			{ name: 'Get', value: 'get', description: 'Get the API service information', action: 'Get API service information' },
		],
		default: 'get',
	},
];
