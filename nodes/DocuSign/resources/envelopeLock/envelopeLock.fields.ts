import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, envelopeIdField } from '../../utils/descriptions';

export const envelopeLockFields: INodeProperties[] = [
	accountIdField(['envelopeLock']),
	envelopeIdField(['envelopeLock']),

	{
		displayName: 'Lock Duration (Seconds)',
		name: 'lockDurationInSeconds',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 86400 },
		default: 300,
		description: 'How long to hold the lock (default 5 minutes)',
		displayOptions: {
			show: { resource: ['envelopeLock'], operation: ['create', 'update'] },
		},
	},
	{
		displayName: 'Lock Type',
		name: 'lockType',
		type: 'options',
		options: [
			{ name: 'Edit', value: 'edit' },
		],
		default: 'edit',
		displayOptions: {
			show: { resource: ['envelopeLock'], operation: ['create'] },
		},
	},
	{
		displayName: 'Locked By App',
		name: 'lockedByApp',
		type: 'string',
		default: 'n8n',
		required: true,
		description: 'Application identifier that holds the lock',
		displayOptions: {
			show: { resource: ['envelopeLock'], operation: ['create'] },
		},
	},
	{
		displayName: 'Use Scratch Pad',
		name: 'useScratchPad',
		type: 'options',
		options: [
			{ name: 'Yes', value: 'true' },
			{ name: 'No', value: 'false' },
		],
		default: 'false',
		description: 'Whether to use a scratch pad for editing',
		displayOptions: {
			show: { resource: ['envelopeLock'], operation: ['create'] },
		},
	},
	{
		displayName: 'Lock Token',
		name: 'lockToken',
		type: 'string',
		typeOptions: { password: true },
		default: '',
		description: 'The lock token received when the lock was created (required for update/delete)',
		displayOptions: {
			show: { resource: ['envelopeLock'], operation: ['update', 'delete'] },
		},
	},
];
