import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const notaryJurisdictionFields: INodeProperties[] = [
	accountIdField(['notaryJurisdiction']),

	// ------------------------------------------------------------------
	// Jurisdiction ID
	// ------------------------------------------------------------------
	{
		displayName: 'Jurisdiction ID',
		name: 'jurisdictionId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the notary jurisdiction',
		displayOptions: {
			show: {
				resource: ['notaryJurisdiction'],
				operation: ['get', 'update', 'delete'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Request Body (JSON) for create and update
	// ------------------------------------------------------------------
	{
		displayName: 'Jurisdiction (JSON)',
		name: 'requestBody',
		type: 'json',
		default: '{}',
		required: true,
		description: 'The notary jurisdiction information as JSON. See the DocuSign API reference for available fields.',
		displayOptions: {
			show: { resource: ['notaryJurisdiction'], operation: ['create', 'update'] },
		},
	},
];
