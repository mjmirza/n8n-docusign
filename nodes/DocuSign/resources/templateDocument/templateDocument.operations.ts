import type { INodeProperties } from 'n8n-workflow';

export const templateDocumentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['templateDocument'] } },
		options: [
			{ name: 'Delete', value: 'delete', description: 'Remove a document from a template', action: 'Delete template document' },
			{ name: 'Download', value: 'get', description: 'Download a document from a template', action: 'Get template document' },
			{ name: 'Get Many', value: 'list', description: 'List all documents in a template', action: 'List template documents' },
			{ name: 'Update', value: 'update', description: 'Update a specific document in a template', action: 'Update template document' },
			{ name: 'Update All', value: 'updateList', description: 'Update multiple documents in a template', action: 'Update template documents list' },
		],
		default: 'list',
	},
];
