import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, envelopeIdField } from '../../utils/descriptions';

export const envelopeViewFields: INodeProperties[] = [
	accountIdField(['envelopeView']),
	envelopeIdField(['envelopeView']),

	// ------------------------------------------------------------------
	// Return URL — used by most view operations
	// ------------------------------------------------------------------
	{
		displayName: 'Return URL',
		name: 'returnUrl',
		type: 'string',
		required: true,
		default: 'https://example.com/docusign-complete',
		description: 'URL to redirect to after the view session ends. Must be HTTPS.',
		displayOptions: {
			show: {
				resource: ['envelopeView'],
				operation: ['createRecipient', 'createSender', 'createEdit', 'createCorrect', 'createConsole', 'createSharedRecipient'],
			},
		},
	},

	// ------------------------------------------------------------------
	// Recipient View fields
	// ------------------------------------------------------------------
	{
		displayName: 'Signer Email',
		name: 'signerEmail',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['envelopeView'], operation: ['createRecipient', 'createSharedRecipient'] },
		},
	},
	{
		displayName: 'Signer Name',
		name: 'signerName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['envelopeView'], operation: ['createRecipient', 'createSharedRecipient'] },
		},
	},
	{
		displayName: 'Client User ID',
		name: 'clientUserId',
		type: 'string',
		required: true,
		default: '',
		description: 'Must match the Client User ID set when the recipient was added',
		displayOptions: {
			show: { resource: ['envelopeView'], operation: ['createRecipient'] },
		},
	},

	// ------------------------------------------------------------------
	// Recipient View: Authentication Method
	// ------------------------------------------------------------------
	{
		displayName: 'Authentication Method',
		name: 'authenticationMethod',
		type: 'options',
		options: [
			{ name: 'Email', value: 'email' },
			{ name: 'ID Check', value: 'IDCheck' },
			{ name: 'Knowledge Based', value: 'knowledgeBased' },
			{ name: 'None', value: 'none' },
			{ name: 'Password', value: 'password' },
			{ name: 'Phone', value: 'phone' },
		],
		default: 'none',
		displayOptions: {
			show: { resource: ['envelopeView'], operation: ['createRecipient'] },
		},
	},

	// ------------------------------------------------------------------
	// Recipient View: Embedded Signing Options
	// ------------------------------------------------------------------
	{
		displayName: 'Recipient View Options',
		name: 'recipientViewOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: { resource: ['envelopeView'], operation: ['createRecipient'] },
		},
		options: [
			{ displayName: 'Assertion ID', name: 'assertionId', type: 'string', default: '', description: 'SAML assertion ID for SSO' },
			{ displayName: 'Authentication Instant', name: 'authenticationInstant', type: 'string', default: '', description: 'ISO 8601 timestamp of authentication' },
			{ displayName: 'Frame Ancestors', name: 'frameAncestors', type: 'string', default: '', description: 'CSP frame-ancestors value for iframe embedding (e.g., "https://myapp.com")' },
			{ displayName: 'Message Origins', name: 'messageOrigins', type: 'string', default: '', description: 'Comma-separated allowed origins for postMessage communication' },
			{ displayName: 'Ping Frequency (Seconds)', name: 'pingFrequency', type: 'number', default: 300, description: 'How often to ping (in seconds)' },
			{ displayName: 'Ping URL', name: 'pingUrl', type: 'string', default: '', description: 'Keep-alive ping URL — DocuSign sends periodic requests to detect if the session is still active' },
			{ displayName: 'Recipient ID', name: 'recipientId', type: 'string', default: '', description: 'Explicit recipient ID (alternative to email/name matching)' },
			{ displayName: 'Security Domain', name: 'securityDomain', type: 'string', default: '', description: 'Security domain for the assertion' },
			{ displayName: 'User ID', name: 'userId', type: 'string', default: '', description: 'DocuSign user ID (alternative to email/name)' },
			{
				displayName: 'X-Frame-Options',
				name: 'xFrameOptions',
				type: 'options',
				options: [
					{ name: 'None', value: '' },
					{ name: 'Deny', value: 'deny' },
					{ name: 'Same Origin', value: 'same_origin' },
					{ name: 'Allow From', value: 'allow_from' },
				],
				default: '',
				description: 'X-Frame-Options header for iframe security',
			},
			{ displayName: 'X-Frame-Options Allow From URL', name: 'xFrameOptionsAllowFromUrl', type: 'string', default: '', description: 'URL for X-Frame-Options ALLOW-FROM' },
		],
	},

	// ------------------------------------------------------------------
	// Sender/Edit View: Additional Options
	// ------------------------------------------------------------------
	{
		displayName: 'Options',
		name: 'viewOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: { resource: ['envelopeView'], operation: ['createSender', 'createEdit', 'createCorrect', 'createConsole'] },
		},
		options: [
			{ displayName: 'Starting Envelope ID', name: 'envelopeId', type: 'string', default: '', description: 'For console view: the envelope to start with' },
		],
	},
];
