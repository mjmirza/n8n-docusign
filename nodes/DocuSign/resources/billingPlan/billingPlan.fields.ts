import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const billingPlanFields: INodeProperties[] = [
	// Account ID — needed for account-scoped operations only
	accountIdField(
		['billingPlan'],
		['getAccountPlan', 'getCreditCard', 'getDowngradeRequestBillingInfo', 'purchaseEnvelopes', 'update', 'updateDowngrade'],
	),

	// ------------------------------------------------------------------
	// Plan ID (get)
	// ------------------------------------------------------------------
	{
		displayName: 'Plan ID',
		name: 'planId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the billing plan to retrieve',
		displayOptions: {
			show: {
				resource: ['billingPlan'],
				operation: ['get'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Request Body (JSON) for purchaseEnvelopes
	// ------------------------------------------------------------------
	{
		displayName: 'Request Body (JSON)',
		name: 'requestBody',
		type: 'json',
		default: '{\n  "amount": "0.00",\n  "quantity": "100"\n}',
		required: true,
		description: 'JSON body with envelope purchase details: { "amount": string, "quantity": string }',
		displayOptions: {
			show: {
				resource: ['billingPlan'],
				operation: ['purchaseEnvelopes'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Request Body (JSON) for update
	// ------------------------------------------------------------------
	{
		displayName: 'Request Body (JSON)',
		name: 'updateBody',
		type: 'json',
		default: '{}',
		required: true,
		description: 'JSON body with billing plan update details',
		displayOptions: {
			show: {
				resource: ['billingPlan'],
				operation: ['update'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Request Body (JSON) for updateDowngrade
	// ------------------------------------------------------------------
	{
		displayName: 'Request Body (JSON)',
		name: 'downgradeBody',
		type: 'json',
		default: '{}',
		required: true,
		description: 'JSON body with downgrade request details',
		displayOptions: {
			show: {
				resource: ['billingPlan'],
				operation: ['updateDowngrade'],
			},
		},
	},
];
