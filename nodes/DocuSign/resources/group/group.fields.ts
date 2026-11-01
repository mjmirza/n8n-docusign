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
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: { resource: ['group'], operation: ['list'] },
		},
	},
	{
		displayName: 'Filters',
		name: 'groupFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: { resource: ['group'], operation: ['list'] },
		},
		options: [
			{ displayName: 'Count', name: 'count', type: 'number', typeOptions: { minValue: 1, maxValue: 100 }, default: 100, description: 'Groups per page, up to 100. Ignored when Return All is on.' },
			{ displayName: 'Group Type', name: 'groupType', type: 'options', options: [{ name: 'Admin Group', value: 'AdminGroup' }, { name: 'Custom Group', value: 'CustomGroup' }, { name: 'Everyone Group', value: 'EveryoneGroup' }], default: 'CustomGroup' },
			{ displayName: 'Include User Count', name: 'includeUsercount', type: 'boolean', default: false, description: 'Whether to include the number of users in each group' },
			{ displayName: 'Search Text', name: 'searchText', type: 'string', default: '', description: 'Only groups whose name contains this text' },
			{ displayName: 'Start Position', name: 'startPosition', type: 'number', typeOptions: { minValue: 0 }, default: 0, description: 'Position of the first group to return, for reading later pages. Ignored when Return All is on.' },
		],
	},
];
