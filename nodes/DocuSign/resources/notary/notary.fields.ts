import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const notaryFields: INodeProperties[] = [
	accountIdField(['notary']),

	// ------------------------------------------------------------------
	// Request Body (JSON) for create and update
	// ------------------------------------------------------------------
	{
		displayName: 'Notary Information (JSON)',
		name: 'requestBody',
		type: 'json',
		default: '{}',
		required: true,
		description: 'The notary information as JSON. See the DocuSign API reference for available fields.',
		displayOptions: {
			show: { resource: ['notary'], operation: ['create', 'update'] },
		},
	},
];
