import type { INodeProperties } from 'n8n-workflow';

export const userContactOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['userContact'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a contact', action: 'Create a contact' },
			{ name: 'Delete', value: 'delete', description: 'Delete a contact', action: 'Delete a contact' },
			{ name: 'Delete List', value: 'deleteList', description: 'Delete multiple contacts', action: 'Delete multiple contacts' },
			{ name: 'Get', value: 'get', description: 'Get a contact', action: 'Get a contact' },
			{ name: 'Update', value: 'update', description: 'Update contacts', action: 'Update contacts' },
		],
		default: 'get',
	},
];
