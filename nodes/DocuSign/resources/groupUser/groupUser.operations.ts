import type { INodeProperties } from 'n8n-workflow';

export const groupUserOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['groupUser'] } },
		options: [
			{ name: 'Delete', value: 'delete', description: 'Remove a user from a group', action: 'Remove a user from a group' },
			{ name: 'Get Many', value: 'list', description: 'List users in a group', action: 'List users in a group' },
			{ name: 'Update', value: 'update', description: 'Add users to a group', action: 'Add users to a group' },
		],
		default: 'list',
	},
];
