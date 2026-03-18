import type { INodeProperties } from 'n8n-workflow';

export const notaryJournalOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['notaryJournal'] } },
		options: [
			{ name: 'List', value: 'list', description: 'List notary journal entries', action: 'List notary journal entries' },
		],
		default: 'list',
	},
];
