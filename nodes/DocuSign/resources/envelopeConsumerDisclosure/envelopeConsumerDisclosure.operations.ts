import type { INodeProperties } from 'n8n-workflow';

export const envelopeConsumerDisclosureOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['envelopeConsumerDisclosure'] } },
		options: [
			{ name: 'Get', value: 'get', description: 'Get consumer disclosure for a recipient', action: 'Get consumer disclosure' },
			{ name: 'Get by Language', value: 'getDefault', description: 'Get consumer disclosure for a recipient in a specific language', action: 'Get consumer disclosure by language' },
		],
		default: 'get',
	},
];
