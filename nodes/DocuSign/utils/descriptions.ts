/**
 * Shared INodeProperties definitions used across multiple resources.
 * Centralises common fields to eliminate duplication and ensure consistency.
 */
import type { INodeProperties } from 'n8n-workflow';

// ---------------------------------------------------------------------------
// Account ID — used by virtually every resource
// ---------------------------------------------------------------------------

export function accountIdField(
	resources: string[],
	operations?: string[],
): INodeProperties {
	const displayOptions: INodeProperties['displayOptions'] = {
		show: { resource: resources },
	};
	if (operations) {
		displayOptions.show!.operation = operations;
	}
	return {
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		required: true,
		default: '',
		description:
			'The DocuSign Account ID (GUID). Find it in DocuSign Admin → API and Keys.',
		displayOptions,
	};
}

// ---------------------------------------------------------------------------
// Envelope ID — used by envelope sub-resources
// ---------------------------------------------------------------------------

export function envelopeIdField(
	resources: string[],
	operations?: string[],
): INodeProperties {
	const displayOptions: INodeProperties['displayOptions'] = {
		show: { resource: resources },
	};
	if (operations) {
		displayOptions.show!.operation = operations;
	}
	return {
		displayName: 'Envelope ID',
		name: 'envelopeId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID (GUID) of the envelope',
		displayOptions,
	};
}

// ---------------------------------------------------------------------------
// Template ID — used by template sub-resources
// ---------------------------------------------------------------------------

export function templateIdField(
	resources: string[],
	operations?: string[],
): INodeProperties {
	const displayOptions: INodeProperties['displayOptions'] = {
		show: { resource: resources },
	};
	if (operations) {
		displayOptions.show!.operation = operations;
	}
	return {
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID (GUID) of the template',
		displayOptions,
	};
}

// ---------------------------------------------------------------------------
// Document ID — used by document sub-resources
// ---------------------------------------------------------------------------

export function documentIdField(
	resources: string[],
	operations?: string[],
): INodeProperties {
	const displayOptions: INodeProperties['displayOptions'] = {
		show: { resource: resources },
	};
	if (operations) {
		displayOptions.show!.operation = operations;
	}
	return {
		displayName: 'Document ID',
		name: 'documentId',
		type: 'string',
		required: true,
		default: '1',
		description:
			'The numeric ID of the document. Use "combined" for all merged, "archive" for ZIP, "certificate" for CoC.',
		displayOptions,
	};
}

// ---------------------------------------------------------------------------
// Recipient ID — used by recipient sub-resources
// ---------------------------------------------------------------------------

export function recipientIdField(
	resources: string[],
	operations?: string[],
): INodeProperties {
	const displayOptions: INodeProperties['displayOptions'] = {
		show: { resource: resources },
	};
	if (operations) {
		displayOptions.show!.operation = operations;
	}
	return {
		displayName: 'Recipient ID',
		name: 'recipientId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the recipient',
		displayOptions,
	};
}

// ---------------------------------------------------------------------------
// User ID — used by user sub-resources
// ---------------------------------------------------------------------------

export function userIdField(
	resources: string[],
	operations?: string[],
): INodeProperties {
	const displayOptions: INodeProperties['displayOptions'] = {
		show: { resource: resources },
	};
	if (operations) {
		displayOptions.show!.operation = operations;
	}
	return {
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID (GUID) of the user',
		displayOptions,
	};
}

// ---------------------------------------------------------------------------
// Max Results — used by paginated list operations
// ---------------------------------------------------------------------------

export function maxResultsField(
	resources: string[],
	defaultValue = 100,
	maxValue = 2000,
): INodeProperties {
	return {
		displayName: 'Max Results',
		name: 'maxResults',
		type: 'number',
		typeOptions: { minValue: 1, maxValue },
		default: defaultValue,
		description: 'Maximum number of results to return',
		displayOptions: {
			show: { resource: resources, operation: ['getAll', 'list'] },
		},
	};
}

// ---------------------------------------------------------------------------
// Binary Property Name — used by download operations
// ---------------------------------------------------------------------------

export function binaryPropertyField(
	resources: string[],
	operations: string[],
): INodeProperties {
	return {
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		description:
			'The name of the binary property to store the downloaded file',
		displayOptions: {
			show: { resource: resources, operation: operations },
		},
	};
}

// ---------------------------------------------------------------------------
// Category definitions for the category selector
// ---------------------------------------------------------------------------

