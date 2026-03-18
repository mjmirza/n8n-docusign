import type { INodeProperties } from 'n8n-workflow';

export const templateViewOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['templateView'] } },
		options: [
			{ name: 'Create Edit View', value: 'createEdit', description: 'Generate an edit view URL for a template', action: 'Create template edit view' },
		],
		default: 'createEdit',
	},
];
