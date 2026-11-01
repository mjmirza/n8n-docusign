import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, envelopeIdField } from '../../utils/descriptions';

export const envelopeAttachmentFields: INodeProperties[] = [
	accountIdField(['envelopeAttachment']),
	envelopeIdField(['envelopeAttachment']),

	{
		displayName: 'Attachment ID',
		name: 'attachmentId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['envelopeAttachment'], operation: ['get', 'delete'] },
		},
	},
	{
		displayName: 'Attachment Name',
		name: 'attachmentName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['envelopeAttachment'], operation: ['create'] },
		},
	},
	{
		displayName: 'Attachment Type',
		name: 'attachmentType',
		type: 'options',
		options: [
			{ name: 'DOCX', value: '.docx' },
			{ name: 'JPG', value: '.jpg' },
			{ name: 'Other', value: 'other' },
			{ name: 'PDF', value: '.pdf' },
			{ name: 'PNG', value: '.png' },
		],
		default: '.pdf',
		displayOptions: {
			show: { resource: ['envelopeAttachment'], operation: ['create'] },
		},
	},
	{
		displayName: 'Source',
		name: 'source',
		type: 'options',
		options: [
			{ name: 'Binary Data (From Previous Node)', value: 'binary' },
			{ name: 'Base64 String', value: 'base64' },
		],
		default: 'binary',
		displayOptions: {
			show: { resource: ['envelopeAttachment'], operation: ['create'] },
		},
	},
	{
		displayName: 'Binary Property',
		name: 'binaryProperty',
		type: 'string',
		default: 'data',
		displayOptions: {
			show: { resource: ['envelopeAttachment'], operation: ['create'], source: ['binary'] },
		},
	},
	{
		displayName: 'Base64 Content',
		name: 'base64Content',
		type: 'string',
		default: '',
		displayOptions: {
			show: { resource: ['envelopeAttachment'], operation: ['create'], source: ['base64'] },
		},
	},
	{
		displayName: 'Access Control',
		name: 'accessControl',
		type: 'options',
		options: [
			{ name: 'Sender Only', value: 'senderOnly' },
			{ name: 'Sender and All Recipients', value: 'senderAndAllRecipients' },
		],
		default: 'senderAndAllRecipients',
		description: 'Who can access this attachment',
		displayOptions: {
			show: { resource: ['envelopeAttachment'], operation: ['create'] },
		},
	},
	{
		displayName: 'Label',
		name: 'label',
		type: 'string',
		default: '',
		description: 'Display label for the attachment',
		displayOptions: {
			show: { resource: ['envelopeAttachment'], operation: ['create'] },
		},
	},
	{
		displayName: 'Remote URL',
		name: 'remoteUrl',
		type: 'string',
		default: '',
		description: 'URL to fetch the attachment from (alternative to binary/base64)',
		displayOptions: {
			show: { resource: ['envelopeAttachment'], operation: ['create'] },
		},
	},
];
