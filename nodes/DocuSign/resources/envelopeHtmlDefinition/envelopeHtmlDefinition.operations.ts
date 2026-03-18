import type { INodeProperties } from 'n8n-workflow';

export const envelopeHtmlDefinitionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['envelopeHtmlDefinition'] } },
		options: [
			{ name: 'List', value: 'list', description: 'Get all HTML definitions for an envelope', action: 'List envelope HTML definitions' },
			{ name: 'Get Document', value: 'getDocument', description: 'Get HTML definitions for a specific document', action: 'Get document HTML definitions' },
		],
		default: 'list',
	},
];
