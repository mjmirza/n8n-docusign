import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const paymentFields: INodeProperties[] = [
	accountIdField(['payment']),

	// ------------------------------------------------------------------
	// Payment ID (get)
	// ------------------------------------------------------------------
	{
		displayName: 'Payment ID',
		name: 'paymentId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the payment to retrieve',
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['get'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Filters for list
	// ------------------------------------------------------------------
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'From Date',
				name: 'from_date',
				type: 'string',
				default: '',
				description: 'Start date for payments (ISO 8601)',
			},
			{
				displayName: 'To Date',
				name: 'to_date',
				type: 'string',
				default: '',
				description: 'End date for payments (ISO 8601)',
			},
		],
	},
];
