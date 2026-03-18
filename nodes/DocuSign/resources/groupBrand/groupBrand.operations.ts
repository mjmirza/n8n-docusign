import type { INodeProperties } from 'n8n-workflow';

export const groupBrandOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['groupBrand'] } },
		options: [
			{ name: 'Delete', value: 'delete', description: 'Remove brands from a group', action: 'Remove brands from a group' },
			{ name: 'Get', value: 'get', description: 'Get brands for a group', action: 'Get brands for a group' },
			{ name: 'Update', value: 'update', description: 'Add brands to a group', action: 'Add brands to a group' },
		],
		default: 'get',
	},
];
