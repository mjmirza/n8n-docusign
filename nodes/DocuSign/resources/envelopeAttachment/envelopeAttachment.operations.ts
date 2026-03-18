import type { INodeProperties } from 'n8n-workflow';

export const envelopeAttachmentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['envelopeAttachment'] } },
		options: [
			{ name: 'Create / Update', value: 'create', description: 'Add or update an attachment on an envelope', action: 'Create envelope attachment' },
			{ name: 'Delete', value: 'delete', description: 'Remove an attachment from an envelope', action: 'Delete envelope attachment' },
			{ name: 'Get', value: 'get', description: 'Get a specific attachment', action: 'Get envelope attachment' },
			{ name: 'Get Many', value: 'list', description: 'List all attachments on an envelope', action: 'List envelope attachments' },
		],
		default: 'list',
	},
];
