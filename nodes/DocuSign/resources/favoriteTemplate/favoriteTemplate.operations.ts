import type { INodeProperties } from 'n8n-workflow';

export const favoriteTemplateOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['favoriteTemplate'] } },
		options: [
			{ name: 'Get', value: 'get', description: 'Get favorite templates', action: 'Get favorite templates' },
			{ name: 'Un-Favorite', value: 'unFavorite', description: 'Remove templates from favorites', action: 'Remove templates from favorites' },
			{ name: 'Update', value: 'update', description: 'Set favorite templates', action: 'Set favorite templates' },
		],
		default: 'get',
	},
];
