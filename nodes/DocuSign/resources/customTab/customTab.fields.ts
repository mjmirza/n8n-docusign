import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const customTabFields: INodeProperties[] = [
	accountIdField(['customTab']),

	// ------------------------------------------------------------------
	// Custom Tab ID
	// ------------------------------------------------------------------
	{
		displayName: 'Custom Tab ID',
		name: 'customTabId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the custom tab definition',
		displayOptions: {
			show: {
				resource: ['customTab'],
				operation: ['get', 'update', 'delete'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Request Body (JSON) for create and update
	// ------------------------------------------------------------------
	{
		displayName: 'Tab Definition (JSON)',
		name: 'requestBody',
		type: 'json',
		default: '{}',
		required: true,
		description: 'The custom tab definition as JSON. Fields include: tabLabel, type (text/number/date/checkbox/list/radio/ssn/zip/email), font, fontColor, fontSize, bold, italic, underline, height, width, maxLength, validationPattern, validationMessage, required, locked, concealValueOnDocument, disableAutoSize, items (for list type), anchor, anchorXOffset, anchorYOffset, anchorUnits.',
		displayOptions: {
			show: { resource: ['customTab'], operation: ['create', 'update'] },
		},
	},
];
