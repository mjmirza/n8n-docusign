import type { INodeProperties } from 'n8n-workflow';

export const envelopeLockOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['envelopeLock'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Lock an envelope for exclusive editing', action: 'Lock an envelope' },
			{ name: 'Delete', value: 'delete', description: 'Unlock an envelope', action: 'Unlock an envelope' },
			{ name: 'Get', value: 'get', description: 'Get the lock information for an envelope', action: 'Get envelope lock' },
			{ name: 'Update', value: 'update', description: 'Update the lock on an envelope', action: 'Update envelope lock' },
		],
		default: 'get',
	},
];
