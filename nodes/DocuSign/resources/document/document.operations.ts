import type { INodeProperties } from 'n8n-workflow';

export const documentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['document'] } },
		options: [
			{
				name: 'Download',
				value: 'download',
				description: 'Download a specific document from an envelope',
				action: 'Download a document',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List all documents in an envelope',
				action: 'Get many documents',
			},
		],
		default: 'getAll',
	},
];
