import type { INodeProperties } from 'n8n-workflow';

export const templateOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['template'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a new template', action: 'Create a template' },
			{ name: 'Delete Document Page', value: 'deleteDocumentPage', description: 'Remove a page from a template document', action: 'Delete template document page' },
			{ name: 'Get', value: 'get', description: 'Get a template by ID', action: 'Get a template' },
			{ name: 'Get Many', value: 'getAll', description: 'Get many templates', action: 'Get many templates' },
			{ name: 'Get Notification Settings', value: 'getNotificationSettings', description: 'Get template notification settings', action: 'Get template notification settings' },
			{ name: 'Get Page Images', value: 'getPageImages', description: 'Get page images for a template document', action: 'Get template page images' },
			{ name: 'Rotate Document Page', value: 'rotateDocumentPage', description: 'Rotate a page in a template document', action: 'Rotate template document page' },
			{ name: 'Update', value: 'update', description: 'Update a template', action: 'Update a template' },
			{ name: 'Update Group Share', value: 'updateGroupShare', description: 'Share a template with groups', action: 'Update template group share' },
			{ name: 'Delete Group Share', value: 'deleteGroupShare', description: 'Remove template sharing from groups', action: 'Delete template group share' },
			{ name: 'Update Notification Settings', value: 'updateNotificationSettings', description: 'Update template notification settings', action: 'Update template notification settings' },
		],
		default: 'getAll',
	},
];
