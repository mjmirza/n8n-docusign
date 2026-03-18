import type { INodeProperties } from 'n8n-workflow';

export const signingGroupUserOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['signingGroupUser'] } },
		options: [
			{ name: 'Delete', value: 'delete', description: 'Remove users from a signing group', action: 'Remove users from a signing group' },
			{ name: 'Get Many', value: 'list', description: 'List users in a signing group', action: 'List users in a signing group' },
			{ name: 'Update', value: 'update', description: 'Update users in a signing group', action: 'Update users in a signing group' },
		],
		default: 'list',
	},
];
