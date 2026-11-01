import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, binaryPropertyField } from '../../utils/descriptions';

export const workspaceItemFields: INodeProperties[] = [
	accountIdField(['workspaceItem']),

	// ------------------------------------------------------------------
	// Workspace ID (all operations)
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
				resource: ['workspaceItem'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Folder ID (all operations)
	// ------------------------------------------------------------------
	{
		displayName: 'Folder ID',
		name: 'folderId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the folder within the workspace',
		displayOptions: {
			show: {
				resource: ['workspaceItem'],
			},
		},
	},

	// ------------------------------------------------------------------
	// File ID (getFile, updateFile, listFilePages)
	// ------------------------------------------------------------------
	{
		displayName: 'File ID',
		name: 'fileId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the file',
		displayOptions: {
			show: {
				resource: ['workspaceItem'],
				operation: ['getFile', 'updateFile', 'listFilePages'],
			},
		},
	},

	// Binary property for download (getFile)
	binaryPropertyField(['workspaceItem'], ['getFile']),

	// ------------------------------------------------------------------
	// Upload Source (createFile, updateFile)
	// ------------------------------------------------------------------
	{
		displayName: 'Upload Source',
		name: 'uploadSource',
		type: 'options',
		options: [
			{ name: 'Binary Data', value: 'binary' },
			{ name: 'Base64 String', value: 'base64' },
		],
		default: 'binary',
		description: 'Source of the file to upload',
		displayOptions: {
			show: {
				resource: ['workspaceItem'],
				operation: ['createFile'],
			},
		},
	},
	{
		displayName: 'Input Binary Property',
		name: 'inputBinaryPropertyName',
		type: 'string',
		default: 'data',
		description: 'Name of the binary property containing the file to upload',
		displayOptions: {
			show: {
				resource: ['workspaceItem'],
				operation: ['createFile'],
				uploadSource: ['binary'],
			},
		},
	},
	{
		displayName: 'Base64 Content',
		name: 'base64Content',
		type: 'string',
		default: '',
		description: 'Base64-encoded file content',
		displayOptions: {
			show: {
				resource: ['workspaceItem'],
				operation: ['createFile'],
				uploadSource: ['base64'],
			},
		},
	},
	{
		displayName: 'Upload Source',
		name: 'uploadSource',
		type: 'options',
		options: [
			{ name: 'Binary Data', value: 'binary' },
			{ name: 'Base64 String', value: 'base64' },
		],
		default: 'binary',
		description: 'Source of the file to upload',
		displayOptions: {
			show: {
				resource: ['workspaceItem'],
				operation: ['updateFile'],
				'@version': [{ _cnd: { lt: 4 } }],
			},
		},
	},
	{
		displayName: 'Input Binary Property',
		name: 'inputBinaryPropertyName',
		type: 'string',
		default: 'data',
		description: 'Name of the binary property containing the file to upload',
		displayOptions: {
			show: {
				resource: ['workspaceItem'],
				operation: ['updateFile'],
				uploadSource: ['binary'],
				'@version': [{ _cnd: { lt: 4 } }],
			},
		},
	},
	{
		displayName: 'Base64 Content',
		name: 'base64Content',
		type: 'string',
		default: '',
		description: 'Base64-encoded file content',
		displayOptions: {
			show: {
				resource: ['workspaceItem'],
				operation: ['updateFile'],
				uploadSource: ['base64'],
				'@version': [{ _cnd: { lt: 4 } }],
			},
		},
	},

	// ------------------------------------------------------------------
	// Items JSON (deleteFolderItems)
	// ------------------------------------------------------------------
	{
		displayName: 'Items (JSON)',
		name: 'itemsJson',
		type: 'json',
		default: '[]',
		required: true,
		description: 'JSON array of workspace items to delete, each with the DocuSign keys for the item ID and its type (file or folder). Older itemId and itemType keys are converted.',
		displayOptions: {
			show: {
				resource: ['workspaceItem'],
				operation: ['deleteFolderItems'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Filters for listFolderItems
	// ------------------------------------------------------------------
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['workspaceItem'],
				operation: ['listFolderItems'],
			},
		},
		options: [
			{
				displayName: 'Count',
				name: 'count',
				type: 'number',
				default: 100,
				description: 'Number of items to return',
			},
			{
				displayName: 'Include Files',
				name: 'includeFiles',
				type: 'boolean',
				default: false,
				description: 'Whether to return the files in the folder',
			},
			{
				displayName: 'Include Sub Folders',
				name: 'includeSubFolders',
				type: 'boolean',
				default: false,
				description: 'Whether to return the sub folders in the folder',
			},
			{
				displayName: 'Start Position',
				name: 'start_position',
				type: 'number',
				default: 0,
				description: 'Starting index position',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'string',
				default: '',
				description: 'Older shortcut: "file" turns on Include Files, "folder" turns on Include Sub Folders',
			},
		],
	},

	// ------------------------------------------------------------------
	// Filters for listFilePages
	// ------------------------------------------------------------------
	{
		displayName: 'Page Filters',
		name: 'pageFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['workspaceItem'],
				operation: ['listFilePages'],
			},
		},
		options: [
			{
				displayName: 'Count',
				name: 'count',
				type: 'number',
				default: 100,
				description: 'Number of pages to return',
			},
			{
				displayName: 'Start Position',
				name: 'start_position',
				type: 'number',
				default: 0,
				description: 'Starting index position',
			},
		],
	},
];
