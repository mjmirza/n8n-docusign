import type { INodeProperties } from 'n8n-workflow';

export const accountPermissionProfileOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['accountPermissionProfile'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a permission profile', action: 'Create a permission profile' },
			{ name: 'Delete', value: 'delete', description: 'Delete a permission profile', action: 'Delete a permission profile' },
			{ name: 'Get', value: 'get', description: 'Get a permission profile', action: 'Get a permission profile' },
			{ name: 'Get Many', value: 'list', description: 'List all permission profiles', action: 'List permission profiles' },
			{ name: 'Update', value: 'update', description: 'Update a permission profile', action: 'Update a permission profile' },
		],
		default: 'list',
	},
];
