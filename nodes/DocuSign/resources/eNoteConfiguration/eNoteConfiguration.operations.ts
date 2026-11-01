import type { INodeProperties } from 'n8n-workflow';

export const eNoteConfigurationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['eNoteConfiguration'] } },
		options: [
			{ name: 'Delete', value: 'delete', description: 'Delete the eNote configuration', action: 'Delete the enote configuration' },
			{ name: 'Get', value: 'get', description: 'Get the eNote configuration', action: 'Get the enote configuration' },
			{ name: 'Update', value: 'update', description: 'Update the eNote configuration', action: 'Update the enote configuration' },
		],
		default: 'get',
	},
];
