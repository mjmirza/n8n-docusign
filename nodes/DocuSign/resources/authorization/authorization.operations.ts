import type { INodeProperties } from 'n8n-workflow';

export const authorizationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['authorization'] } },
		options: [
			{ name: 'Create User Authorization', value: 'createUserAuthorization', description: 'Create a single user authorization', action: 'Create a user authorization' },
			{ name: 'Create User Authorizations', value: 'createUserAuthorizations', description: 'Create multiple user authorizations', action: 'Create multiple user authorizations' },
			{ name: 'Delete User Authorization', value: 'deleteUserAuthorization', description: 'Delete a user authorization', action: 'Delete a user authorization' },
			{ name: 'Delete User Authorizations', value: 'deleteUserAuthorizations', description: 'Delete multiple user authorizations', action: 'Delete multiple user authorizations' },
			{ name: 'Get Agent User Authorizations', value: 'getAgentUserAuthorizations', description: 'Get authorizations where user is agent', action: 'Get agent user authorizations' },
			{ name: 'Get Principal User Authorizations', value: 'getPrincipalUserAuthorizations', description: 'Get authorizations where user is principal', action: 'Get principal user authorizations' },
			{ name: 'Get User Authorization', value: 'getUserAuthorization', description: 'Get a specific user authorization', action: 'Get a user authorization' },
			{ name: 'Update User Authorization', value: 'updateUserAuthorization', description: 'Update a user authorization', action: 'Update a user authorization' },
		],
		default: 'getAgentUserAuthorizations',
	},
];
