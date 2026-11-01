import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const folderFields: INodeProperties[] = [
	accountIdField(['folder']),

	// ------------------------------------------------------------------
	// Folder ID (listItems, moveEnvelopes)
	// ------------------------------------------------------------------
	{
		displayName: 'Folder ID',
		name: 'folderId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the folder',
		displayOptions: {
			show: {
				resource: ['folder'],
				operation: ['listItems', 'moveEnvelopes'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Search Folder ID (search)
	// ------------------------------------------------------------------
	{
		displayName: 'Search Folder ID',
		name: 'searchFolderId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the search folder (e.g., "drafts", "awaiting_my_signature", "completed", "out_for_signature")',
		displayOptions: {
			show: {
				resource: ['folder'],
				operation: ['search'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Envelope IDs (moveEnvelopes)
	// ------------------------------------------------------------------
	{
		displayName: 'Envelope IDs',
		name: 'envelopeIds',
		type: 'string',
		required: true,
		default: '',
		description: 'Comma-separated list of envelope IDs to move',
		displayOptions: {
			show: {
				resource: ['folder'],
				operation: ['moveEnvelopes'],
			},
		},
	},

	// ------------------------------------------------------------------
	// From Folder ID (moveEnvelopes)
	// ------------------------------------------------------------------
	{
		displayName: 'From Folder ID',
		name: 'fromFolderId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the folder to move envelopes from',
		displayOptions: {
			show: {
				resource: ['folder'],
				operation: ['moveEnvelopes'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Filters for listItems
	// ------------------------------------------------------------------
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['folder'],
				operation: ['listItems'],
			},
		},
		options: [
			{
				displayName: 'Count',
				name: 'count',
				type: 'number',
				default: 100,
				description: 'Number of items to return',
			},
			{
				displayName: 'From Date',
				name: 'from_date',
				type: 'string',
				default: '',
				description: 'Start date filter (ISO 8601)',
			},
			{
				displayName: 'Include Items',
				name: 'include_items',
				type: 'boolean',
				default: true,
				description: 'Whether to include items in the response',
			},
			{
				displayName: 'Search Text',
				name: 'search_text',
				type: 'string',
				default: '',
				description: 'Text to search for in folder items',
			},
			{
				displayName: 'Start Position',
				name: 'start_position',
				type: 'number',
				default: 0,
				description: 'Starting index position for results',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'string',
				default: '',
				description: 'Filter by envelope status',
			},
			{
				displayName: 'To Date',
				name: 'to_date',
				type: 'string',
				default: '',
				description: 'End date filter (ISO 8601)',
			},
		],
	},

	// ------------------------------------------------------------------
	// Filters for search
	// ------------------------------------------------------------------
	{
		displayName: 'Search Filters',
		name: 'searchFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['folder'],
				operation: ['search'],
			},
		},
		options: [
			{
				displayName: 'Count',
				name: 'count',
				type: 'number',
				default: 100,
				description: 'Number of results to return',
			},
			{
				displayName: 'Include Recipients',
				name: 'include_recipients',
				type: 'boolean',
				default: false,
				description: 'Whether to include recipient information',
			},
			{
				displayName: 'Order',
				name: 'order',
				type: 'options',
				options: [
					{ name: 'Ascending', value: 'asc' },
					{ name: 'Descending', value: 'desc' },
				],
				default: 'desc',
				description: 'Sort order',
			},
			{
				displayName: 'Order By',
				name: 'order_by',
				type: 'string',
				default: '',
				description: 'Field to sort by',
			},
			{
				displayName: 'Search Text',
				name: 'search_text',
				type: 'string',
				default: '',
				description: 'Text to search for',
			},
			{
				displayName: 'Start Position',
				name: 'start_position',
				type: 'number',
				default: 0,
				description: 'Starting index position',
			},
		],
	},
];
