import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const userContactFields: INodeProperties[] = [
	accountIdField(['userContact']),

	// ------------------------------------------------------------------
	// Contact ID (get, delete)
	// ------------------------------------------------------------------
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the contact',
		displayOptions: {
			show: { resource: ['userContact'], operation: ['get', 'delete'] },
		},
	},

	// ------------------------------------------------------------------
	// Create: Contact fields
	// ------------------------------------------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'The full name of the contact',
		displayOptions: {
			show: { resource: ['userContact'], operation: ['create'] },
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['userContact'], operation: ['create'] },
		},
		options: [
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				default: '',
				description: 'A custom ID for the contact',
			},
			{
				displayName: 'Emails (JSON)',
				name: 'emails',
				type: 'json',
				default: '[]',
				description: 'Array of email objects, e.g. [{"email": "user@example.com"}]',
			},
			{
				displayName: 'Organization',
				name: 'organization',
				type: 'string',
				default: '',
				description: 'The organization of the contact',
			},
			{
				displayName: 'Phone Numbers (JSON)',
				name: 'contactPhoneNumbers',
				type: 'json',
				default: '[]',
				description: 'Array of phone number objects, e.g. [{"phoneNumber": "555-1234", "phoneType": "mobile"}]',
			},
			{
				displayName: 'Shared Contact',
				name: 'shared',
				type: 'boolean',
				default: false,
				description: 'Whether the contact is shared',
			},
			{
				displayName: 'Signing Group',
				name: 'signingGroup',
				type: 'string',
				default: '',
				description: 'The signing group ID',
			},
			{
				displayName: 'Signing Group Name',
				name: 'signingGroupName',
				type: 'string',
				default: '',
			},
		],
	},

	// ------------------------------------------------------------------
	// Update: Contacts body (JSON)
	// ------------------------------------------------------------------
	{
		displayName: 'Contacts (JSON)',
		name: 'contactsBody',
		type: 'json',
		default: '[]',
		required: true,
		description: 'Array of contact objects to update as JSON. Each must include contactId, name, emails, organization, contactPhoneNumbers.',
		displayOptions: {
			show: { resource: ['userContact'], operation: ['update'] },
		},
	},

	// ------------------------------------------------------------------
	// Delete List: Contact IDs
	// ------------------------------------------------------------------
	{
		displayName: 'Contact IDs',
		name: 'contactIds',
		type: 'string',
		required: true,
		default: '',
		description: 'Comma-separated list of contact IDs to delete',
		displayOptions: {
			show: { resource: ['userContact'], operation: ['deleteList'] },
		},
	},
];
