import type { INodeProperties } from 'n8n-workflow';

export const templateRecipientOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['templateRecipient'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Add a recipient role to a template', action: 'Create template recipient' },
			{ name: 'Create Preview', value: 'createPreview', description: 'Create a recipient preview URL', action: 'Create template recipient preview' },
			{ name: 'Delete', value: 'delete', description: 'Remove a recipient from a template', action: 'Delete template recipient' },
			{ name: 'Delete Many', value: 'deleteList', description: 'Remove multiple recipients from a template', action: 'Delete template recipients' },
			{ name: 'Get Many', value: 'list', description: 'List all recipients on a template', action: 'List template recipients' },
			{ name: 'Update', value: 'update', description: 'Update a recipient on a template', action: 'Update template recipient' },
		],
		default: 'list',
	},
];
