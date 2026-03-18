import type { INodeProperties } from 'n8n-workflow';

export const envelopePublishOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['envelopePublish'] } },
		options: [
			{ name: 'Create Historical', value: 'createHistorical', description: 'Publish historical envelope transactions', action: 'Create historical envelope publish' },
		],
		default: 'createHistorical',
	},
];
