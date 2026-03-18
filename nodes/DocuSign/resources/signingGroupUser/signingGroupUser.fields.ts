import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const signingGroupUserFields: INodeProperties[] = [
	accountIdField(['signingGroupUser']),

	// ------------------------------------------------------------------
	// Signing Group ID
	// ------------------------------------------------------------------
	{
		displayName: 'Signing Group ID',
		name: 'signingGroupId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the signing group',
		displayOptions: {
			show: {
				resource: ['signingGroupUser'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Users (JSON) for update and delete
	// ------------------------------------------------------------------
	{
		displayName: 'Users (JSON)',
		name: 'requestBody',
		type: 'json',
		default: '[]',
		required: true,
		description: 'Array of user objects as JSON. For update: [{email, userName}]. For delete: [{email}].',
		displayOptions: {
			show: { resource: ['signingGroupUser'], operation: ['update', 'delete'] },
		},
	},
];
