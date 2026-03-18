import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, templateIdField, documentIdField } from '../../utils/descriptions';

export const templateDocumentTabFields: INodeProperties[] = [
	accountIdField(['templateDocumentTab']),
	templateIdField(['templateDocumentTab']),
	documentIdField(['templateDocumentTab']),

	{
		displayName: 'Page Number',
		name: 'pageNumber',
		type: 'string',
		required: true,
		default: '1',
		displayOptions: {
			show: { resource: ['templateDocumentTab'], operation: ['getByPage'] },
		},
	},

	{
		displayName: 'Request Body (JSON)',
		name: 'requestBody',
		type: 'json',
		default: '{}',
		description: 'The tabs JSON body. See DocuSign API docs for tab structure.',
		displayOptions: {
			show: { resource: ['templateDocumentTab'], operation: ['create', 'update', 'delete'] },
		},
	},
];
