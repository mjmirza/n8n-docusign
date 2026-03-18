import type { INodeProperties } from 'n8n-workflow';

export const envelopeCommentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['envelopeComment'] } },
		options: [
			{ name: 'Get', value: 'get', description: 'Get comments for an envelope', action: 'Get envelope comments' },
		],
		default: 'get',
	},
];
