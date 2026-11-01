import type { INodeProperties } from 'n8n-workflow';

export const cloudStorageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['cloudStorage'] } },
		options: [
			{ name: 'List Files', value: 'listFiles', description: 'List files in a cloud storage folder', action: 'List files in cloud storage folder' },
			{ name: 'List Folders', value: 'listFolders', description: 'List folders for a cloud storage provider', action: 'List cloud storage folders' },
			{ name: 'List Providers', value: 'listProviders', description: 'List cloud storage providers for a user', action: 'List cloud storage providers' },
		],
		default: 'listProviders',
	},
];
