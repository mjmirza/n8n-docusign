import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, envelopeIdField, recipientIdField } from '../../utils/descriptions';

export const envelopeDocumentVisibilityFields: INodeProperties[] = [
	accountIdField(['envelopeDocumentVisibility']),
	envelopeIdField(['envelopeDocumentVisibility']),
	recipientIdField(['envelopeDocumentVisibility'], ['get', 'update']),

	{
		displayName: 'Document Visibility (JSON)',
		name: 'documentVisibility',
		type: 'json',
		default: '[]',
		description: 'Array of {documentId, visible} objects. Example: [{"documentId":"1","visible":"true"}]',
		displayOptions: {
			show: { resource: ['envelopeDocumentVisibility'], operation: ['update', 'updateAll'] },
		},
	},
];
