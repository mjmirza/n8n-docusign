import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const bulkEnvelopeFields: INodeProperties[] = [
	accountIdField(['bulkEnvelope']),

	// ------------------------------------------------------------------
	// Bulk Send List ID (get, update, delete, sendBulk)
	// ------------------------------------------------------------------
	{
		displayName: 'Bulk Send List ID',
		name: 'bulkSendListId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the bulk send list',
		displayOptions: {
			show: {
				resource: ['bulkEnvelope'],
				operation: ['getBulkSendList', 'updateBulkSendList', 'deleteBulkSendList', 'sendBulk'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Envelope or Template ID (sendBulk)
	// ------------------------------------------------------------------
	{
		displayName: 'Envelope or Template ID',
		name: 'envelopeOrTemplateId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the envelope or template to use for bulk sending',
		displayOptions: {
			show: {
				resource: ['bulkEnvelope'],
				operation: ['sendBulk'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Request Body (JSON) for createBulkSendList
	// ------------------------------------------------------------------
	{
		displayName: 'Request Body (JSON)',
		name: 'requestBody',
		type: 'json',
		default: '{\n  "name": "My Bulk Send List",\n  "bulkCopies": [\n    {\n      "recipients": [\n        {\n          "roleName": "Signer",\n          "name": "John Doe",\n          "email": "john@example.com"\n        }\n      ]\n    }\n  ]\n}',
		required: true,
		description: 'JSON body with bulk send list details including name and bulkCopies array. Each bulkCopy has recipients (with roleName, name, email, tabs) and optional customFields.',
		displayOptions: {
			show: {
				resource: ['bulkEnvelope'],
				operation: ['createBulkSendList'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Request Body (JSON) for updateBulkSendList
	// ------------------------------------------------------------------
	{
		displayName: 'Request Body (JSON)',
		name: 'updateBody',
		type: 'json',
		default: '{}',
		required: true,
		description: 'JSON body with updated bulk send list details',
		displayOptions: {
			show: {
				resource: ['bulkEnvelope'],
				operation: ['updateBulkSendList'],
			},
		},
	},
];
