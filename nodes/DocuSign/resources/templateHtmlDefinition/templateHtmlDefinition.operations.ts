import type { INodeProperties } from 'n8n-workflow';

export const templateHtmlDefinitionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['templateHtmlDefinition'] } },
		options: [
			{ name: 'List', value: 'list', description: 'Get HTML definitions for a template', action: 'List template HTML definitions' },
			{ name: 'List Document', value: 'listDocument', description: 'Get HTML definitions for a specific document', action: 'List document HTML definitions' },
			{ name: 'Create Responsive HTML', value: 'createResponsiveHtml', description: 'Create a responsive HTML preview for a template', action: 'Create responsive HTML preview' },
			{ name: 'Create Document Responsive HTML', value: 'createDocResponsiveHtml', description: 'Create a responsive HTML preview for a specific document', action: 'Create document responsive HTML preview' },
		],
		default: 'list',
	},
];