export const CATEGORIES = [
	{
		name: 'Envelopes',
		value: 'envelopes',
		description: 'Manage signing envelopes, recipients, documents, tabs, and views',
	},
	{
		name: 'Templates',
		value: 'templates',
		description: 'Manage reusable envelope templates and their sub-resources',
	},
	{
		name: 'Account',
		value: 'account',
		description: 'Account settings, brands, permissions, custom fields, and signatures',
	},
	{
		name: 'Users & Groups',
		value: 'usersAndGroups',
		description: 'Manage users, groups, contacts, profiles, and authorizations',
	},
	{
		name: 'Billing',
		value: 'billing',
		description: 'Billing plans, invoices, payments, and envelope purchases',
	},
	{
		name: 'Connect',
		value: 'connect',
		description: 'Webhook configurations, logs, and event management',
	},
	{
		name: 'Folders',
		value: 'folders',
		description: 'Organize and search envelopes in folders',
	},
	{
		name: 'Signing Groups',
		value: 'signingGroups',
		description: 'Manage signing groups and their members',
	},
	{
		name: 'PowerForms',
		value: 'powerForms',
		description: 'Create and manage self-service signing forms',
	},
	{
		name: 'Bulk Operations',
		value: 'bulkOperations',
		description: 'Bulk send, chunked uploads, and batch operations',
	},
	{
		name: 'Workspaces',
		value: 'workspaces',
		description: 'Collaborative workspaces and file management',
	},
	{
		name: 'Advanced',
		value: 'advanced',
		description: 'Diagnostics, email archive, notary, cloud storage, and custom tabs',
	},
] as const;

// ---------------------------------------------------------------------------
// Category → Resource mapping
// ---------------------------------------------------------------------------

