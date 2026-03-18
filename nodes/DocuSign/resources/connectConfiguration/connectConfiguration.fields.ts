import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const connectConfigurationFields: INodeProperties[] = [
	accountIdField(['connectConfiguration']),

	// ------------------------------------------------------------------
	// Connect ID (get, update, delete)
	// ------------------------------------------------------------------
	{
		displayName: 'Connect ID',
		name: 'connectId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the Connect configuration',
		displayOptions: {
			show: {
				resource: ['connectConfiguration'],
				operation: ['get', 'update', 'delete'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Log ID (deleteEventLog)
	// ------------------------------------------------------------------
	{
		displayName: 'Log ID',
		name: 'logId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the Connect event log entry to delete',
		displayOptions: {
			show: {
				resource: ['connectConfiguration'],
				operation: ['deleteEventLog'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Envelope ID (retryEventForEnvelope)
	// ------------------------------------------------------------------
	{
		displayName: 'Envelope ID',
		name: 'envelopeId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the envelope to retry Connect events for',
		displayOptions: {
			show: {
				resource: ['connectConfiguration'],
				operation: ['retryEventForEnvelope'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Request Body (JSON) for create, update, publishToConnect
	// ------------------------------------------------------------------
	{
		displayName: 'Request Body (JSON)',
		name: 'requestBody',
		type: 'json',
		default: '{}',
		required: true,
		description: 'JSON body for the request. For create/update: { "urlToPublishTo", "name", "allUsers", "allowEnvelopePublish", "envelopeEvents", "recipientEvents", ... }. For publish: { "envelopeIds": [...] }.',
		displayOptions: {
			show: {
				resource: ['connectConfiguration'],
				operation: ['create', 'update', 'publishToConnect'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Filters for getEventLog
	// ------------------------------------------------------------------
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['connectConfiguration'],
				operation: ['getEventLog'],
			},
		},
		options: [
			{
				displayName: 'From Date',
				name: 'from_date',
				type: 'string',
				default: '',
				description: 'Start date for log entries (ISO 8601)',
			},
			{
				displayName: 'To Date',
				name: 'to_date',
				type: 'string',
				default: '',
				description: 'End date for log entries (ISO 8601)',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'string',
				default: '',
				description: 'Filter by status (e.g., "Failed", "Sent")',
			},
		],
	},
];
