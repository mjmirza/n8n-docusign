import type { INodeProperties } from 'n8n-workflow';

export const accountPasswordRuleOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['accountPasswordRule'] } },
		options: [
			{ name: 'Get', value: 'get', description: 'Get account password rules', action: 'Get account password rules' },
			{ name: 'Get for User', value: 'getForUser', description: 'Get password rules for a specific user', action: 'Get password rules for user' },
			{ name: 'Update', value: 'update', description: 'Update account password rules', action: 'Update account password rules' },
		],
		default: 'get',
	},
];
