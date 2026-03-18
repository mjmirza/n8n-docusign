import type { INodeProperties } from 'n8n-workflow';

export const accountSignatureOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['accountSignature'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create account signatures', action: 'Create account signatures' },
			{ name: 'Delete', value: 'delete', description: 'Delete an account signature', action: 'Delete an account signature' },
			{ name: 'Delete Image', value: 'deleteImage', description: 'Delete an account signature image', action: 'Delete an account signature image' },
			{ name: 'Get', value: 'get', description: 'Get an account signature', action: 'Get an account signature' },
			{ name: 'Get Image', value: 'getImage', description: 'Get an account signature image', action: 'Get an account signature image' },
			{ name: 'Get Many', value: 'list', description: 'List account signatures', action: 'List account signatures' },
			{ name: 'Update', value: 'update', description: 'Update account signatures', action: 'Update account signatures' },
			{ name: 'Update By ID', value: 'updateById', description: 'Update a specific account signature', action: 'Update a specific account signature' },
			{ name: 'Update Image', value: 'updateImage', description: 'Update an account signature image', action: 'Update an account signature image' },
		],
		default: 'list',
	},
];
