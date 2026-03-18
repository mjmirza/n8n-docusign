import type { INodeProperties } from 'n8n-workflow';

export const notaryJurisdictionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['notaryJurisdiction'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a notary jurisdiction', action: 'Create a notary jurisdiction' },
			{ name: 'Delete', value: 'delete', description: 'Delete a notary jurisdiction', action: 'Delete a notary jurisdiction' },
			{ name: 'Get', value: 'get', description: 'Get a notary jurisdiction', action: 'Get a notary jurisdiction' },
			{ name: 'List', value: 'list', description: 'List all notary jurisdictions', action: 'List all notary jurisdictions' },
			{ name: 'Update', value: 'update', description: 'Update a notary jurisdiction', action: 'Update a notary jurisdiction' },
		],
		default: 'list',
	},
];
