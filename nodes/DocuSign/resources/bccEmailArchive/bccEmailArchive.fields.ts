import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const bccEmailArchiveFields: INodeProperties[] = [
	accountIdField(['bccEmailArchive']),

	// ------------------------------------------------------------------
	// BCC Email Archive ID
	// ------------------------------------------------------------------
	{
		displayName: 'BCC Email Archive ID',
		name: 'bccEmailArchiveId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the BCC email archive configuration',
		displayOptions: {
			show: {
				resource: ['bccEmailArchive'],
				operation: ['get', 'delete'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Request Body (JSON) for create
	// ------------------------------------------------------------------
	{
		displayName: 'BCC Email Archive (JSON)',
		name: 'requestBody',
		type: 'json',
		default: '{}',
		required: true,
		description: 'The BCC email archive configuration as JSON. Fields include: bccEmailAddress (string), startDate (string), endDate (string), accountId (string).',
		displayOptions: {
			show: { resource: ['bccEmailArchive'], operation: ['create'] },
		},
	},
];
