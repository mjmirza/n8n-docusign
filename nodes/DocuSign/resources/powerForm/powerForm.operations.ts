import type { INodeProperties } from 'n8n-workflow';

export const powerFormOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['powerForm'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a PowerForm', action: 'Create a powerform' },
			{ name: 'Delete', value: 'delete', description: 'Delete a PowerForm', action: 'Delete a powerform' },
			{ name: 'Delete Many', value: 'deleteList', description: 'Delete multiple PowerForms', action: 'Delete multiple powerforms' },
			{ name: 'Get', value: 'get', description: 'Get a PowerForm', action: 'Get a powerform' },
			{ name: 'Get Many', value: 'list', description: 'List all PowerForms', action: 'List powerforms' },
			{ name: 'List Senders', value: 'listSenders', description: 'List PowerForm senders', action: 'List powerform senders' },
			{ name: 'Update', value: 'update', description: 'Update a PowerForm', action: 'Update a powerform' },
		],
		default: 'list',
	},
];
