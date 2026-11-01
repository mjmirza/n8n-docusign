import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, userIdField } from '../../utils/descriptions';

export const userProfileFields: INodeProperties[] = [
	accountIdField(['userProfile']),
	userIdField(['userProfile']),

	// ------------------------------------------------------------------
	// Update: Profile fields
	// ------------------------------------------------------------------
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['userProfile'], operation: ['update'] },
		},
		options: [
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Company',
				name: 'company',
				type: 'string',
				default: '',
				description: 'The company name',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Fax',
				name: 'fax',
				type: 'string',
				default: '',
				description: 'The fax number',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'The phone number',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'string',
				default: '',
				description: 'The state or province',
			},
			{
				displayName: 'Street 1',
				name: 'street1',
				type: 'string',
				default: '',
				description: 'The first line of the street address',
			},
			{
				displayName: 'Street 2',
				name: 'street2',
				type: 'string',
				default: '',
				description: 'The second line of the street address',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'The user title',
			},
			{
				displayName: 'User Details (JSON)',
				name: 'userDetails',
				type: 'json',
				default: '{}',
				description: 'Additional user details as JSON',
			},
			{
				displayName: 'ZIP',
				name: 'zip',
				type: 'string',
				default: '',
				description: 'The postal/ZIP code',
			},
		],
	},
];
