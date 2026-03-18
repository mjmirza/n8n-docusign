import type { INodeProperties } from 'n8n-workflow';

export const userProfileOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['userProfile'] } },
		options: [
			{ name: 'Get', value: 'get', description: 'Get a user profile', action: 'Get a user profile' },
			{ name: 'Update', value: 'update', description: 'Update a user profile', action: 'Update a user profile' },
		],
		default: 'get',
	},
];
