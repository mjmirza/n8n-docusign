import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, envelopeIdField, templateIdField } from '../../utils/descriptions';

const allOperations = [
	'getEnvelopeWorkflow', 'updateEnvelopeWorkflow', 'deleteEnvelopeWorkflow',
	'getEnvelopeWorkflowStep', 'createEnvelopeWorkflowStep', 'updateEnvelopeWorkflowStep', 'deleteEnvelopeWorkflowStep',
	'getEnvelopeDelayedRouting', 'updateEnvelopeDelayedRouting', 'deleteEnvelopeDelayedRouting',
	'getEnvelopeScheduledSending', 'updateEnvelopeScheduledSending', 'deleteEnvelopeScheduledSending',
];

const envelopeOperations = allOperations;
const templateOperations = allOperations;

const stepOperations = [
	'getEnvelopeWorkflowStep', 'updateEnvelopeWorkflowStep', 'deleteEnvelopeWorkflowStep',
	'getEnvelopeDelayedRouting', 'updateEnvelopeDelayedRouting', 'deleteEnvelopeDelayedRouting',
];

const jsonBodyOperations = [
	'updateEnvelopeWorkflow', 'createEnvelopeWorkflowStep', 'updateEnvelopeWorkflowStep',
	'updateEnvelopeDelayedRouting', 'updateEnvelopeScheduledSending',
];

export const envelopeWorkflowFields: INodeProperties[] = [
	accountIdField(['envelopeWorkflow']),

	// Scope: envelope or template
	{
		displayName: 'Scope',
		name: 'scope',
		type: 'options',
		options: [
			{ name: 'Envelope', value: 'envelope' },
			{ name: 'Template', value: 'template' },
		],
		required: true,
		default: 'envelope',
		description: 'Whether to manage workflow on an envelope or a template',
		displayOptions: {
			show: { resource: ['envelopeWorkflow'], operation: allOperations },
		},
	},

	// Envelope ID — shown when scope=envelope
	{
		displayName: 'Envelope ID',
		name: 'envelopeId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID (GUID) of the envelope',
		displayOptions: {
			show: { resource: ['envelopeWorkflow'], operation: envelopeOperations, scope: ['envelope'] },
		},
	},

	// Template ID — shown when scope=template
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID (GUID) of the template',
		displayOptions: {
			show: { resource: ['envelopeWorkflow'], operation: templateOperations, scope: ['template'] },
		},
	},

	// Step ID — for step-specific operations
	{
		displayName: 'Step ID',
		name: 'stepId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the workflow step',
		displayOptions: {
			show: { resource: ['envelopeWorkflow'], operation: stepOperations },
		},
	},

	// Request Body — for create/update operations
	{
		displayName: 'Request Body (JSON)',
		name: 'requestBody',
		type: 'json',
		required: true,
		default: '{}',
		description: 'The JSON request body for the operation',
		displayOptions: {
			show: { resource: ['envelopeWorkflow'], operation: jsonBodyOperations },
		},
	},
];
