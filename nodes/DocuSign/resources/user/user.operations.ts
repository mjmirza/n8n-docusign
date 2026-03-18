import type { INodeProperties } from 'n8n-workflow';

export const userOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['user'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a new user', action: 'Create a user' },
			{ name: 'Delete', value: 'delete', description: 'Delete a user', action: 'Delete a user' },
			{ name: 'Delete Profile Image', value: 'deleteProfileImage', description: 'Delete a user profile image', action: 'Delete a user profile image' },
			{ name: 'Get', value: 'get', description: 'Get a user', action: 'Get a user' },
			{ name: 'Get Many', value: 'list', description: 'List users', action: 'List users' },
			{ name: 'Get Profile Image', value: 'getProfileImage', description: 'Get a user profile image', action: 'Get a user profile image' },
			{ name: 'Get Settings', value: 'getSettings', description: 'Get user settings', action: 'Get user settings' },
			{ name: 'Update', value: 'update', description: 'Update a user', action: 'Update a user' },
			{ name: 'Update List', value: 'updateList', description: 'Update multiple users', action: 'Update multiple users' },
			{ name: 'Update Profile Image', value: 'updateProfileImage', description: 'Update a user profile image', action: 'Update a user profile image' },
			{ name: 'Update Settings', value: 'updateSettings', description: 'Update user settings', action: 'Update user settings' },
		],
		default: 'list',
	},
];
