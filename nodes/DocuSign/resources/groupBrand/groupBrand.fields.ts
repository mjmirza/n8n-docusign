import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const groupBrandFields: INodeProperties[] = [
	accountIdField(['groupBrand']),

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
			show: { resource: ['groupBrand'] },
		},
	},

	// ------------------------------------------------------------------
	// Brand ID (update, delete)
	// ------------------------------------------------------------------
	{
		displayName: 'Brand ID',
		name: 'brandId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the brand to add or remove',
		displayOptions: {
			show: { resource: ['groupBrand'], operation: ['update', 'delete'] },
		},
	},
];
