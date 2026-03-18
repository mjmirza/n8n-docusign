import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, envelopeIdField, documentIdField } from '../../utils/descriptions';

export const envelopeDocumentTabFields: INodeProperties[] = [
	accountIdField(['envelopeDocumentTab']),
	envelopeIdField(['envelopeDocumentTab']),
	documentIdField(['envelopeDocumentTab']),

	{
		displayName: 'Page Number',
		name: 'pageNumber',
		type: 'string',
		required: true,
		default: '1',
		displayOptions: {
			show: { resource: ['envelopeDocumentTab'], operation: ['getByPage'] },
		},
	},

	{
		displayName: 'Request Body (JSON)',
		name: 'requestBody',
		type: 'json',
		default: '{}',
		description: 'The tabs JSON body. See DocuSign API docs for tab structure.',
		displayOptions: {
			show: { resource: ['envelopeDocumentTab'], operation: ['create', 'update', 'delete'] },
		},
	},
];
