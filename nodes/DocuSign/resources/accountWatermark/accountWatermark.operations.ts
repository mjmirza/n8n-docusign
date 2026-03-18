import type { INodeProperties } from 'n8n-workflow';

export const accountWatermarkOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['accountWatermark'] } },
		options: [
			{ name: 'Get', value: 'get', description: 'Get the account watermark', action: 'Get account watermark' },
			{ name: 'Preview', value: 'preview', description: 'Preview a watermark', action: 'Preview account watermark' },
			{ name: 'Update', value: 'update', description: 'Update the account watermark', action: 'Update account watermark' },
		],
		default: 'get',
	},
];
