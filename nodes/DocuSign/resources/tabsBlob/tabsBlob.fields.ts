import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, envelopeIdField } from '../../utils/descriptions';

export const tabsBlobFields: INodeProperties[] = [
	accountIdField(['tabsBlob']),
	envelopeIdField(['tabsBlob']),

	// Request Body — for update operation
	{
		displayName: 'Request Body (JSON)',
		name: 'requestBody',
		type: 'json',
		required: true,
		default: '{}',
		description: 'The JSON request body with tabs blob data',
		displayOptions: {
			show: { resource: ['tabsBlob'], operation: ['update'] },
		},
	},
];
