import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, templateIdField, recipientIdField } from '../../utils/descriptions';

export const templateDocumentVisibilityFields: INodeProperties[] = [
	accountIdField(['templateDocumentVisibility']),
	templateIdField(['templateDocumentVisibility']),
	recipientIdField(['templateDocumentVisibility'], ['get', 'update']),

	{
		displayName: 'Document Visibility (JSON)',
		name: 'documentVisibility',
		type: 'json',
		default: '[]',
		description: 'Array of {documentId, visible} objects. Example: [{"documentId":"1","visible":"true"}].',
		displayOptions: {
			show: { resource: ['templateDocumentVisibility'], operation: ['update', 'updateList'] },
		},
	},
];
