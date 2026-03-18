import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const envelopeTransferRuleFields: INodeProperties[] = [
	accountIdField(['envelopeTransferRule']),

	// Rule ID — for single rule operations
	{
		displayName: 'Rule ID',
		name: 'ruleId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the envelope transfer rule',
		displayOptions: {
			show: { resource: ['envelopeTransferRule'], operation: ['delete', 'update'] },
		},
	},

	// Request Body — for create/update operations
	{
		displayName: 'Request Body (JSON)',
		name: 'requestBody',
		type: 'json',
		required: true,
		default: '{}',
		description: 'The JSON request body for the operation',
		displayOptions: {
			show: { resource: ['envelopeTransferRule'], operation: ['create', 'update', 'updateRule'] },
		},
	},
];
