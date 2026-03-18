import type { INodeProperties } from 'n8n-workflow';

export const userSignatureOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['userSignature'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a user signature', action: 'Create a user signature' },
			{ name: 'Delete', value: 'delete', description: 'Delete a user signature', action: 'Delete a user signature' },
			{ name: 'Delete Image', value: 'deleteImage', description: 'Delete a user signature image', action: 'Delete a user signature image' },
			{ name: 'Get', value: 'get', description: 'Get a user signature', action: 'Get a user signature' },
			{ name: 'Get Image', value: 'getImage', description: 'Get a user signature image', action: 'Get a user signature image' },
			{ name: 'Get Many', value: 'list', description: 'List user signatures', action: 'List user signatures' },
			{ name: 'Update', value: 'update', description: 'Update a user signature', action: 'Update a user signature' },
			{ name: 'Update Image', value: 'updateImage', description: 'Update a user signature image', action: 'Update a user signature image' },
			{ name: 'Update List', value: 'updateList', description: 'Update multiple user signatures', action: 'Update multiple user signatures' },
		],
		default: 'list',
	},
];
