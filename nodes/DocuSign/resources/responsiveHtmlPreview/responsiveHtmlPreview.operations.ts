import type { INodeProperties } from 'n8n-workflow';

export const responsiveHtmlPreviewOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['responsiveHtmlPreview'] } },
		options: [
			{ name: 'Create Envelope Preview', value: 'createEnvelopePreview', description: 'Create a responsive HTML preview for an envelope', action: 'Create envelope responsive HTML preview' },
			{ name: 'Create Document Preview', value: 'createDocumentPreview', description: 'Create a responsive HTML preview for a specific document', action: 'Create document responsive HTML preview' },
		],
		default: 'createEnvelopePreview',
	},
];
