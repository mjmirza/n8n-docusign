import type { INodeProperties } from 'n8n-workflow';

export const paymentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['payment'] } },
		options: [
			{ name: 'Get', value: 'get', description: 'Get a specific payment', action: 'Get a payment' },
			{ name: 'Get Many', value: 'list', description: 'List billing payments for an account', action: 'List payments' },
		],
		default: 'list',
	},
];
