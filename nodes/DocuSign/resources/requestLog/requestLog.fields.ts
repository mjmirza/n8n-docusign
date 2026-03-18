import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const requestLogFields: INodeProperties[] = [
	accountIdField(['requestLog']),

	// ------------------------------------------------------------------
	// Request Log ID
	// ------------------------------------------------------------------
	{
		displayName: 'Request Log ID',
		name: 'requestLogId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the request log to retrieve',
		displayOptions: {
			show: {
				resource: ['requestLog'],
				operation: ['get'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Update Settings: API Request Logging (JSON)
	// ------------------------------------------------------------------
	{
		displayName: 'API Request Logging (JSON)',
		name: 'requestBody',
		type: 'json',
		default: '{}',
		required: true,
		description: 'The logging settings as JSON. Fields include: apiRequestLogging (string: "true" or "false").',
		displayOptions: {
			show: { resource: ['requestLog'], operation: ['updateSettings'] },
		},
	},
];
