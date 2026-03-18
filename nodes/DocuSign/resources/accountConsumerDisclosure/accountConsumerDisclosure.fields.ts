import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const accountConsumerDisclosureFields: INodeProperties[] = [
	accountIdField(['accountConsumerDisclosure']),

	// ------------------------------------------------------------------
	// Language Code (get, update)
	// ------------------------------------------------------------------
	{
		displayName: 'Language Code',
		name: 'langCode',
		type: 'string',
		required: true,
		default: 'en',
		description: 'The language code for the consumer disclosure (e.g., "en", "fr", "de", "es")',
		displayOptions: {
			show: {
				resource: ['accountConsumerDisclosure'],
				operation: ['get', 'update'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Update: Disclosure Data (JSON)
	// ------------------------------------------------------------------
	{
		displayName: 'Disclosure Data (JSON)',
		name: 'disclosureData',
		type: 'json',
		default: '{}',
		required: true,
		description: 'The consumer disclosure data as JSON',
		displayOptions: {
			show: { resource: ['accountConsumerDisclosure'], operation: ['update'] },
		},
	},
];
