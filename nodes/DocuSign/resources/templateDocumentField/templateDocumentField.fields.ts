import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, templateIdField, documentIdField } from '../../utils/descriptions';

export const templateDocumentFieldFields: INodeProperties[] = [
	accountIdField(['templateDocumentField']),
	templateIdField(['templateDocumentField']),
	documentIdField(['templateDocumentField']),

	{
		displayName: 'Document Fields',
		name: 'documentFields',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: {},
		placeholder: 'Add Field',
		displayOptions: {
			show: { resource: ['templateDocumentField'], operation: ['create', 'update', 'delete'] },
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
