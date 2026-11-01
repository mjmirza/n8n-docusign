import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, templateIdField } from '../../utils/descriptions';

export const templateViewFields: INodeProperties[] = [
	accountIdField(['templateView']),
	templateIdField(['templateView']),

	{
		displayName: 'Return URL',
		name: 'returnUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'The URL to redirect to after the user finishes editing the template',
		displayOptions: {
			show: { resource: ['templateView'], operation: ['createEdit'] },
		},
	},
	{
		displayName: 'View Access',
		name: 'viewAccess',
		type: 'options',
		options: [
			{ name: 'Template', value: 'template' },
			{ name: 'None', value: '' },
		],
		default: 'template',
		description: 'Set to "template" to limit access to the specified template only',
		displayOptions: {
			show: { resource: ['templateView'], operation: ['createEdit'] },
		},
	},
	{
		displayName: 'View Settings',
		name: 'viewSettings',
		type: 'collection',
		placeholder: 'Add Setting',
		default: {},
		description: 'Advanced view configuration settings',
		displayOptions: {
			show: { resource: ['templateView'], operation: ['createEdit'] },
		},
		options: [
			{ displayName: 'Back Button Action', name: 'backButtonAction', type: 'string', default: '', description: 'Action when back button is clicked' },
			{ displayName: 'Lock Token', name: 'lockToken', type: 'string', typeOptions: { password: true }, default: '', description: 'Lock token if template is locked' },
			{ displayName: 'Show Advanced Options', name: 'showAdvancedOptions', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
			{ displayName: 'Show Back Button', name: 'showBackButton', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
			{ displayName: 'Show Discard Action', name: 'showDiscardAction', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'true' },
			{ displayName: 'Show Header Actions', name: 'showHeaderActions', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'true' },
			{ displayName: 'Starting Screen', name: 'startingScreen', type: 'string', default: '', description: 'Initial screen to display (e.g., "tagger", "prepare", "recipients")' },
		],
	},
];
