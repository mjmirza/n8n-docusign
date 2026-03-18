import type { INodeProperties } from 'n8n-workflow';

export const groupOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['group'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a group', action: 'Create a group' },
			{ name: 'Delete', value: 'delete', description: 'Delete a group', action: 'Delete a group' },
			{ name: 'Get Many', value: 'list', description: 'List groups', action: 'List groups' },
			{ name: 'Update', value: 'update', description: 'Update a group', action: 'Update a group' },
		],
		default: 'list',
	},
];
