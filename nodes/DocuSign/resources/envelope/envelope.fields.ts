import type { INodeProperties } from 'n8n-workflow';

export const envelopeFields: INodeProperties[] = [
	// ==================================================================
	// Envelope ID — required for get, update, send, void, delete,
	// downloadDocuments, getSigningUrl, listAuditEvents, etc.
	// ==================================================================
	{
		displayName: 'Envelope ID',
		name: 'envelopeId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID (GUID) of the envelope',
		displayOptions: {
			show: {
				resource: ['envelope'],
				operation: [
					'get', 'update', 'send', 'void', 'delete',
					'downloadDocuments', 'getSigningUrl',
					'listAuditEvents', 'getNotificationSettings', 'updateNotificationSettings',
				],
			},
		},
	},

	// ==================================================================
	// Account ID — required for all operations
	// ==================================================================
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		required: true,
		default: '',
		description: 'The DocuSign Account ID (GUID). Find it in DocuSign Admin → API and Keys.',
		displayOptions: { show: { resource: ['envelope'] } },
	},

	// ==================================================================
	// Create: Email Subject
	// ==================================================================
	{
		displayName: 'Email Subject',
		name: 'emailSubject',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Please sign this document',
		description: 'The subject line of the email sent to recipients',
		displayOptions: { show: { resource: ['envelope'], operation: ['create'] } },
	},

	// ==================================================================
	// Create: Status
	// ==================================================================
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{ name: 'Draft (Created)', value: 'created' },
			{ name: 'Sent', value: 'sent' },
		],
		default: 'sent',
		description: 'Whether to save as draft or send immediately',
		displayOptions: { show: { resource: ['envelope'], operation: ['create'] } },
	},

	// ==================================================================
	// Create: Signers — all DocuSign signer fields
	// ==================================================================
	{
		displayName: 'Signers',
		name: 'signers',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		required: true,
		default: {},
		placeholder: 'Add Signer',
		description: 'The signers for the envelope',
		displayOptions: { show: { resource: ['envelope'], operation: ['create'] } },
		options: [
			{
				displayName: 'Signer',
				name: 'signer',
				values: [
					{ displayName: 'Access Code', name: 'accessCode', type: 'string', typeOptions: { password: true }, default: '', description: 'Access code for recipient authentication' },
					{ displayName: 'Client User ID', name: 'clientUserId', type: 'string', default: '', description: 'Set to enable embedded signing. Any unique value works.' },
					{
						displayName: 'Delivery Method',
						name: 'deliveryMethod',
						type: 'options',
						options: [
							{ name: 'Email', value: 'email' },
							{ name: 'SMS', value: 'sms' },
						],
						default: 'email',
						description: 'How to deliver signing notification',
					},
					{ displayName: 'Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '', required: true, description: 'The signer email address' },
					{ displayName: 'Email Notification Body', name: 'emailNotificationBody', type: 'string', default: '', description: 'Override email body for this specific recipient' },
					{ displayName: 'Email Notification Language', name: 'supportedLanguage', type: 'string', default: '', description: 'Language code for email (e.g., en, fr, de, es, ja, zh_CN)' },
					{ displayName: 'Email Notification Subject', name: 'emailNotificationSubject', type: 'string', default: '', description: 'Override email subject for this specific recipient' },
					{ displayName: 'Embedded Recipient Start URL', name: 'embeddedRecipientStartURL', type: 'string', default: '', description: 'URL for starting embedded recipient experience' },
					{
						displayName: 'ID Check Config Name',
						name: 'idCheckConfigurationName',
						type: 'options',
						options: [
							{ name: 'None', value: '' },
							{ name: 'ID Check $', value: 'ID Check $' },
							{ name: 'ID Check $$', value: 'ID Check $$' },
							{ name: 'Phone Auth $', value: 'Phone Auth $' },
						],
						default: '',
						description: 'ID verification configuration',
					},
					{ displayName: 'Name', name: 'name', type: 'string', default: '', required: true, description: 'The signer full name' },
					{ displayName: 'Note', name: 'note', type: 'string', default: '', description: 'A private note for this recipient' },
					{ displayName: 'Phone Auth Numbers', name: 'phoneAuthNumbers', type: 'string', default: '', description: 'For Phone Auth $: comma-separated numbers the recipient may use. Empty lets the recipient supply one.' },
					{ displayName: 'Phone Number (for SMS)', name: 'phoneNumber', type: 'string', default: '', description: 'Required when delivery method is SMS. Country code, a space, then the number, e.g. +1 4155550100.' },
					{ displayName: 'Recipient ID', name: 'recipientId', type: 'string', default: '1', description: 'Unique ID for this recipient within the envelope' },
					{ displayName: 'Require ID Lookup', name: 'requireIdLookup', type: 'options', options: [{ name: 'Automatic', value: '' }, { name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: '', description: 'Require knowledge-based authentication (KBA). Automatic turns it on when an ID Check Config Name is set (node version 4); No never sends it.' },
					{ displayName: 'Require Sign on Paper', name: 'requireSignOnPaper', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false', description: 'Require wet signature' },
					{ displayName: 'Role Name', name: 'roleName', type: 'string', default: '', description: 'Role name (for template-based flows)' },
					{ displayName: 'Routing Order', name: 'routingOrder', type: 'string', default: '1', description: 'The order in which this recipient signs (same number = parallel)' },
				],
			},
		],
	},

	// ==================================================================
	// Create: Documents — all DocuSign document fields
	// ==================================================================
	{
		displayName: 'Documents',
		name: 'documents',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		required: true,
		default: {},
		placeholder: 'Add Document',
		description: 'The documents to include in the envelope',
		displayOptions: { show: { resource: ['envelope'], operation: ['create'] } },
		options: [
			{
				displayName: 'Document',
				name: 'document',
				values: [
					{ displayName: 'Authoritative Copy', name: 'authoritativeCopy', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false', description: 'Mark as authoritative copy' },
					{ displayName: 'Base64 Content', name: 'documentBase64', type: 'string', default: '', description: 'The document content as a Base64-encoded string', displayOptions: { show: { source: ['base64'] } } },
					{ displayName: 'Binary Property', name: 'binaryProperty', type: 'string', default: 'data', description: 'The name of the binary property containing the document', displayOptions: { show: { source: ['binary'] } } },
					{
						displayName: 'Display',
						name: 'display',
						type: 'options',
						options: [
							{ name: 'Default', value: '' },
							{ name: 'Inline', value: 'inline' },
							{ name: 'Modal', value: 'modal' },
						],
						default: '',
						description: 'How to display the document in signing',
					},
					{ displayName: 'Document ID', name: 'documentId', type: 'string', default: '1', required: true, description: 'Unique numeric ID for this document within the envelope' },
					{ displayName: 'Document Name', name: 'name', type: 'string', default: '', required: true, description: 'Display name of the document' },
					{
						displayName: 'File Extension',
						name: 'fileExtension',
						type: 'options',
						options: [
							{ name: 'CSV', value: 'csv' },
							{ name: 'DOC', value: 'doc' },
							{ name: 'DOCX', value: 'docx' },
							{ name: 'HTML', value: 'html' },
							{ name: 'JPG', value: 'jpg' },
							{ name: 'PDF', value: 'pdf' },
							{ name: 'PNG', value: 'png' },
							{ name: 'TXT', value: 'txt' },
							{ name: 'XLSX', value: 'xlsx' },
						],
						default: 'pdf',
					},
					{ displayName: 'Include in Download', name: 'includeInDownload', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'true', description: 'Include in combined document download' },
					{ displayName: 'Order', name: 'order', type: 'number', default: 0, description: 'Document ordering (0 = auto)' },
					{ displayName: 'Remote URL', name: 'remoteUrl', type: 'string', default: '', description: 'URL to fetch the document from (must be publicly accessible)', displayOptions: { show: { source: ['remoteUrl'] } } },
					{
						displayName: 'Signer Must Acknowledge',
						name: 'signerMustAcknowledge',
						type: 'options',
						options: [
							{ name: 'None', value: '' },
							{ name: 'No Interaction', value: 'no_interaction' },
							{ name: 'View', value: 'view' },
							{ name: 'Accept', value: 'accept' },
						],
						default: '',
						description: 'Acknowledgement requirement for this document',
					},
					{
						displayName: 'Source',
						name: 'source',
						type: 'options',
						options: [
							{ name: 'Binary Data (From Previous Node)', value: 'binary' },
							{ name: 'Base64 String', value: 'base64' },
							{ name: 'Remote URL', value: 'remoteUrl' },
						],
						default: 'binary',
						description: 'How to provide the document content',
					},
					{ displayName: 'Transform PDF Fields', name: 'transformPdfFields', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false', description: 'Convert PDF form fields to DocuSign tabs automatically' },
				],
			},
		],
	},

	// ==================================================================
	// Create: Additional Fields — envelope-level options
	// ==================================================================
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['envelope'], operation: ['create'] } },
		options: [
			{
				displayName: 'Agents',
				name: 'agents',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				default: {},
				description: 'Agent recipients who can act on behalf of the sender',
				options: [
					{
						displayName: 'Agent',
						name: 'agent',
						values: [
							{ displayName: 'Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '', required: true },
							{ displayName: 'Name', name: 'name', type: 'string', default: '', required: true },
							{ displayName: 'Recipient ID', name: 'recipientId', type: 'string', default: '20' },
							{ displayName: 'Routing Order', name: 'routingOrder', type: 'string', default: '1' },
						],
					},
				],
			},
			{ displayName: 'Allow Markup', name: 'allowMarkup', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false', description: 'Allow recipients to mark up documents' },
			{ displayName: 'Allow Reassign', name: 'allowReassign', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'true', description: 'Allow recipients to reassign the envelope' },
			{ displayName: 'Authoritative Copy', name: 'authoritativeCopy', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
			{ displayName: 'Auto Navigation', name: 'autoNavigation', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
			{ displayName: 'Brand ID', name: 'brandId', type: 'string', default: '', description: 'The brand ID to apply to the envelope' },
			{
				displayName: 'Carbon Copies',
				name: 'carbonCopies',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				default: {},
				description: 'Recipients who receive a copy but do not sign',
				options: [
					{
						displayName: 'Recipient',
						name: 'recipient',
						values: [
							{ displayName: 'Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '', required: true },
							{ displayName: 'Name', name: 'name', type: 'string', default: '', required: true },
							{ displayName: 'Recipient ID', name: 'recipientId', type: 'string', default: '10' },
							{ displayName: 'Routing Order', name: 'routingOrder', type: 'string', default: '2' },
						],
					},
				],
			},
			{
				displayName: 'Certified Deliveries',
				name: 'certifiedDeliveries',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				default: {},
				description: 'Recipients who must confirm receipt',
				options: [
					{
						displayName: 'Recipient',
						name: 'recipient',
						values: [
							{ displayName: 'Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '', required: true },
							{ displayName: 'Name', name: 'name', type: 'string', default: '', required: true },
							{ displayName: 'Recipient ID', name: 'recipientId', type: 'string', default: '50' },
							{ displayName: 'Routing Order', name: 'routingOrder', type: 'string', default: '2' },
						],
					},
				],
			},
			{ displayName: 'Disable Responsive Document', name: 'disableResponsiveDocument', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false', description: 'Disable responsive document rendering' },
			{
				displayName: 'Editors',
				name: 'editors',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				default: {},
				description: 'Editor recipients who can make changes to the envelope',
				options: [
					{
						displayName: 'Editor',
						name: 'editor',
						values: [
							{ displayName: 'Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '', required: true },
							{ displayName: 'Name', name: 'name', type: 'string', default: '', required: true },
							{ displayName: 'Recipient ID', name: 'recipientId', type: 'string', default: '30' },
							{ displayName: 'Routing Order', name: 'routingOrder', type: 'string', default: '1' },
						],
					},
				],
			},
			{ displayName: 'Email Blurb', name: 'emailBlurb', type: 'string', default: '', description: 'The body text of the email sent to recipients' },
			{ displayName: 'Enable Wet Sign', name: 'enableWetSign', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false', description: 'Enable print-and-sign option' },
			{ displayName: 'Enforce Signer Visibility', name: 'enforceSignerVisibility', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false', description: 'Enforce signer document visibility settings' },
			{ displayName: 'Envelope ID Stamping', name: 'envelopeIdStamping', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false', description: 'Stamp envelope ID on documents' },
			{
				displayName: 'Event Notification (Webhook)',
				name: 'eventNotification',
				type: 'fixedCollection',
				default: {},
				description: 'Configure per-envelope webhook notifications',
				options: [
					{
						displayName: 'Configuration',
						name: 'config',
						values: [
							{ displayName: 'Envelope Events', name: 'envelopeEvents', type: 'string', default: 'sent,delivered,completed,declined,voided', description: 'Comma-separated envelope events' },
							{ displayName: 'Include Documents', name: 'includeDocuments', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
							{ displayName: 'Logging Enabled', name: 'loggingEnabled', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'true' },
							{ displayName: 'Recipient Events', name: 'recipientEvents', type: 'string', default: 'Sent,Delivered,Completed,Declined', description: 'Comma-separated recipient events' },
							{ displayName: 'Require Acknowledgment', name: 'requireAcknowledgment', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'true' },
							{ displayName: 'URL', name: 'url', type: 'string', default: '', required: true, description: 'Webhook endpoint URL' },
						],
					},
				],
			},
			{ displayName: 'Expire After (Days)', name: 'expireAfter', type: 'number', typeOptions: { minValue: 1, maxValue: 999 }, default: 120, description: 'Number of days before the envelope expires' },
			{
				displayName: 'In-Person Signers',
				name: 'inPersonSigners',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				default: {},
				description: 'In-person signing recipients',
				options: [
					{
						displayName: 'In-Person Signer',
						name: 'inPersonSigner',
						values: [
							{ displayName: 'Host Email', name: 'hostEmail', type: 'string', default: '', required: true, description: 'Email of the signing host' },
							{ displayName: 'Host Name', name: 'hostName', type: 'string', default: '', required: true, description: 'Name of the signing host' },
							{ displayName: 'In-Person Signing Type', name: 'inPersonSigningType', type: 'options', options: [{ name: 'In-Person Signer', value: 'inPersonSigner' }, { name: 'Notary', value: 'notary' }], default: 'inPersonSigner' },
							{ displayName: 'Recipient ID', name: 'recipientId', type: 'string', default: '70' },
							{ displayName: 'Routing Order', name: 'routingOrder', type: 'string', default: '1' },
							{ displayName: 'Signer Email', name: 'signerEmail', type: 'string', default: '', description: 'Email of the actual signer' },
							{ displayName: 'Signer Name', name: 'signerName', type: 'string', default: '', required: true, description: 'Name of the actual signer' },
						],
					},
				],
			},
			{
				displayName: 'Intermediaries',
				name: 'intermediaries',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				default: {},
				description: 'Intermediary recipients who route the envelope',
				options: [
					{
						displayName: 'Intermediary',
						name: 'intermediary',
						values: [
							{ displayName: 'Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '', required: true },
							{ displayName: 'Name', name: 'name', type: 'string', default: '', required: true },
							{ displayName: 'Recipient ID', name: 'recipientId', type: 'string', default: '40' },
							{ displayName: 'Routing Order', name: 'routingOrder', type: 'string', default: '1' },
						],
					},
				],
			},
			{ displayName: 'Message Lock', name: 'messageLock', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false', description: 'Lock email subject/blurb from modification' },
			{ displayName: 'Recipients Lock', name: 'recipientsLock', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false', description: 'Lock recipients from modification' },
			{ displayName: 'Reminder Delay (Days)', name: 'reminderDelay', type: 'number', typeOptions: { minValue: 1, maxValue: 999 }, default: 3, description: 'Days after sending before the first reminder' },
			{ displayName: 'Reminder Frequency (Days)', name: 'reminderFrequency', type: 'number', typeOptions: { minValue: 1, maxValue: 999 }, default: 2, description: 'Days between reminders' },
			{
				displayName: 'Sign Here Tabs (Auto-Place)',
				name: 'signHereTabs',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				default: {},
				description: 'Signature tabs placed on documents for each signer',
				options: [
					{
						displayName: 'Tab',
						name: 'tab',
						values: [
							{ displayName: 'Anchor String', name: 'anchorString', type: 'string', default: '/sn1/', displayOptions: { show: { placementMethod: ['anchor'] } } },
							{ displayName: 'Anchor X Offset', name: 'anchorXOffset', type: 'string', default: '0', displayOptions: { show: { placementMethod: ['anchor'] } } },
							{ displayName: 'Anchor Y Offset', name: 'anchorYOffset', type: 'string', default: '0', displayOptions: { show: { placementMethod: ['anchor'] } } },
							{ displayName: 'Document ID', name: 'documentId', type: 'string', default: '1' },
							{ displayName: 'Page Number', name: 'pageNumber', type: 'string', default: '1' },
							{ displayName: 'Placement Method', name: 'placementMethod', type: 'options', options: [{ name: 'Anchor String', value: 'anchor' }, { name: 'Fixed Position (X/Y)', value: 'fixed' }], default: 'anchor' },
							{ displayName: 'Recipient ID', name: 'recipientId', type: 'string', default: '1' },
							{ displayName: 'X Position', name: 'xPosition', type: 'string', default: '100', displayOptions: { show: { placementMethod: ['fixed'] } } },
							{ displayName: 'Y Position', name: 'yPosition', type: 'string', default: '100', displayOptions: { show: { placementMethod: ['fixed'] } } },
						],
					},
				],
			},
			{ displayName: 'Signing Location', name: 'signingLocation', type: 'options', options: [{ name: 'Online', value: 'online' }, { name: 'In Person', value: 'inPerson' }], default: 'online' },
			{ displayName: 'Transaction ID', name: 'transactionId', type: 'string', default: '', description: 'Client transaction ID for idempotency' },
			{ displayName: 'Use Disclosure', name: 'useDisclosure', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false', description: 'Show disclosure to recipients' },
			{
				displayName: 'Witnesses',
				name: 'witnesses',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				default: {},
				description: 'Witness recipients',
				options: [
					{
						displayName: 'Witness',
						name: 'witness',
						values: [
							{ displayName: 'Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '', required: true },
							{ displayName: 'Name', name: 'name', type: 'string', default: '', required: true },
							{ displayName: 'Recipient ID', name: 'recipientId', type: 'string', default: '60' },
							{ displayName: 'Routing Order', name: 'routingOrder', type: 'string', default: '1' },
							{ displayName: 'Witness For (Recipient ID)', name: 'witnessFor', type: 'string', default: '', description: 'The recipient ID this witness is witnessing for' },
						],
					},
				],
			},
		],
	},

	// ==================================================================
	// Create From Template: Template ID
	// ==================================================================
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID (GUID) of the template to use',
		displayOptions: { show: { resource: ['envelope'], operation: ['createFromTemplate'] } },
	},

	// ==================================================================
	// Create From Template: Template Roles
	// ==================================================================
	{
		displayName: 'Template Roles',
		name: 'templateRoles',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		required: true,
		default: {},
		placeholder: 'Add Role',
		description: 'Map template roles to actual recipients',
		displayOptions: { show: { resource: ['envelope'], operation: ['createFromTemplate'] } },
		options: [
			{
				displayName: 'Role',
				name: 'role',
				values: [
					{ displayName: 'Access Code', name: 'accessCode', type: 'string', typeOptions: { password: true }, default: '', description: 'Access code for authentication' },
					{ displayName: 'Client User ID', name: 'clientUserId', type: 'string', default: '', description: 'Set to enable embedded signing' },
					{ displayName: 'Delivery Method', name: 'deliveryMethod', type: 'options', options: [{ name: 'Email', value: 'email' }, { name: 'SMS', value: 'sms' }], default: 'email' },
					{ displayName: 'Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '', required: true },
					{ displayName: 'Email Notification Body', name: 'emailNotificationBody', type: 'string', default: '' },
					{ displayName: 'Email Notification Subject', name: 'emailNotificationSubject', type: 'string', default: '' },
					{ displayName: 'Name', name: 'name', type: 'string', default: '', required: true },
					{ displayName: 'Phone Number (for SMS)', name: 'phoneNumber', type: 'string', default: '', description: 'Country code, a space, then the number, e.g. +49 1701234567' },
					{ displayName: 'Role Name', name: 'roleName', type: 'string', default: '', required: true, description: 'The role name as defined in the template (e.g., "Signer 1")' },
				],
			},
		],
	},

	// ==================================================================
	// Create From Template: Status
	// ==================================================================
	{
		displayName: 'Status',
		name: 'templateStatus',
		type: 'options',
		options: [
			{ name: 'Draft (Created)', value: 'created' },
			{ name: 'Sent', value: 'sent' },
		],
		default: 'sent',
		displayOptions: { show: { resource: ['envelope'], operation: ['createFromTemplate'] } },
	},
	{
		displayName: 'Email Subject (Override)',
		name: 'templateEmailSubject',
		type: 'string',
		default: '',
		description: 'Override the template email subject. Leave empty to use template default.',
		displayOptions: { show: { resource: ['envelope'], operation: ['createFromTemplate'] } },
	},

	// ==================================================================
	// Void: Reason
	// ==================================================================
	{
		displayName: 'Void Reason',
		name: 'voidReason',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Document no longer required',
		displayOptions: { show: { resource: ['envelope'], operation: ['void'] } },
	},

	// ==================================================================
	// Update: Fields
	// ==================================================================
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['envelope'], operation: ['update'] } },
		options: [
			{ displayName: 'Brand ID', name: 'brandId', type: 'string', default: '' },
			{ displayName: 'Email Blurb', name: 'emailBlurb', type: 'string', default: '' },
			{ displayName: 'Email Subject', name: 'emailSubject', type: 'string', default: '' },
			{ displayName: 'Message Lock', name: 'messageLock', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
			{ displayName: 'Purge State', name: 'purgeState', type: 'options', options: [{ name: 'None', value: '' }, { name: 'Documents Queued', value: 'documents_queued' }, { name: 'Documents Dequeued', value: 'documents_dequeued' }, { name: 'Documents and Metadata Queued', value: 'documents_and_metadata_queued' }], default: '', description: 'Purge state for GDPR/CCPA compliance' },
			{ displayName: 'Recipients Lock', name: 'recipientsLock', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'false' },
			{ displayName: 'Status', name: 'status', type: 'options', options: [{ name: 'Sent', value: 'sent' }, { name: 'Voided', value: 'voided' }], default: 'sent', description: 'Change envelope status' },
			{ displayName: 'Voided Reason', name: 'voidedReason', type: 'string', default: '', description: 'Required when changing status to voided' },
		],
	},

	// ==================================================================
	// Get Many: Filters
	// ==================================================================
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['envelope'], operation: ['getAll', 'listStatusChanges'] } },
		options: [
			{ displayName: 'Folder IDs', name: 'folderIds', type: 'string', default: '' },
			{ displayName: 'From Date', name: 'fromDate', type: 'dateTime', default: '', description: 'Start date (ISO 8601)' },
			{ displayName: 'Order By', name: 'orderBy', type: 'options', options: [{ name: 'Completed', value: 'completed' }, { name: 'Created', value: 'created' }, { name: 'Last Modified', value: 'last_modified' }, { name: 'Sent', value: 'sent' }, { name: 'Status Changed', value: 'status_changed' }], default: 'created' },
			{ displayName: 'Order Direction', name: 'order', type: 'options', options: [{ name: 'Ascending', value: 'asc' }, { name: 'Descending', value: 'desc' }], default: 'desc' },
			{ displayName: 'Search Text', name: 'searchText', type: 'string', default: '', description: 'Search by subject, recipient name, or email' },
			{
				displayName: 'Status',
				name: 'status',
				type: 'multiOptions',
				options: [
					{ name: 'Completed', value: 'completed' },
					{ name: 'Created (Draft)', value: 'created' },
					{ name: 'Declined', value: 'declined' },
					{ name: 'Delivered', value: 'delivered' },
					{ name: 'Sent', value: 'sent' },
					{ name: 'Signed', value: 'signed' },
					{ name: 'Voided', value: 'voided' },
				],
				default: [],
			},
			{ displayName: 'To Date', name: 'toDate', type: 'dateTime', default: '' },
		],
	},
	{
		displayName: 'Max Results',
		name: 'maxResults',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 2000 },
		default: 100,
		displayOptions: { show: { resource: ['envelope'], operation: ['getAll'] } },
	},

	// ==================================================================
	// Get Embedded Signing URL
	// ==================================================================
	{ displayName: 'Signer Email', name: 'signerEmail', type: 'string', placeholder: 'name@email.com', required: true, default: '', displayOptions: { show: { resource: ['envelope'], operation: ['getSigningUrl'] } } },
	{ displayName: 'Signer Name', name: 'signerName', type: 'string', required: true, default: '', displayOptions: { show: { resource: ['envelope'], operation: ['getSigningUrl'] } } },
	{ displayName: 'Client User ID', name: 'signerClientUserId', type: 'string', required: true, default: '', description: 'Must match the Client User ID set when the recipient was added', displayOptions: { show: { resource: ['envelope'], operation: ['getSigningUrl'] } } },
	{ displayName: 'Return URL', name: 'returnUrl', type: 'string', required: true, default: 'https://example.com/signing-complete', displayOptions: { show: { resource: ['envelope'], operation: ['getSigningUrl'] } } },

	// ==================================================================
	// Download Documents
	// ==================================================================
	{ displayName: 'Document ID', name: 'documentId', type: 'string', default: 'combined', description: 'Use "combined" for all merged, "archive" for ZIP, "certificate" for CoC, or a numeric document ID', displayOptions: { show: { resource: ['envelope'], operation: ['downloadDocuments'] } } },
	{ displayName: 'Binary Property', name: 'binaryPropertyName', type: 'string', default: 'data', displayOptions: { show: { resource: ['envelope'], operation: ['downloadDocuments'] } } },

	// ==================================================================
	// Notification Settings (update)
	// ==================================================================
	{
		displayName: 'Notification Settings',
		name: 'notificationSettings',
		type: 'collection',
		placeholder: 'Add Setting',
		default: {},
		displayOptions: { show: { resource: ['envelope'], operation: ['updateNotificationSettings'] } },
		options: [
			{ displayName: 'Expire After (Days)', name: 'expireAfter', type: 'number', default: 120 },
			{ displayName: 'Expire Enabled', name: 'expireEnabled', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'true' },
			{ displayName: 'Expire Warn (Days Before)', name: 'expireWarn', type: 'number', default: 3 },
			{ displayName: 'Reminder Delay (Days)', name: 'reminderDelay', type: 'number', default: 3 },
			{ displayName: 'Reminder Enabled', name: 'reminderEnabled', type: 'options', options: [{ name: 'Yes', value: 'true' }, { name: 'No', value: 'false' }], default: 'true' },
			{ displayName: 'Reminder Frequency (Days)', name: 'reminderFrequency', type: 'number', default: 2 },
		],
	},
];
