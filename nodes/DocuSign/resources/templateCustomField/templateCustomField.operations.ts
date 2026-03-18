import type { INodeProperties } from 'n8n-workflow';

export const templateCustomFieldOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['templateCustomField'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Add custom fields to a template', action: 'Create template custom fields' },
			{ name: 'Delete', value: 'delete', description: 'Remove a custom field from a template', action: 'Delete a template custom field' },
			{ name: 'Get Many', value: 'list', description: 'List all custom fields on a template', action: 'List template custom fields' },
			{ name: 'Update', value: 'update', description: 'Update custom fields on a template', action: 'Update template custom fields' },
		],
		default: 'list',
	},
];
