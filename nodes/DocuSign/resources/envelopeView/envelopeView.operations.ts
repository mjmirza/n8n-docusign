import type { INodeProperties } from 'n8n-workflow';

export const envelopeViewOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['envelopeView'] } },
		options: [
			{ name: 'Create Console View', value: 'createConsole', description: 'Generate an admin console URL', action: 'Create console view' },
			{ name: 'Create Correct View', value: 'createCorrect', description: 'Generate a URL to correct recipient information', action: 'Create correct view' },
			{ name: 'Create Edit View', value: 'createEdit', description: 'Generate a URL to edit the envelope', action: 'Create edit view' },
			{ name: 'Create Recipient View', value: 'createRecipient', description: 'Generate an embedded signing URL for a recipient', action: 'Create recipient view' },
			{ name: 'Create Sender View', value: 'createSender', description: 'Generate a URL for the sender to review', action: 'Create sender view' },
			{ name: 'Create Shared Recipient View', value: 'createSharedRecipient', description: 'Generate a shared recipient signing URL', action: 'Create shared recipient view' },
			{ name: 'Delete Correct View', value: 'deleteCorrectView', description: 'Delete a correct view', action: 'Delete correct view' },
		],
		default: 'createRecipient',
	},
];
