import type { INodeProperties } from 'n8n-workflow';

export const accountConsumerDisclosureOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['accountConsumerDisclosure'] } },
		options: [
			{ name: 'Get', value: 'get', description: 'Get consumer disclosure for a specific language', action: 'Get consumer disclosure by language' },
			{ name: 'Get Default', value: 'getDefault', description: 'Get the default consumer disclosure', action: 'Get default consumer disclosure' },
			{ name: 'Update', value: 'update', description: 'Update consumer disclosure for a specific language', action: 'Update consumer disclosure' },
		],
		default: 'getDefault',
	},
];
