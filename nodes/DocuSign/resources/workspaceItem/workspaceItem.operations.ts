import type { INodeProperties } from 'n8n-workflow';

export const workspaceItemOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['workspaceItem'] } },
		options: [
			{ name: 'Create File', value: 'createFile', description: 'Upload a file to a workspace folder', action: 'Upload file to workspace' },
			{ name: 'Delete Folder Items', value: 'deleteFolderItems', description: 'Delete items from a workspace folder', action: 'Delete workspace folder items' },
			{ name: 'Get File', value: 'getFile', description: 'Download a file from a workspace', action: 'Download workspace file' },
			{ name: 'List File Pages', value: 'listFilePages', description: 'List pages of a workspace file', action: 'List workspace file pages' },
			{ name: 'List Folder Items', value: 'listFolderItems', description: 'List items in a workspace folder', action: 'List workspace folder items' },
			{ name: 'Update File', value: 'updateFile', description: 'Update a file in a workspace folder', action: 'Update workspace file' },
		],
		default: 'listFolderItems',
	},
];
