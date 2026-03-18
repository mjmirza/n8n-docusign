import type { INodeProperties } from 'n8n-workflow';

export const accountCustomFieldOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['accountCustomField'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create an account custom field', action: 'Create an account custom field' },
			{ name: 'Delete', value: 'delete', description: 'Delete an account custom field', action: 'Delete an account custom field' },
			{ name: 'Get Many', value: 'list', description: 'List all account custom fields', action: 'List account custom fields' },
			{ name: 'Update', value: 'update', description: 'Update an account custom field', action: 'Update an account custom field' },
		],
		default: 'list',
	},
];
