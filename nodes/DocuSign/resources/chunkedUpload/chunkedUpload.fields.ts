import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const chunkedUploadFields: INodeProperties[] = [
	accountIdField(['chunkedUpload']),

	// ------------------------------------------------------------------
	// Chunked Upload ID (get, update, commit, delete)
	// ------------------------------------------------------------------
	{
		displayName: 'Chunked Upload ID',
		name: 'chunkedUploadId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the chunked upload',
		displayOptions: {
			show: {
				resource: ['chunkedUpload'],
				operation: ['get', 'update', 'commit', 'delete'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Request Body (JSON) for create
	// ------------------------------------------------------------------
	{
		displayName: 'Request Body (JSON)',
		name: 'requestBody',
		type: 'json',
		default: '{\n  "chunkedUploadId": ""\n}',
		required: true,
		description: 'JSON body to initiate the chunked upload',
		displayOptions: {
			show: {
				resource: ['chunkedUpload'],
				operation: ['create'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Chunk Index (update)
	// ------------------------------------------------------------------
	{
		displayName: 'Chunk Index',
		name: 'chunkIndex',
		type: 'number',
		required: true,
		default: 1,
		description: 'Zero-based index of the part being added. Create already uploads part 0, so the first Update is part 1.',
		displayOptions: {
			show: {
				resource: ['chunkedUpload'],
				operation: ['update'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Binary input type (update)
	// ------------------------------------------------------------------
	{
		displayName: 'Input Data Source',
		name: 'inputDataSource',
		type: 'options',
		options: [
			{ name: 'Binary Property', value: 'binaryProperty' },
			{ name: 'Base64 String', value: 'base64' },
		],
		default: 'binaryProperty',
		description: 'Where to get the chunk data from',
		displayOptions: {
			show: {
				resource: ['chunkedUpload'],
				operation: ['update'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Binary Property Name (update - binaryProperty)
	// ------------------------------------------------------------------
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		description: 'The name of the binary property containing the chunk data',
		displayOptions: {
			show: {
				resource: ['chunkedUpload'],
				operation: ['update'],
				inputDataSource: ['binaryProperty'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Base64 Data (update - base64)
	// ------------------------------------------------------------------
	{
		displayName: 'Base64 Data',
		name: 'base64Data',
		type: 'string',
		default: '',
		description: 'Base64-encoded chunk data',
		displayOptions: {
			show: {
				resource: ['chunkedUpload'],
				operation: ['update'],
				inputDataSource: ['base64'],
			},
		},
	},
];
