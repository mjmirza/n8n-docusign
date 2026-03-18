import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, envelopeIdField } from '../../utils/descriptions';

export const envelopeEmailSettingFields: INodeProperties[] = [
	accountIdField(['envelopeEmailSetting']),
	envelopeIdField(['envelopeEmailSetting']),

	{
		displayName: 'Reply Email Address',
		name: 'replyEmailAddressOverride',
		type: 'string',
		default: '',
		description: 'Override the reply-to email address',
		displayOptions: {
			show: { resource: ['envelopeEmailSetting'], operation: ['create', 'update'] },
		},
	},
	{
		displayName: 'Reply Email Name',
		name: 'replyEmailNameOverride',
		type: 'string',
		default: '',
		description: 'Override the reply-to display name',
		displayOptions: {
			show: { resource: ['envelopeEmailSetting'], operation: ['create', 'update'] },
		},
	},
	{
		displayName: 'BCC Email Addresses',
		name: 'bccEmailAddresses',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: {},
		placeholder: 'Add BCC Address',
		displayOptions: {
			show: { resource: ['envelopeEmailSetting'], operation: ['create', 'update'] },
		},
		options: [
			{
				displayName: 'Address',
				name: 'address',
				values: [
					{ displayName: 'Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '', required: true },
				],
			},
		],
	},
];
