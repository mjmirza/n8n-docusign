import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, templateIdField } from '../../utils/descriptions';

export const templateCustomFieldFields: INodeProperties[] = [
	accountIdField(['templateCustomField']),
	templateIdField(['templateCustomField']),

	// ------------------------------------------------------------------
	// Create / Update: Custom Field Definitions
	// ------------------------------------------------------------------
	{
		displayName: 'Text Custom Fields',
		name: 'textCustomFields',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: {},
		placeholder: 'Add Text Field',
		displayOptions: {
			show: { resource: ['templateCustomField'], operation: ['create', 'update'] },
		},
		options: [
			{
				displayName: 'Field',
				name: 'field',
				values: [
					{ displayName: 'Field ID', name: 'fieldId', type: 'string', default: '', description: 'Required for update/delete. Auto-generated on create.' },
					{ displayName: 'Name', name: 'name', type: 'string', default: '', required: true, description: 'The name of the custom field' },
					{ displayName: 'Required', name: 'required', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
					{ displayName: 'Show', name: 'show', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'true', description: 'Whether to show this field to senders' },
					{ displayName: 'Value', name: 'value', type: 'string', default: '', description: 'The value of the custom field' },
				],
			},
		],
	},
	{
		displayName: 'List Custom Fields',
		name: 'listCustomFields',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: {},
		placeholder: 'Add List Field',
		displayOptions: {
			show: { resource: ['templateCustomField'], operation: ['create', 'update'] },
		},
		options: [
			{
				displayName: 'Field',
				name: 'field',
				values: [
					{ displayName: 'Field ID', name: 'fieldId', type: 'string', default: '' },
					{ displayName: 'List Items', name: 'listItems', type: 'string', default: '', description: 'Semicolon-separated list of values (e.g., "Option A;Option B;Option C")' },
					{ displayName: 'Name', name: 'name', type: 'string', default: '', required: true },
					{ displayName: 'Required', name: 'required', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
					{ displayName: 'Show', name: 'show', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'true' },
					{ displayName: 'Value', name: 'value', type: 'string', default: '', description: 'The selected value' },
				],
			},
		],
	},

	// ------------------------------------------------------------------
	// Delete: Field ID
	// ------------------------------------------------------------------
	{
		displayName: 'Field ID',
		name: 'customFieldId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the custom field to delete',
		displayOptions: {
			show: { resource: ['templateCustomField'], operation: ['delete'] },
		},
	},
];
