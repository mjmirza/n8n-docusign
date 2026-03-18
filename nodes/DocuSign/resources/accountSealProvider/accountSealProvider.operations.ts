import type { INodeProperties } from 'n8n-workflow';

export const accountSealProviderOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['accountSealProvider'] } },
		options: [
			{ name: 'Get Many', value: 'list', description: 'List seal providers', action: 'List seal providers' },
		],
		default: 'list',
	},
];
