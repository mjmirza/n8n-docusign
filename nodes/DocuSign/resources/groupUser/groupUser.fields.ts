import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const groupUserFields: INodeProperties[] = [
	accountIdField(['groupUser']),

	// ------------------------------------------------------------------
	// Group ID
	// ------------------------------------------------------------------
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the group',
		displayOptions: {
			show: { resource: ['groupUser'] },
		},
	},

	// ------------------------------------------------------------------
	// Update: User details
	// ------------------------------------------------------------------
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the user to add or remove',
		displayOptions: {
			show: { resource: ['groupUser'], operation: ['update', 'delete'] },
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['groupUser'], operation: ['update'] },
		},
		options: [
			{
				displayName: 'User Name',
				name: 'userName',
				type: 'string',
				default: '',
				description: 'The name of the user',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'The email of the user',
			},
		],
	},
];
