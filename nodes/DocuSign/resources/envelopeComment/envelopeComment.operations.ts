import type { INodeProperties } from 'n8n-workflow';

export const envelopeCommentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['envelopeComment'] } },
		options: [
			{ name: 'Get', value: 'get', description: 'Download the envelope comments transcript as a PDF', action: 'Get envelope comments' },
		],
		default: 'get',
	},
];
