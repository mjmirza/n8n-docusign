import type { INodeProperties } from 'n8n-workflow';

export const envelopeDocumentFieldOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['envelopeDocumentField'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Add document fields', action: 'Create document fields' },
			{ name: 'Delete', value: 'delete', description: 'Remove document fields', action: 'Delete document fields' },
			{ name: 'Get Many', value: 'list', description: 'List document fields', action: 'List document fields' },
			{ name: 'Update', value: 'update', description: 'Update document fields', action: 'Update document fields' },
		],
		default: 'list',
	},
];
