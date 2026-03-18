import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, userIdField } from '../../utils/descriptions';

export const userSignatureFields: INodeProperties[] = [
	accountIdField(['userSignature']),
	userIdField(['userSignature']),

	// ------------------------------------------------------------------
	// Signature ID
	// ------------------------------------------------------------------
	{
		displayName: 'Signature ID',
		name: 'signatureId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the user signature',
		displayOptions: {
			show: {
				resource: ['userSignature'],
				operation: ['get', 'update', 'delete', 'getImage', 'updateImage', 'deleteImage'],
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
				resource: ['userSignature'],
				operation: ['getImage', 'updateImage', 'deleteImage'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Create: Signature body (JSON)
	// ------------------------------------------------------------------
	{
		displayName: 'Signature Data (JSON)',
		name: 'signatureBody',
		type: 'json',
		default: '{}',
		required: true,
		description: 'The signature data as JSON',
		displayOptions: {
			show: { resource: ['userSignature'], operation: ['create'] },
		},
	},

	// ------------------------------------------------------------------
	// Update: Signature body (JSON)
	// ------------------------------------------------------------------
	{
		displayName: 'Signature Data (JSON)',
		name: 'updateBody',
		type: 'json',
		default: '{}',
		required: true,
		description: 'The signature properties to update as JSON',
		displayOptions: {
			show: { resource: ['userSignature'], operation: ['update'] },
		},
	},

	// ------------------------------------------------------------------
	// Update List: Signatures body (JSON)
	// ------------------------------------------------------------------
	{
		displayName: 'Signatures (JSON)',
		name: 'signaturesBody',
		type: 'json',
		default: '[]',
		required: true,
		description: 'Array of signature objects to update as JSON',
		displayOptions: {
			show: { resource: ['userSignature'], operation: ['updateList'] },
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
			show: { resource: ['userSignature'], operation: ['getImage'] },
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
			show: { resource: ['userSignature'], operation: ['updateImage'] },
		},
	},
	{
		displayName: 'Input Binary Property',
		name: 'inputBinaryPropertyName',
		type: 'string',
		default: 'data',
		description: 'The name of the binary property containing the image to upload',
		displayOptions: {
			show: { resource: ['userSignature'], operation: ['updateImage'], uploadSource: ['binary'] },
		},
	},
	{
		displayName: 'Base64 Content',
		name: 'base64Content',
		type: 'string',
		default: '',
		description: 'The image content as a base64-encoded string',
		displayOptions: {
			show: { resource: ['userSignature'], operation: ['updateImage'], uploadSource: ['base64'] },
		},
	},
];
