import type { INodeProperties } from 'n8n-workflow';

export const accountSignatureProviderOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['accountSignatureProvider'] } },
		options: [
			{ name: 'Get Many', value: 'list', description: 'List signature providers', action: 'List signature providers' },
		],
		default: 'list',
	},
];
