import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, userIdField } from '../../utils/descriptions';

export const userCustomSettingFields: INodeProperties[] = [
	accountIdField(['userCustomSetting']),
	userIdField(['userCustomSetting']),

	// ------------------------------------------------------------------
	// Update / Delete: Custom Settings (JSON)
	// ------------------------------------------------------------------
	{
		displayName: 'Custom Settings (JSON)',
		name: 'customSettings',
		type: 'json',
		default: '{}',
		required: true,
		description: 'The custom settings as JSON object',
		displayOptions: {
			show: { resource: ['userCustomSetting'], operation: ['update', 'delete'] },
		},
	},
];
