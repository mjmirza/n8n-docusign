import type { INodeProperties } from 'n8n-workflow';

export const accountBrandOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['accountBrand'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a new brand', action: 'Create a brand' },
			{ name: 'Delete', value: 'delete', description: 'Delete a brand', action: 'Delete a brand' },
			{ name: 'Delete List', value: 'deleteList', description: 'Delete one or more brands', action: 'Delete brands from list' },
			{ name: 'Delete Logo', value: 'deleteLogo', description: 'Delete a brand logo', action: 'Delete a brand logo' },
			{ name: 'Get', value: 'get', description: 'Get a brand', action: 'Get a brand' },
			{ name: 'Get Export File', value: 'getExportFile', description: 'Export a brand to a file', action: 'Export a brand file' },
			{ name: 'Get Logo', value: 'getLogo', description: 'Get a brand logo', action: 'Get a brand logo' },
			{ name: 'Get Resource', value: 'getResource', description: 'Get a brand resource', action: 'Get a brand resource' },
			{ name: 'Get Many', value: 'list', description: 'List all brands', action: 'List brands' },
			{ name: 'List Resources', value: 'listResources', description: 'List brand resources', action: 'List brand resources' },
			{ name: 'Update', value: 'update', description: 'Update a brand', action: 'Update a brand' },
			{ name: 'Update Logo', value: 'updateLogo', description: 'Update a brand logo', action: 'Update a brand logo' },
			{ name: 'Update Resource', value: 'updateResource', description: 'Update a brand resource', action: 'Update a brand resource' },
		],
		default: 'list',
	},
];
