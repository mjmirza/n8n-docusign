import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const envelopePublishFields: INodeProperties[] = [
	accountIdField(['envelopePublish']),

	// Request Body
	{
		displayName: 'Request Body (JSON)',
		name: 'requestBody',
		type: 'json',
		required: true,
		default: '{}',
		description: 'The JSON request body for the historical envelope publish',
		displayOptions: {
			show: { resource: ['envelopePublish'], operation: ['createHistorical'] },
		},
	},
];
