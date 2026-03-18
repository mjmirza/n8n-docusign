import type { INodeProperties } from 'n8n-workflow';

export const paymentGatewayOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['paymentGateway'] } },
		options: [
			{ name: 'Get Many', value: 'list', description: 'List payment gateway accounts', action: 'List payment gateway accounts' },
		],
		default: 'list',
	},
];
