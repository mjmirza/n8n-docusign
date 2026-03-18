import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const accountCustomFieldFields: INodeProperties[] = [
	accountIdField(['accountCustomField']),

	// ------------------------------------------------------------------
	// Custom Field ID (update, delete)
	// ------------------------------------------------------------------
	{
		displayName: 'Custom Field ID',
		name: 'customFieldId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the custom field',
		displayOptions: {
			show: {
				resource: ['accountCustomField'],
				operation: ['update', 'delete'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Create / Update: Field Type
	// ------------------------------------------------------------------
	{
		displayName: 'Field Type',
		name: 'fieldType',
		type: 'options',
		required: true,
		options: [
			{ name: 'Text', value: 'text' },
			{ name: 'List', value: 'list' },
		],
		default: 'text',
		description: 'The type of custom field',
		displayOptions: {
			show: { resource: ['accountCustomField'], operation: ['create', 'update'] },
		},
	},

	// ------------------------------------------------------------------
	// Create / Update: Name
	// ------------------------------------------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'The name of the custom field',
		displayOptions: {
			show: { resource: ['accountCustomField'], operation: ['create', 'update'] },
		},
	},

	// ------------------------------------------------------------------
	// Create / Update: Additional Fields
	// ------------------------------------------------------------------
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['accountCustomField'], operation: ['create', 'update'] },
		},
		options: [
			{
				displayName: 'Required',
				name: 'required',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
				default: 'false',
				description: 'Whether the custom field is required',
			},
			{
				displayName: 'Show',
				name: 'show',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
				default: 'true',
				description: 'Whether the custom field is visible to senders',
			},
			{
				displayName: 'Value',
				name: 'value',
				type: 'string',
				default: '',
				description: 'The default value of the custom field',
			},
			{
				displayName: 'List Items',
				name: 'listItems',
				type: 'string',
				default: '',
				description: 'Semicolon-separated list of values for list-type fields (e.g., "Option A;Option B;Option C")',
				displayOptions: {
					show: { '/fieldType': ['list'] },
				},
			},
		],
	},
];
