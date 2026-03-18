import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, envelopeIdField, documentIdField } from '../../utils/descriptions';

export const envelopeDocumentFieldFields: INodeProperties[] = [
	accountIdField(['envelopeDocumentField']),
	envelopeIdField(['envelopeDocumentField']),
	documentIdField(['envelopeDocumentField']),

	{
		displayName: 'Document Fields',
		name: 'documentFields',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: {},
		placeholder: 'Add Field',
		displayOptions: {
			show: { resource: ['envelopeDocumentField'], operation: ['create', 'update', 'delete'] },
		},
		options: [
			{
				displayName: 'Field',
				name: 'field',
				values: [
					{ displayName: 'Name', name: 'name', type: 'string', default: '', required: true },
					{ displayName: 'Value', name: 'value', type: 'string', default: '' },
				],
			},
		],
	},
];
