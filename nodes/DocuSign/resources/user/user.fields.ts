import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, userIdField } from '../../utils/descriptions';

export const userFields: INodeProperties[] = [
	accountIdField(['user']),
	userIdField(['user'], ['get', 'update', 'delete', 'getSettings', 'updateSettings', 'getProfileImage', 'updateProfileImage', 'deleteProfileImage']),

	// ------------------------------------------------------------------
	// List: Query parameters
	// ------------------------------------------------------------------
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['user'], operation: ['list'] },
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Closed', value: 'closed' },
					{ name: 'Created', value: 'created' },
				],
				default: 'active',
				description: 'Filter users by status',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'Filter users by email substring',
			},
			{
				displayName: 'Start Position',
				name: 'start_position',
				type: 'number',
				default: 0,
				description: 'The zero-based starting position of the result set',
			},
			{
				displayName: 'Count',
				name: 'count',
				type: 'number',
				default: 100,
				description: 'The number of results to return (max 100)',
			},
		],
	},

	// ------------------------------------------------------------------
	// Create: User fields
	// ------------------------------------------------------------------
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		default: '',
		description: 'The email address of the new user',
		displayOptions: {
			show: { resource: ['user'], operation: ['create'] },
		},
	},
	{
		displayName: 'User Name',
		name: 'userName',
		type: 'string',
		required: true,
		default: '',
		description: 'The full name of the new user',
		displayOptions: {
			show: { resource: ['user'], operation: ['create'] },
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'createFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['user'], operation: ['create'] },
		},
		options: [
			{
				displayName: 'Activation Access Code',
				name: 'activationAccessCode',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'The activation access code for the new user',
			},
			{
				displayName: 'Company',
				name: 'company',
				type: 'string',
				default: '',
				description: 'The company name of the user',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
				description: 'The first name of the user',
			},
			{
				displayName: 'Group ID',
				name: 'groupId',
				type: 'string',
				default: '',
				description: 'The group ID to add the user to',
			},
			{
				displayName: 'Job Title',
				name: 'jobTitle',
				type: 'string',
				default: '',
				description: 'The job title of the user',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
				description: 'The last name of the user',
			},
			{
				displayName: 'Middle Name',
				name: 'middleName',
				type: 'string',
				default: '',
				description: 'The middle name of the user',
			},
			{
				displayName: 'Password',
				name: 'password',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'The password for the new user',
			},
			{
				displayName: 'Send Activation Email',
				name: 'sendActivationEmail',
				type: 'boolean',
				default: true,
				description: 'Whether to send an activation email to the new user',
			},
			{
				displayName: 'Suffix Name',
				name: 'suffixName',
				type: 'string',
				default: '',
				description: 'The suffix for the user name (e.g., Jr., III)',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'The title of the user (e.g., Mr., Ms.)',
			},
			{
				displayName: 'User Settings (JSON)',
				name: 'userSettings',
				type: 'json',
				default: '{}',
				description: 'User settings as JSON object',
			},
		],
	},

	// ------------------------------------------------------------------
	// Update: JSON body
	// ------------------------------------------------------------------
	{
		displayName: 'Update Fields (JSON)',
		name: 'updateBody',
		type: 'json',
		default: '{}',
		required: true,
		description: 'The user properties to update as JSON',
		displayOptions: {
			show: { resource: ['user'], operation: ['update'] },
		},
	},

	// ------------------------------------------------------------------
	// Update List: JSON body
	// ------------------------------------------------------------------
	{
		displayName: 'Users (JSON)',
		name: 'usersBody',
		type: 'json',
		default: '[]',
		required: true,
		description: 'Array of user objects to update as JSON',
		displayOptions: {
			show: { resource: ['user'], operation: ['updateList'] },
		},
	},

	// ------------------------------------------------------------------
	// Update Settings: JSON body
	// ------------------------------------------------------------------
	{
		displayName: 'Settings (JSON)',
		name: 'settingsBody',
		type: 'json',
		default: '{}',
		required: true,
		description: 'The user settings to update as JSON',
		displayOptions: {
			show: { resource: ['user'], operation: ['updateSettings'] },
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
			show: { resource: ['user'], operation: ['getProfileImage'] },
		},
	},

	// ------------------------------------------------------------------
	// Upload: Source selection (updateProfileImage)
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
			show: { resource: ['user'], operation: ['updateProfileImage'] },
		},
	},
	{
		displayName: 'Input Binary Property',
		name: 'inputBinaryPropertyName',
		type: 'string',
		default: 'data',
		description: 'The name of the binary property containing the image to upload',
		displayOptions: {
			show: { resource: ['user'], operation: ['updateProfileImage'], uploadSource: ['binary'] },
		},
	},
	{
		displayName: 'Base64 Content',
		name: 'base64Content',
		type: 'string',
		default: '',
		description: 'The image content as a base64-encoded string',
		displayOptions: {
			show: { resource: ['user'], operation: ['updateProfileImage'], uploadSource: ['base64'] },
		},
	},
];
