import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, envelopeIdField, recipientIdField } from '../../utils/descriptions';

export const envelopeConsumerDisclosureFields: INodeProperties[] = [
	accountIdField(['envelopeConsumerDisclosure']),
	envelopeIdField(['envelopeConsumerDisclosure']),
	recipientIdField(['envelopeConsumerDisclosure']),

	// Language Code — for getDefault operation
	{
		displayName: 'Language Code',
		name: 'langCode',
		type: 'string',
		required: true,
		default: 'en',
		description: 'The language code for the consumer disclosure (e.g., "en", "fr", "de")',
		displayOptions: {
			show: { resource: ['envelopeConsumerDisclosure'], operation: ['getDefault'] },
		},
	},
];
