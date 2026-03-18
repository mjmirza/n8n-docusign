import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const notaryJournalFields: INodeProperties[] = [
	accountIdField(['notaryJournal']),

	// ------------------------------------------------------------------
	// List query parameters
	// ------------------------------------------------------------------
	{
		displayName: 'Count',
		name: 'count',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 100,
		description: 'The maximum number of journal entries to return',
		displayOptions: {
			show: { resource: ['notaryJournal'], operation: ['list'] },
		},
	},
	{
		displayName: 'Start Position',
		name: 'startPosition',
		type: 'number',
		typeOptions: { minValue: 0 },
		default: 0,
		description: 'The zero-based index of the first result to return',
		displayOptions: {
			show: { resource: ['notaryJournal'], operation: ['list'] },
		},
	},
	{
		displayName: 'Search Text',
		name: 'searchText',
		type: 'string',
		default: '',
		description: 'Filter journal entries by this search text',
		displayOptions: {
			show: { resource: ['notaryJournal'], operation: ['list'] },
		},
	},
];
