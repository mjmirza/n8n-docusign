import type { INodeProperties } from 'n8n-workflow';

export const invoiceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['invoice'] } },
		options: [
			{ name: 'Get', value: 'get', description: 'Get a specific invoice', action: 'Get an invoice' },
			{ name: 'Get Many', value: 'list', description: 'List billing invoices for an account', action: 'List invoices' },
		],
		default: 'list',
	},
];
