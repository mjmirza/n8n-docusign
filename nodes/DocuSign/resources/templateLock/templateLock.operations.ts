import type { INodeProperties } from 'n8n-workflow';

export const templateLockOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['templateLock'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Lock a template for exclusive editing', action: 'Lock a template' },
			{ name: 'Delete', value: 'delete', description: 'Unlock a template', action: 'Unlock a template' },
			{ name: 'Get', value: 'get', description: 'Get the lock information for a template', action: 'Get template lock' },
			{ name: 'Update', value: 'update', description: 'Update the lock on a template', action: 'Update template lock' },
		],
		default: 'get',
	},
];
