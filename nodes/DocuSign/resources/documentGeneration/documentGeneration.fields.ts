import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, envelopeIdField } from '../../utils/descriptions';

export const documentGenerationFields: INodeProperties[] = [
	accountIdField(['documentGeneration']),
	envelopeIdField(['documentGeneration']),

	// Request Body — for update operation
	{
		displayName: 'Request Body (JSON)',
		name: 'requestBody',
		type: 'json',
		required: true,
		default: '{}',
		description: 'The JSON request body with document generation form field data',
		displayOptions: {
			show: { resource: ['documentGeneration'], operation: ['updateFormFields'] },
		},
	},
];
