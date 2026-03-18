import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const groupFields: INodeProperties[] = [
	accountIdField(['group']),

	// ------------------------------------------------------------------
	// Group ID (update, delete)
	// ------------------------------------------------------------------
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the group',
		displayOptions: {
			show: { resource: ['group'], operation: ['update', 'delete'] },
		},
	},

	// ------------------------------------------------------------------
	// Create: Group Name
	// ------------------------------------------------------------------
	{
		displayName: 'Group Name',
		name: 'groupName',
		type: 'string',
		required: true,
		default: '',
		description: 'The name of the group',
		displayOptions: {
			show: { resource: ['group'], operation: ['create'] },
		},
	},

	// ------------------------------------------------------------------
	// Create: Additional Fields
	// ------------------------------------------------------------------
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['group'], operation: ['create'] },
		},
		options: [
			{
				displayName: 'Permission Profile ID',
				name: 'permissionProfileId',
				type: 'string',
				default: '',
				description: 'The ID of the permission profile to assign to the group',
			},
		],
	},

	// ------------------------------------------------------------------
	// Update: Group Name
	// ------------------------------------------------------------------
	{
		displayName: 'Group Name',
		name: 'updateGroupName',
		type: 'string',
		required: true,
		default: '',
		description: 'The new name for the group',
		displayOptions: {
			show: { resource: ['group'], operation: ['update'] },
		},
	},
];
