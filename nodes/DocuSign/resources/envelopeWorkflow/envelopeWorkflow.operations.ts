import type { INodeProperties } from 'n8n-workflow';

export const envelopeWorkflowOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['envelopeWorkflow'] } },
		options: [
			{ name: 'Create Workflow Step', value: 'createEnvelopeWorkflowStep', description: 'Create a new workflow step', action: 'Create workflow step' },
			{ name: 'Delete Delayed Routing', value: 'deleteEnvelopeDelayedRouting', description: 'Delete delayed routing for a workflow step', action: 'Delete delayed routing' },
			{ name: 'Delete Scheduled Sending', value: 'deleteEnvelopeScheduledSending', description: 'Delete scheduled sending rules', action: 'Delete scheduled sending' },
			{ name: 'Delete Workflow', value: 'deleteEnvelopeWorkflow', description: 'Delete the workflow definition', action: 'Delete workflow' },
			{ name: 'Delete Workflow Step', value: 'deleteEnvelopeWorkflowStep', description: 'Delete a workflow step', action: 'Delete workflow step' },
			{ name: 'Get Delayed Routing', value: 'getEnvelopeDelayedRouting', description: 'Get delayed routing for a workflow step', action: 'Get delayed routing' },
			{ name: 'Get Scheduled Sending', value: 'getEnvelopeScheduledSending', description: 'Get scheduled sending rules', action: 'Get scheduled sending' },
			{ name: 'Get Workflow', value: 'getEnvelopeWorkflow', description: 'Get the workflow definition', action: 'Get workflow' },
			{ name: 'Get Workflow Step', value: 'getEnvelopeWorkflowStep', description: 'Get a specific workflow step', action: 'Get workflow step' },
			{ name: 'Update Delayed Routing', value: 'updateEnvelopeDelayedRouting', description: 'Update delayed routing for a workflow step', action: 'Update delayed routing' },
			{ name: 'Update Scheduled Sending', value: 'updateEnvelopeScheduledSending', description: 'Update scheduled sending rules', action: 'Update scheduled sending' },
			{ name: 'Update Workflow', value: 'updateEnvelopeWorkflow', description: 'Update the workflow definition', action: 'Update workflow' },
			{ name: 'Update Workflow Step', value: 'updateEnvelopeWorkflowStep', description: 'Update a workflow step', action: 'Update workflow step' },
		],
		default: 'getEnvelopeWorkflow',
	},
];
