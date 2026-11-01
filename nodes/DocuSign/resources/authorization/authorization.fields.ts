import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, userIdField } from '../../utils/descriptions';

export const authorizationFields: INodeProperties[] = [
	accountIdField(['authorization']),
	userIdField(['authorization']),

	// ------------------------------------------------------------------
	// Authorization ID (get, delete, update single)
	// ------------------------------------------------------------------
	{
		displayName: 'Authorization ID',
		name: 'authorizationId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the authorization',
		displayOptions: {
			show: {
				resource: ['authorization'],
				operation: ['getUserAuthorization', 'deleteUserAuthorization', 'updateUserAuthorization'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Create single: Authorization fields
	// ------------------------------------------------------------------
	{
		displayName: 'Agent User ID',
		name: 'agentUserId',
		type: 'string',
		required: true,
		default: '',
		description: 'The user ID of the agent',
		displayOptions: {
			show: { resource: ['authorization'], operation: ['createUserAuthorization'] },
		},
	},
	{
		displayName: 'Permission',
		name: 'permission',
		type: 'options',
		required: true,
		options: [
			{ name: 'Manage', value: 'manage' },
			{ name: 'Sign', value: 'sign' },
		],
		default: 'manage',
		description: 'The permission level for the authorization',
		displayOptions: {
			show: { resource: ['authorization'], operation: ['createUserAuthorization'] },
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['authorization'], operation: ['createUserAuthorization'] },
		},
		options: [
			{
				displayName: 'Agent Account ID',
				name: 'agentAccountId',
				type: 'string',
				default: '',
				description: 'The account ID of the agent user',
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'string',
				default: '',
				description: 'The start date of the authorization (ISO 8601 format)',
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'string',
				default: '',
				description: 'The end date of the authorization (ISO 8601 format)',
			},
		],
	},

	// ------------------------------------------------------------------
	// Create multiple: Authorizations body (JSON)
	// ------------------------------------------------------------------
	{
		displayName: 'Authorizations (JSON)',
		name: 'authorizationsBody',
		type: 'json',
		default: '[]',
		required: true,
		description: 'Array of authorization objects as JSON',
		displayOptions: {
			show: { resource: ['authorization'], operation: ['createUserAuthorizations'] },
		},
	},

	// ------------------------------------------------------------------
	// Delete multiple: Authorization IDs body (JSON)
	// ------------------------------------------------------------------
	{
		displayName: 'Authorization IDs (JSON)',
		name: 'deleteAuthorizationsBody',
		type: 'json',
		default: '[]',
		required: true,
		description: 'JSON array of authorizations to delete, e.g. [{"authorizationId": "abc"}], or a full { "authorizations": [...] } body',
		displayOptions: {
			show: { resource: ['authorization'], operation: ['deleteUserAuthorizations'] },
		},
	},

	// ------------------------------------------------------------------
	// Update: Authorization body (JSON)
	// ------------------------------------------------------------------
	{
		displayName: 'Update Body (JSON)',
		name: 'updateBody',
		type: 'json',
		default: '{}',
		required: true,
		description: 'The authorization properties to update as JSON',
		displayOptions: {
			show: { resource: ['authorization'], operation: ['updateUserAuthorization'] },
		},
	},
];
