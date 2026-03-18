import type { INodeProperties } from 'n8n-workflow';

export const connectConfigurationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['connectConfiguration'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a Connect configuration', action: 'Create a connect configuration' },
			{ name: 'Delete', value: 'delete', description: 'Delete a Connect configuration', action: 'Delete a connect configuration' },
			{ name: 'Delete Event Log', value: 'deleteEventLog', description: 'Delete a Connect event log entry', action: 'Delete a connect event log entry' },
			{ name: 'Get', value: 'get', description: 'Get a Connect configuration', action: 'Get a connect configuration' },
			{ name: 'Get Event Failures', value: 'getEventFailures', description: 'Get Connect event failure log', action: 'Get connect event failures' },
			{ name: 'Get Event Log', value: 'getEventLog', description: 'Get Connect event log entries', action: 'Get connect event log' },
			{ name: 'Get Many', value: 'list', description: 'List all Connect configurations', action: 'List connect configurations' },
			{ name: 'Publish to Connect', value: 'publishToConnect', description: 'Publish historical envelope events to Connect', action: 'Publish historical envelopes to connect' },
			{ name: 'Retry Event for Envelope', value: 'retryEventForEnvelope', description: 'Retry delivering Connect events for an envelope', action: 'Retry connect events for envelope' },
			{ name: 'Update', value: 'update', description: 'Update a Connect configuration', action: 'Update a connect configuration' },
		],
		default: 'list',
	},
];
