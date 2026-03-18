import type { INodeProperties } from 'n8n-workflow';

export const envelopeCustomFieldOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['envelopeCustomField'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Add custom fields to an envelope', action: 'Create envelope custom fields' },
			{ name: 'Delete', value: 'delete', description: 'Remove a custom field from an envelope', action: 'Delete an envelope custom field' },
			{ name: 'Get Many', value: 'list', description: 'List all custom fields on an envelope', action: 'List envelope custom fields' },
			{ name: 'Update', value: 'update', description: 'Update custom fields on an envelope', action: 'Update envelope custom fields' },
		],
		default: 'list',
	},
];