export const CATEGORY_RESOURCES: Record<string, Array<{ name: string; value: string; description: string }>> = {
	envelopes: [
		{ name: 'Envelope', value: 'envelope', description: 'Create, send, void, and manage signing envelopes' },
		{ name: 'Envelope Attachment', value: 'envelopeAttachment', description: 'Manage envelope attachments' },
		{ name: 'Envelope Comment', value: 'envelopeComment', description: 'Get envelope comments' },
		{ name: 'Envelope Consumer Disclosure', value: 'envelopeConsumerDisclosure', description: 'Consumer disclosure settings' },
		{ name: 'Envelope Custom Field', value: 'envelopeCustomField', description: 'Manage custom metadata fields on envelopes' },
		{ name: 'Envelope Document', value: 'envelopeDocument', description: 'List, download, and manage documents in envelopes' },
		{ name: 'Envelope Document Field', value: 'envelopeDocumentField', description: 'Manage document-level fields' },
		{ name: 'Envelope Document Tab', value: 'envelopeDocumentTab', description: 'Manage tabs on specific documents' },
		{ name: 'Envelope Document Visibility', value: 'envelopeDocumentVisibility', description: 'Control document visibility per recipient' },
		{ name: 'Envelope Email Setting', value: 'envelopeEmailSetting', description: 'Manage envelope email settings' },
		{ name: 'Envelope Form Data', value: 'envelopeFormData', description: 'Get form field data from completed envelopes' },
		{ name: 'Envelope HTML Definition', value: 'envelopeHtmlDefinition', description: 'Get HTML definitions for responsive signing' },
		{ name: 'Envelope Lock', value: 'envelopeLock', description: 'Lock/unlock envelopes for exclusive editing' },
		{ name: 'Envelope Publish', value: 'envelopePublish', description: 'Publish historical envelope transactions' },
		{ name: 'Envelope Recipient', value: 'envelopeRecipient', description: 'Add, update, and remove recipients on envelopes' },
		{ name: 'Envelope Recipient Tab', value: 'envelopeRecipientTab', description: 'Manage tabs (signature fields) per recipient' },
		{ name: 'Envelope Template', value: 'envelopeTemplate', description: 'Apply and manage templates on envelopes' },
		{ name: 'Envelope Transfer Rule', value: 'envelopeTransferRule', description: 'Manage envelope transfer rules' },
		{ name: 'Envelope View', value: 'envelopeView', description: 'Generate embedded signing, sender, and edit URLs' },
		{ name: 'Envelope Workflow', value: 'envelopeWorkflow', description: 'Manage workflow steps, delayed routing, scheduled sending' },
		{ name: 'Document Generation', value: 'documentGeneration', description: 'Manage document generation form fields' },
		{ name: 'Responsive HTML Preview', value: 'responsiveHtmlPreview', description: 'Generate responsive HTML previews' },
		{ name: 'Tabs Blob', value: 'tabsBlob', description: 'Get/set tabs blob data' },
	],
	templates: [
		{ name: 'Template', value: 'template', description: 'Create, get, update, and delete templates' },
		{ name: 'Template Custom Field', value: 'templateCustomField', description: 'Manage template custom fields' },
		{ name: 'Template Document', value: 'templateDocument', description: 'Manage template documents' },
		{ name: 'Template Document Field', value: 'templateDocumentField', description: 'Manage template document fields' },
		{ name: 'Template Document Tab', value: 'templateDocumentTab', description: 'Manage tabs on template documents' },
		{ name: 'Template Document Visibility', value: 'templateDocumentVisibility', description: 'Control template document visibility' },
		{ name: 'Template HTML Definition', value: 'templateHtmlDefinition', description: 'Get template HTML definitions' },
		{ name: 'Template Lock', value: 'templateLock', description: 'Lock/unlock templates' },
		{ name: 'Template Recipient', value: 'templateRecipient', description: 'Manage template recipient roles' },
		{ name: 'Template Recipient Tab', value: 'templateRecipientTab', description: 'Manage tabs per template recipient' },
		{ name: 'Template View', value: 'templateView', description: 'Generate template edit URLs' },
	],
	account: [
		{ name: 'Account', value: 'account', description: 'Account settings, configuration, and metadata' },
		{ name: 'Account Brand', value: 'accountBrand', description: 'White-label branding with logos' },
		{ name: 'Account Consumer Disclosure', value: 'accountConsumerDisclosure', description: 'Consumer disclosure settings' },
		{ name: 'Account Custom Field', value: 'accountCustomField', description: 'Account-level custom fields' },
		{ name: 'Account Password Rule', value: 'accountPasswordRule', description: 'Password policy rules' },
		{ name: 'Account Permission Profile', value: 'accountPermissionProfile', description: 'User permission profiles' },
		{ name: 'Account Seal Provider', value: 'accountSealProvider', description: 'List seal providers' },
		{ name: 'Account Signature', value: 'accountSignature', description: 'Account-level signatures' },
		{ name: 'Account Signature Provider', value: 'accountSignatureProvider', description: 'Signature providers' },
		{ name: 'Account Tab Setting', value: 'accountTabSetting', description: 'Tab type settings' },
		{ name: 'Account Watermark', value: 'accountWatermark', description: 'Watermark settings' },
		{ name: 'Authorization', value: 'authorization', description: 'User authorization delegation' },
		{ name: 'eNote Configuration', value: 'eNoteConfiguration', description: 'eNote settings' },
		{ name: 'Favorite Template', value: 'favoriteTemplate', description: 'Manage favorite templates' },
		{ name: 'Identity Verification', value: 'identityVerification', description: 'Identity verification providers' },
	],
	usersAndGroups: [
		{ name: 'User', value: 'user', description: 'Manage user accounts' },
		{ name: 'User Contact', value: 'userContact', description: 'Manage user contacts' },
		{ name: 'User Custom Setting', value: 'userCustomSetting', description: 'User custom settings' },
		{ name: 'User Profile', value: 'userProfile', description: 'User profile information' },
		{ name: 'User Signature', value: 'userSignature', description: 'User signature management' },
		{ name: 'Group', value: 'group', description: 'Manage user groups' },
		{ name: 'Group Brand', value: 'groupBrand', description: 'Group branding' },
		{ name: 'Group User', value: 'groupUser', description: 'Group membership' },
	],
	billing: [
		{ name: 'Billing Plan', value: 'billingPlan', description: 'Billing plans and purchases' },
		{ name: 'Invoice', value: 'invoice', description: 'Account invoices' },
		{ name: 'Payment', value: 'payment', description: 'Payment records' },
		{ name: 'Payment Gateway', value: 'paymentGateway', description: 'Payment gateway accounts' },
	],
	connect: [
		{ name: 'Connect Configuration', value: 'connectConfiguration', description: 'Webhook configurations' },
	],
	folders: [
		{ name: 'Folder', value: 'folder', description: 'Envelope folders' },
	],
	signingGroups: [
		{ name: 'Signing Group', value: 'signingGroup', description: 'Signing groups' },
		{ name: 'Signing Group User', value: 'signingGroupUser', description: 'Signing group members' },
	],
	powerForms: [
		{ name: 'PowerForm', value: 'powerForm', description: 'Self-service signing forms' },
		{ name: 'PowerForm Data', value: 'powerFormData', description: 'PowerForm submission data' },
	],
	bulkOperations: [
		{ name: 'Bulk Envelope', value: 'bulkEnvelope', description: 'Bulk send operations' },
		{ name: 'Chunked Upload', value: 'chunkedUpload', description: 'Large file uploads' },
	],
	workspaces: [
		{ name: 'Workspace', value: 'workspace', description: 'Collaborative workspaces' },
		{ name: 'Workspace Item', value: 'workspaceItem', description: 'Workspace files and folders' },
	],
	advanced: [
		{ name: 'BCC Email Archive', value: 'bccEmailArchive', description: 'Email archiving configuration' },
		{ name: 'Cloud Storage', value: 'cloudStorage', description: 'Cloud storage providers' },
		{ name: 'Custom Tab', value: 'customTab', description: 'Custom tab type definitions' },
		{ name: 'Notary', value: 'notary', description: 'Notary services' },
		{ name: 'Notary Journal', value: 'notaryJournal', description: 'Notary journals' },
		{ name: 'Notary Jurisdiction', value: 'notaryJurisdiction', description: 'Notary jurisdictions' },
		{ name: 'Request Log', value: 'requestLog', description: 'API request logs' },
		{ name: 'Diagnostic Resource', value: 'diagnosticResource', description: 'API resources info' },
		{ name: 'Diagnostic Service', value: 'diagnosticService', description: 'API service info' },
	],
};
