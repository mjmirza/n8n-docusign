import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, userIdField } from '../../utils/descriptions';

export const cloudStorageFields: INodeProperties[] = [
	accountIdField(['cloudStorage']),
	userIdField(['cloudStorage']),

	// ------------------------------------------------------------------
	// Service ID (listFolders, listFiles, getFile)
	// ------------------------------------------------------------------
	{
		displayName: 'Service ID',
		name: 'serviceId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the cloud storage provider (e.g., "1" for Box, "2" for Dropbox, "3" for Google Drive, "4" for OneDrive)',
		displayOptions: {
			show: {
				resource: ['cloudStorage'],
				operation: ['listFolders', 'listFiles', 'getFile'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Folder ID (listFiles, getFile)
	// ------------------------------------------------------------------
	{
		displayName: 'Folder ID',
		name: 'folderId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the folder in the cloud storage provider',
		displayOptions: {
			show: {
				resource: ['cloudStorage'],
				operation: ['listFiles', 'getFile'],
			},
		},
	},

	// ------------------------------------------------------------------
	// File ID (getFile)
	// ------------------------------------------------------------------
	{
		displayName: 'File ID',
		name: 'fileId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the file to download',
		displayOptions: {
			show: {
				resource: ['cloudStorage'],
				operation: ['getFile'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Binary Property Name (getFile)
	// ------------------------------------------------------------------
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		description: 'The name of the binary property to store the downloaded file',
		displayOptions: {
			show: {
				resource: ['cloudStorage'],
				operation: ['getFile'],
			},
		},
	},
];
