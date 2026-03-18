import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const favoriteTemplateFields: INodeProperties[] = [
	accountIdField(['favoriteTemplate']),

	// ------------------------------------------------------------------
	// Template IDs (update, unFavorite)
	// ------------------------------------------------------------------
	{
		displayName: 'Template IDs',
		name: 'templateIds',
		type: 'string',
		required: true,
		default: '',
		description: 'Comma-separated list of template IDs to add or remove from favorites',
		displayOptions: {
			show: {
				resource: ['favoriteTemplate'],
				operation: ['update', 'unFavorite'],
			},
		},
	},
];
