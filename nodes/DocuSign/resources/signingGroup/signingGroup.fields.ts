import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const signingGroupFields: INodeProperties[] = [
	accountIdField(['signingGroup']),

	// ------------------------------------------------------------------
	// Signing Group ID (get)
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
				resource: ['signingGroup'],
				operation: ['get'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Request Body (JSON) for create, update, updateList, delete
	// ------------------------------------------------------------------
	{
		displayName: 'Groups (JSON)',
		name: 'requestBody',
		type: 'json',
		default: '[]',
		required: true,
		description: 'Array of signing group objects as JSON. For create: [{groupName, groupType, users:[{email, userName}]}]. For update: [{signingGroupId, groupName}]. For delete: [{signingGroupId}].',
		displayOptions: {
			show: { resource: ['signingGroup'], operation: ['create', 'update', 'updateList', 'delete'] },
		},
	},
];
