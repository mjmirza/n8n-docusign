import type { INodeProperties } from 'n8n-workflow';

export const identityVerificationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['identityVerification'] } },
		options: [
			{ name: 'Get Many', value: 'list', description: 'List identity verification providers', action: 'List identity verification providers' },
		],
		default: 'list',
	},
];
