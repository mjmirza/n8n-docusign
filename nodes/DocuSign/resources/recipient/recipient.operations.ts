import type { INodeProperties } from 'n8n-workflow';

export const recipientOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['recipient'] } },
		options: [
			{
				name: 'Add',
				value: 'add',
				description: 'Add a recipient to an envelope',
				action: 'Add a recipient',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Remove a recipient from an envelope',
				action: 'Delete a recipient',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get all recipients of an envelope',
				action: 'Get many recipients',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a recipient on an envelope',
				action: 'Update a recipient',
			},
		],
		default: 'getAll',
	},
];
