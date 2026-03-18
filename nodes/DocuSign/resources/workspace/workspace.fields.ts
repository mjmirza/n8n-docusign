import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const workspaceFields: INodeProperties[] = [
	accountIdField(['workspace']),

	// ------------------------------------------------------------------
	// Workspace ID (get, update, delete)
	// ------------------------------------------------------------------
	{
		displayName: 'Workspace ID',
		name: 'workspaceId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the workspace',
		displayOptions: {
			show: {
				resource: ['workspace'],
				operation: ['get', 'update', 'delete'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Workspace Name (create)
	// ------------------------------------------------------------------
	{
		displayName: 'Workspace Name',
		name: 'workspaceName',
		type: 'string',
		required: true,
		default: '',
		description: 'The name of the workspace',
		displayOptions: {
			show: {
				resource: ['workspace'],
				operation: ['create'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Workspace Description (create - optional)
	// ------------------------------------------------------------------
	{
		displayName: 'Workspace Description',
		name: 'workspaceDescription',
		type: 'string',
		default: '',
		description: 'A description of the workspace',
		displayOptions: {
			show: {
				resource: ['workspace'],
				operation: ['create'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Request Body (JSON) for update
	// ------------------------------------------------------------------
	{
		displayName: 'Request Body (JSON)',
		name: 'requestBody',
		type: 'json',
		default: '{}',
		required: true,
		description: 'JSON body for updating the workspace. Fields: workspaceName, workspaceDescription, workspaceBaseUrl.',
		displayOptions: {
			show: {
				resource: ['workspace'],
				operation: ['update'],
			},
		},
	},
];
