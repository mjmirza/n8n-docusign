import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const powerFormDataFields: INodeProperties[] = [
	accountIdField(['powerFormData']),

	// ------------------------------------------------------------------
	// PowerForm ID
	// ------------------------------------------------------------------
	{
		displayName: 'PowerForm ID',
		name: 'powerFormId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the PowerForm to get submission data for',
		displayOptions: {
			show: {
				resource: ['powerFormData'],
				operation: ['list'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Filters
	// ------------------------------------------------------------------
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['powerFormData'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'From Date',
				name: 'from_date',
				type: 'string',
				default: '',
				description: 'Start date for form data (ISO 8601)',
			},
			{
				displayName: 'To Date',
				name: 'to_date',
				type: 'string',
				default: '',
				description: 'End date for form data (ISO 8601)',
			},
			{
				displayName: 'Data Layout',
				name: 'data_layout',
				type: 'string',
				default: '',
				description: 'The layout of the returned data (e.g., "Native")',
			},
		],
	},
];
