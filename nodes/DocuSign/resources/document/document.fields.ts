import type { INodeProperties } from 'n8n-workflow';

export const documentFields: INodeProperties[] = [
	// ------------------------------------------------------------------
	// Account ID
	// ------------------------------------------------------------------
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		required: true,
		default: '',
		description:
			'The DocuSign Account ID (GUID). Find it in DocuSign Admin > Account > API.',
		displayOptions: {
			show: { resource: ['document'] },
		},
	},

	// ------------------------------------------------------------------
	// Envelope ID
	// ------------------------------------------------------------------
	{
		displayName: 'Envelope ID',
		name: 'envelopeId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID (GUID) of the envelope',
		displayOptions: {
			show: { resource: ['document'] },
		},
	},

	// ------------------------------------------------------------------
	// Download: Document ID
	// ------------------------------------------------------------------
	{
		displayName: 'Document ID',
		name: 'documentId',
		type: 'string',
		required: true,
		default: '1',
		description:
			'The numeric ID of the document to download. Use "combined" for all documents merged, "archive" for a ZIP, or "certificate" for the Certificate of Completion.',
		displayOptions: {
			show: { resource: ['document'], operation: ['download'] },
		},
	},

	// ------------------------------------------------------------------
	// Download: Binary Property
	// ------------------------------------------------------------------
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		description: 'The name of the binary property to store the downloaded file',
		displayOptions: {
			show: { resource: ['document'], operation: ['download'] },
		},
	},
];
