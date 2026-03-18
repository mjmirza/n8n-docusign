import type { INodeProperties } from 'n8n-workflow';

export const folderOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['folder'] } },
		options: [
			{ name: 'Get Many', value: 'list', description: 'List all folders', action: 'List folders' },
			{ name: 'List Items', value: 'listItems', description: 'List items in a folder', action: 'List folder items' },
			{ name: 'Move Envelopes', value: 'moveEnvelopes', description: 'Move envelopes to a folder', action: 'Move envelopes to folder' },
			{ name: 'Search', value: 'search', description: 'Search envelopes in a search folder', action: 'Search folder envelopes' },
		],
		default: 'list',
	},
];
