import type { INodeProperties } from 'n8n-workflow';

export const envelopeDocumentVisibilityOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['envelopeDocumentVisibility'] } },
		options: [
			{ name: 'Get', value: 'get', description: 'Get document visibility for a recipient', action: 'Get document visibility' },
			{ name: 'Update', value: 'update', description: 'Update document visibility for a recipient', action: 'Update document visibility' },
			{ name: 'Update All Recipients', value: 'updateAll', description: 'Update document visibility for all recipients', action: 'Update all recipients document visibility' },
		],
		default: 'get',
	},
];
