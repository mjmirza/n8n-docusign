import type { INodeProperties } from 'n8n-workflow';

export const templateDocumentTabOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['templateDocumentTab'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Add tabs to a document', action: 'Create document tabs' },
			{ name: 'Delete', value: 'delete', description: 'Remove tabs from a document', action: 'Delete document tabs' },
			{ name: 'Get', value: 'get', description: 'Get all tabs on a document', action: 'Get document tabs' },
			{ name: 'Get by Page', value: 'getByPage', description: 'Get tabs on a specific page', action: 'Get document tabs by page' },
			{ name: 'Update', value: 'update', description: 'Update tabs on a document', action: 'Update document tabs' },
		],
		default: 'get',
	},
];
