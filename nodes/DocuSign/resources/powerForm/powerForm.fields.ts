import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const powerFormFields: INodeProperties[] = [
	accountIdField(['powerForm']),

	// ------------------------------------------------------------------
	// PowerForm ID (get, update, delete)
	// ------------------------------------------------------------------
	{
		displayName: 'PowerForm ID',
		name: 'powerFormId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the PowerForm',
		displayOptions: {
			show: {
				resource: ['powerForm'],
				operation: ['get', 'update', 'delete'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Request Body (JSON) for create, update
	// ------------------------------------------------------------------
	{
		displayName: 'Request Body (JSON)',
		name: 'requestBody',
		type: 'json',
		default: '{}',
		required: true,
		description: 'JSON body for the PowerForm. Fields: name (required), templateId (required), emailSubject, emailBody, signerLimit, maxUseCount, usesRemaining, isActive.',
		displayOptions: {
			show: {
				resource: ['powerForm'],
				operation: ['create', 'update'],
			},
		},
	},

	// ------------------------------------------------------------------
	// PowerForm IDs (comma-separated for deleteList)
	// ------------------------------------------------------------------
	{
		displayName: 'PowerForm IDs',
		name: 'powerFormIds',
		type: 'string',
		required: true,
		default: '',
		description: 'Comma-separated list of PowerForm IDs to delete',
		displayOptions: {
			show: {
				resource: ['powerForm'],
				operation: ['deleteList'],
			},
		},
	},
];
