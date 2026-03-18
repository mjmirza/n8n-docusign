import type { INodeProperties } from 'n8n-workflow';

export const customTabOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['customTab'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a custom tab definition', action: 'Create a custom tab definition' },
			{ name: 'Delete', value: 'delete', description: 'Delete a custom tab definition', action: 'Delete a custom tab definition' },
			{ name: 'Get', value: 'get', description: 'Get a custom tab definition', action: 'Get a custom tab definition' },
			{ name: 'Get Many', value: 'list', description: 'List custom tab definitions', action: 'List custom tab definitions' },
			{ name: 'Update', value: 'update', description: 'Update a custom tab definition', action: 'Update a custom tab definition' },
		],
		default: 'list',
	},
];
