import type { INodeProperties } from 'n8n-workflow';

export const bulkEnvelopeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['bulkEnvelope'] } },
		options: [
			{ name: 'Create Bulk Send List', value: 'createBulkSendList', description: 'Create a new bulk send list', action: 'Create a bulk send list' },
			{ name: 'Delete Bulk Send List', value: 'deleteBulkSendList', description: 'Delete a bulk send list', action: 'Delete a bulk send list' },
			{ name: 'Get Bulk Send List', value: 'getBulkSendList', description: 'Get a specific bulk send list', action: 'Get a bulk send list' },
			{ name: 'Get Many', value: 'listBulkSendLists', description: 'List all bulk send lists', action: 'List bulk send lists' },
			{ name: 'Send Bulk', value: 'sendBulk', description: 'Send envelopes in bulk from a bulk send list', action: 'Send bulk envelopes' },
			{ name: 'Update Bulk Send List', value: 'updateBulkSendList', description: 'Update a bulk send list', action: 'Update a bulk send list' },
		],
		default: 'listBulkSendLists',
	},
];
