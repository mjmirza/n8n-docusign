import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, templateIdField, documentIdField } from '../../utils/descriptions';

export const templateHtmlDefinitionFields: INodeProperties[] = [
	accountIdField(['templateHtmlDefinition']),
	templateIdField(['templateHtmlDefinition']),
	documentIdField(['templateHtmlDefinition'], ['listDocument', 'createDocResponsiveHtml']),

	{
		displayName: 'Request Body (JSON)',
		name: 'requestBody',
		type: 'json',
		default: '{}',
		description: 'The responsive HTML preview request body. See DocuSign API docs for structure.',
		displayOptions: {
			show: { resource: ['templateHtmlDefinition'], operation: ['createResponsiveHtml', 'createDocResponsiveHtml'] },
		},
	},
];
