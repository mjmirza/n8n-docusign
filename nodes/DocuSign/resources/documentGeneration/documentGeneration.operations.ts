import type { INodeProperties } from 'n8n-workflow';

export const documentGenerationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['documentGeneration'] } },
		options: [
			{ name: 'Get Form Fields', value: 'getFormFields', description: 'Get document generation form fields', action: 'Get document generation form fields' },
			{ name: 'Update Form Fields', value: 'updateFormFields', description: 'Update document generation form fields', action: 'Update document generation form fields' },
		],
		default: 'getFormFields',
	},
];
