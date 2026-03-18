import type { INodeProperties } from 'n8n-workflow';

export const chunkedUploadOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['chunkedUpload'] } },
		options: [
			{ name: 'Commit', value: 'commit', description: 'Commit a chunked upload after all parts are uploaded', action: 'Commit a chunked upload' },
			{ name: 'Create', value: 'create', description: 'Initiate a new chunked upload', action: 'Create a chunked upload' },
			{ name: 'Delete', value: 'delete', description: 'Delete a chunked upload', action: 'Delete a chunked upload' },
			{ name: 'Get', value: 'get', description: 'Get the status of a chunked upload', action: 'Get a chunked upload' },
			{ name: 'Update', value: 'update', description: 'Upload a chunk of data to an existing chunked upload', action: 'Upload a chunk' },
		],
		default: 'create',
	},
];
