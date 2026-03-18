import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const accountBrandFields: INodeProperties[] = [
	accountIdField(['accountBrand']),

	// ------------------------------------------------------------------
	// Brand ID
	// ------------------------------------------------------------------
	{
		displayName: 'Brand ID',
		name: 'brandId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the brand',
		displayOptions: {
			show: {
				resource: ['accountBrand'],
				operation: ['get', 'delete', 'update', 'getLogo', 'deleteLogo', 'updateLogo', 'getResource', 'updateResource', 'listResources', 'getExportFile'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Create: Brand Name & Language
	// ------------------------------------------------------------------
	{
		displayName: 'Brand Name',
		name: 'brandName',
		type: 'string',
		required: true,
		default: '',
		description: 'The name of the brand',
		displayOptions: {
			show: { resource: ['accountBrand'], operation: ['create'] },
		},
	},
	{
		displayName: 'Default Brand Language',
		name: 'defaultBrandLanguage',
		type: 'string',
		default: 'en',
		description: 'The default language for the brand (e.g., "en", "fr", "de")',
		displayOptions: {
			show: { resource: ['accountBrand'], operation: ['create'] },
		},
	},

	// ------------------------------------------------------------------
	// Create / Update: Additional Fields
	// ------------------------------------------------------------------
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['accountBrand'], operation: ['create', 'update'] },
		},
		options: [
			{
				displayName: 'Brand Company',
				name: 'brandCompany',
				type: 'string',
				default: '',
				description: 'The company name for the brand',
			},
			{
				displayName: 'Brand Colors (JSON)',
				name: 'colors',
				type: 'json',
				default: '{}',
				description: 'Brand color configuration as JSON',
			},
			{
				displayName: 'Brand Logos (JSON)',
				name: 'logos',
				type: 'json',
				default: '{}',
				description: 'Brand logos configuration as JSON',
			},
		],
	},

	// ------------------------------------------------------------------
	// Logo Type (getLogo, deleteLogo, updateLogo)
	// ------------------------------------------------------------------
	{
		displayName: 'Logo Type',
		name: 'logoType',
		type: 'options',
		required: true,
		options: [
			{ name: 'Primary', value: 'primary' },
			{ name: 'Secondary', value: 'secondary' },
			{ name: 'Email', value: 'email' },
		],
		default: 'primary',
		description: 'The type of logo',
		displayOptions: {
			show: { resource: ['accountBrand'], operation: ['getLogo', 'deleteLogo', 'updateLogo'] },
		},
	},

	// ------------------------------------------------------------------
	// Resource Content Type (getResource, updateResource)
	// ------------------------------------------------------------------
	{
		displayName: 'Resource Content Type',
		name: 'resourceContentType',
		type: 'options',
		required: true,
		options: [
			{ name: 'Sending', value: 'sending' },
			{ name: 'Signing', value: 'signing' },
			{ name: 'Email', value: 'email' },
			{ name: 'Signing Captive', value: 'signing_captive' },
		],
		default: 'sending',
		description: 'The type of brand resource',
		displayOptions: {
			show: { resource: ['accountBrand'], operation: ['getResource', 'updateResource'] },
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
		description: 'The name of the binary property to store the downloaded file',
		displayOptions: {
			show: { resource: ['accountBrand'], operation: ['getLogo', 'getExportFile', 'getResource'] },
		},
	},

	// ------------------------------------------------------------------
	// Upload: Source selection (updateLogo, updateResource)
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
		description: 'Where to get the file data from',
		displayOptions: {
			show: { resource: ['accountBrand'], operation: ['updateLogo', 'updateResource'] },
		},
	},
	{
		displayName: 'Input Binary Property',
		name: 'inputBinaryPropertyName',
		type: 'string',
		default: 'data',
		description: 'The name of the binary property containing the file to upload',
		displayOptions: {
			show: { resource: ['accountBrand'], operation: ['updateLogo', 'updateResource'], uploadSource: ['binary'] },
		},
	},
	{
		displayName: 'Base64 Content',
		name: 'base64Content',
		type: 'string',
		default: '',
		description: 'The file content as a base64-encoded string',
		displayOptions: {
			show: { resource: ['accountBrand'], operation: ['updateLogo', 'updateResource'], uploadSource: ['base64'] },
		},
	},

	// ------------------------------------------------------------------
	// Delete List: Brand IDs
	// ------------------------------------------------------------------
	{
		displayName: 'Brand IDs',
		name: 'brandIds',
		type: 'string',
		required: true,
		default: '',
		description: 'Comma-separated list of brand IDs to delete',
		displayOptions: {
			show: { resource: ['accountBrand'], operation: ['deleteList'] },
		},
	},
];
