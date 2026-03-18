import type { INodeProperties } from 'n8n-workflow';

export const signingGroupOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['signingGroup'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create signing groups', action: 'Create signing groups' },
			{ name: 'Delete', value: 'delete', description: 'Delete signing groups', action: 'Delete signing groups' },
			{ name: 'Get', value: 'get', description: 'Get a signing group', action: 'Get a signing group' },
			{ name: 'Get Many', value: 'list', description: 'List signing groups', action: 'List signing groups' },
			{ name: 'Update', value: 'update', description: 'Update signing groups', action: 'Update signing groups' },
			{ name: 'Update List', value: 'updateList', description: 'Update multiple signing groups', action: 'Update multiple signing groups' },
		],
		default: 'list',
	},
];
