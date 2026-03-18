import type { INodeProperties } from 'n8n-workflow';

export const templateRecipientTabOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['templateRecipientTab'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Add tabs to a recipient', action: 'Create recipient tabs' },
			{ name: 'Delete', value: 'delete', description: 'Remove tabs from a recipient', action: 'Delete recipient tabs' },
			{ name: 'Get Many', value: 'list', description: 'List all tabs for a recipient', action: 'List recipient tabs' },
			{ name: 'Update', value: 'update', description: 'Update tabs on a recipient', action: 'Update recipient tabs' },
		],
		default: 'list',
	},
];
