import type { INodeProperties } from 'n8n-workflow';

export const envelopeFormDataOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['envelopeFormData'] } },
		options: [
			{ name: 'Get', value: 'get', description: 'Get form field data from a completed envelope', action: 'Get envelope form data' },
		],
		default: 'get',
	},
];
