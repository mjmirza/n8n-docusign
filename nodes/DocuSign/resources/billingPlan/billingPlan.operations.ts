import type { INodeProperties } from 'n8n-workflow';

export const billingPlanOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['billingPlan'] } },
		options: [
			{ name: 'Get', value: 'get', description: 'Get a specific billing plan by ID', action: 'Get a billing plan' },
			{ name: 'Get Account Plan', value: 'getAccountPlan', description: 'Get the billing plan for an account', action: 'Get account billing plan' },
			{ name: 'Get Credit Card', value: 'getCreditCard', description: 'Get credit card information for an account', action: 'Get credit card info' },
			{ name: 'Get Downgrade Request', value: 'getDowngradeRequestBillingInfo', description: 'Get downgrade request billing info', action: 'Get downgrade request billing info' },
			{ name: 'Get Many', value: 'list', description: 'List all available billing plans', action: 'List billing plans' },
			{ name: 'Purchase Envelopes', value: 'purchaseEnvelopes', description: 'Purchase additional envelopes for an account', action: 'Purchase envelopes' },
			{ name: 'Update', value: 'update', description: 'Update the billing plan for an account', action: 'Update account billing plan' },
			{ name: 'Update Downgrade', value: 'updateDowngrade', description: 'Update a downgrade request for an account', action: 'Update downgrade request' },
		],
		default: 'list',
	},
];
