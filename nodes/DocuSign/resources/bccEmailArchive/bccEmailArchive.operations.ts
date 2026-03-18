import type { INodeProperties } from 'n8n-workflow';

export const bccEmailArchiveOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['bccEmailArchive'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a BCC email archive configuration', action: 'Create a BCC email archive configuration' },
			{ name: 'Delete', value: 'delete', description: 'Delete a BCC email archive configuration', action: 'Delete a BCC email archive configuration' },
			{ name: 'Get', value: 'get', description: 'Get a BCC email archive configuration', action: 'Get a BCC email archive configuration' },
			{ name: 'List', value: 'list', description: 'List all BCC email archive configurations', action: 'List all BCC email archive configurations' },
		],
		default: 'list',
	},
];
