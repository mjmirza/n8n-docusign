import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const accountPasswordRuleFields: INodeProperties[] = [
	accountIdField(['accountPasswordRule']),

	// ------------------------------------------------------------------
	// getForUser: User ID
	// ------------------------------------------------------------------
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		description: 'Kept for older workflows. DocuSign returns the rules for the user the credential signs in as.',
		displayOptions: {
			show: { resource: ['accountPasswordRule'], operation: ['getForUser'] },
		},
	},

	// ------------------------------------------------------------------
	// Update: Password Rules (JSON)
	// ------------------------------------------------------------------
	{
		displayName: 'Password Rules (JSON)',
		name: 'passwordRules',
		type: 'json',
		default: '{}',
		required: true,
		description: 'The password rules configuration as JSON. Supports fields like minimumPasswordLength, minimumPasswordAgeDays, passwordExpireDays, passwordStrengthType, etc.',
		displayOptions: {
			show: { resource: ['accountPasswordRule'], operation: ['update'] },
		},
	},
];
