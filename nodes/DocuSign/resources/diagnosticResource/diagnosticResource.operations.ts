import type { INodeProperties } from 'n8n-workflow';

export const diagnosticResourceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['diagnosticResource'] } },
		options: [
			{ name: 'Get', value: 'get', description: 'Get the API resource service information', action: 'Get API resource service information' },
		],
		default: 'get',
	},
];
