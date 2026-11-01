import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, templateIdField, documentIdField, binaryPropertyField } from '../../utils/descriptions';

export const templateDocumentFields: INodeProperties[] = [
	accountIdField(['templateDocument']),
	templateIdField(['templateDocument']),
	documentIdField(['templateDocument'], ['get', 'delete', 'update']),
	binaryPropertyField(['templateDocument'], ['get']),

	{
		displayName: 'Document',
		name: 'documentData',
		type: 'fixedCollection',
		default: {},
		displayOptions: { show: { resource: ['templateDocument'], operation: ['update'] } },
		options: [
			{
				displayName: 'Content',
				name: 'content',
				values: [
					{ displayName: 'Base64 Content', name: 'documentBase64', type: 'string', default: '', displayOptions: { show: { source: ['base64'] } } },
					{ displayName: 'Binary Property', name: 'binaryProperty', type: 'string', default: 'data', displayOptions: { show: { source: ['binary'] } } },
					{ displayName: 'Document Name', name: 'name', type: 'string', default: '' },
					{ displayName: 'File Extension', name: 'fileExtension', type: 'options', options: [{ name: 'PDF', value: 'pdf' }, { name: 'DOCX', value: 'docx' }, { name: 'HTML', value: 'html' }], default: 'pdf' },
					{
						displayName: 'Source',
						name: 'source',
						type: 'options',
						options: [
							{ name: 'Binary Data', value: 'binary' },
							{ name: 'Base64 String', value: 'base64' },
						],
						default: 'binary',
					},
				],
			},
		],
	},

	{
		displayName: 'Documents (JSON)',
		name: 'documentsJson',
		type: 'json',
		default: '[]',
		description: 'Array of document objects for bulk update',
		displayOptions: { show: { resource: ['templateDocument'], operation: ['updateList'] } },
	},
];
