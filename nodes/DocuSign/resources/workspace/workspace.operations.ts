import type { INodeProperties } from 'n8n-workflow';

export const workspaceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['workspace'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a workspace', action: 'Create a workspace' },
			{ name: 'Delete', value: 'delete', description: 'Delete a workspace', action: 'Delete a workspace' },
			{ name: 'Get', value: 'get', description: 'Get a workspace', action: 'Get a workspace' },
			{ name: 'Get Many', value: 'list', description: 'List all workspaces', action: 'List workspaces' },
			{ name: 'Update', value: 'update', description: 'Update a workspace', action: 'Update a workspace' },
		],
		default: 'list',
	},
];
