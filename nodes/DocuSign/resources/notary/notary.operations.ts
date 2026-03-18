import type { INodeProperties } from 'n8n-workflow';

export const notaryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['notary'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Register the current user as a notary', action: 'Register as a notary' },
			{ name: 'Get', value: 'get', description: 'Get the current user notary information', action: 'Get notary information' },
			{ name: 'Update', value: 'update', description: 'Update the current user notary information', action: 'Update notary information' },
		],
		default: 'get',
	},
];
