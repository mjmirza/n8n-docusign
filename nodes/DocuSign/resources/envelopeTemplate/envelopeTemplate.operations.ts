import type { INodeProperties } from 'n8n-workflow';

export const envelopeTemplateOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['envelopeTemplate'] } },
		options: [
			{ name: 'Apply', value: 'apply', description: 'Apply a template to an existing envelope', action: 'Apply template to envelope' },
			{ name: 'Apply to Document', value: 'applyToDocument', description: 'Apply a template to a specific document in an envelope', action: 'Apply template to document' },
			{ name: 'Delete', value: 'delete', description: 'Remove a template from an envelope', action: 'Delete template from envelope' },
			{ name: 'Get Many', value: 'list', description: 'List templates applied to an envelope', action: 'List envelope templates' },
			{ name: 'List by Document', value: 'listByDocument', description: 'List templates applied to a specific document', action: 'List templates by document' },
		],
		default: 'list',
	},
];
