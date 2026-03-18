import type { INodeProperties } from 'n8n-workflow';

export const envelopeTransferRuleOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['envelopeTransferRule'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create an envelope transfer rule', action: 'Create envelope transfer rule' },
			{ name: 'Delete', value: 'delete', description: 'Delete an envelope transfer rule', action: 'Delete envelope transfer rule' },
			{ name: 'Get Many', value: 'get', description: 'Get all envelope transfer rules', action: 'Get envelope transfer rules' },
			{ name: 'Update', value: 'update', description: 'Update a specific envelope transfer rule', action: 'Update envelope transfer rule' },
			{ name: 'Update Rules', value: 'updateRule', description: 'Bulk update envelope transfer rules', action: 'Bulk update envelope transfer rules' },
		],
		default: 'get',
	},
];
