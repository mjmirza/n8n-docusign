import type { INodeProperties } from 'n8n-workflow';

export const powerFormDataOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['powerFormData'] } },
		options: [
			{ name: 'Get Many', value: 'list', description: 'List PowerForm submission data', action: 'List powerform data' },
		],
		default: 'list',
	},
];
