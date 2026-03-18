import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, envelopeIdField, documentIdField } from '../../utils/descriptions';

export const responsiveHtmlPreviewFields: INodeProperties[] = [
	accountIdField(['responsiveHtmlPreview']),
	envelopeIdField(['responsiveHtmlPreview']),
	documentIdField(['responsiveHtmlPreview'], ['createDocumentPreview']),

	// Request Body
	{
		displayName: 'Request Body (JSON)',
		name: 'requestBody',
		type: 'json',
		required: true,
		default: '{}',
		description: 'The JSON request body for the responsive HTML preview',
		displayOptions: {
			show: { resource: ['responsiveHtmlPreview'], operation: ['createEnvelopePreview', 'createDocumentPreview'] },
		},
	},
];
