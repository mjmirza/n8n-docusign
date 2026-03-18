import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const accountSignatureFields: INodeProperties[] = [
	accountIdField(['accountSignature']),

	// ------------------------------------------------------------------
	// Signature ID
	// ------------------------------------------------------------------
	{
		displayName: 'Signature ID',
		name: 'signatureId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the account signature',
		displayOptions: {
			show: {
				resource: ['accountSignature'],
				operation: ['get', 'updateById', 'delete', 'getImage', 'updateImage', 'deleteImage'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Image Type (getImage, updateImage, deleteImage)
	// ------------------------------------------------------------------
	{
		displayName: 'Image Type',
		name: 'imageType',
		type: 'options',
		required: true,
		options: [
			{ name: 'Signature Image', value: 'signature_image' },
			{ name: 'Initials Image', value: 'initials_image' },
		],
		default: 'signature_image',
		description: 'The type of signature image',
		displayOptions: {
			show: {
				resource: ['accountSignature'],
				operation: ['getImage', 'updateImage', 'deleteImage'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Request Body (JSON) for create, update, updateById
	// ------------------------------------------------------------------
	{
		displayName: 'Request Body (JSON)',
		name: 'requestBody',
		type: 'json',
		default: '{}',
		required: true,
		description: 'The signature data as JSON',
		displayOptions: {
			show: { resource: ['accountSignature'], operation: ['create', 'update', 'updateById'] },
		},
	},

	// ------------------------------------------------------------------
	// Binary Property Name (download operations)
	// ------------------------------------------------------------------
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		description: 'The name of the binary property to store the downloaded image',
		displayOptions: {
			show: { resource: ['accountSignature'], operation: ['getImage'] },
		},
	},

	// ------------------------------------------------------------------
	// Upload: Source selection (updateImage)
	// ------------------------------------------------------------------
	{
		displayName: 'Upload Source',
		name: 'uploadSource',
		type: 'options',
		options: [
			{ name: 'Binary Property', value: 'binary' },
			{ name: 'Base64 Content', value: 'base64' },
		],
		default: 'binary',
		description: 'Where to get the image data from',
		displayOptions: {
			show: { resource: ['accountSignature'], operation: ['updateImage'] },
		},
	},
	{
		displayName: 'Input Binary Property',
		name: 'inputBinaryPropertyName',
		type: 'string',
		default: 'data',
		description: 'The name of the binary property containing the image to upload',
		displayOptions: {
			show: { resource: ['accountSignature'], operation: ['updateImage'], uploadSource: ['binary'] },
		},
	},
	{
		displayName: 'Base64 Content',
		name: 'base64Content',
		type: 'string',
		default: '',
		description: 'The image content as a base64-encoded string',
		displayOptions: {
			show: { resource: ['accountSignature'], operation: ['updateImage'], uploadSource: ['base64'] },
		},
	},
];
