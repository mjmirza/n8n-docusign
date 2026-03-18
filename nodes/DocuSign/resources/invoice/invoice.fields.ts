import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const invoiceFields: INodeProperties[] = [
	accountIdField(['invoice']),

	// ------------------------------------------------------------------
	// Invoice ID (get)
	// ------------------------------------------------------------------
	{
		displayName: 'Invoice ID',
		name: 'invoiceId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the invoice to retrieve',
		displayOptions: {
			show: {
				resource: ['invoice'],
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
				resource: ['invoice'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'From Date',
				name: 'from_date',
				type: 'string',
				default: '',
				description: 'Start date for invoices (ISO 8601)',
			},
			{
				displayName: 'To Date',
				name: 'to_date',
				type: 'string',
				default: '',
				description: 'End date for invoices (ISO 8601)',
			},
		],
	},
];
