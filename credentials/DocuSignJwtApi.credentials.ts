import type {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class DocuSignJwtApi implements ICredentialType {
	name = 'docuSignJwtApi';
	displayName = 'DocuSign JWT API';
	documentationUrl = 'https://developers.docusign.com/platform/auth/jwt/';

	properties: INodeProperties[] = [
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Production',
					value: 'production',
				},
				{
					name: 'Demo / Sandbox',
					value: 'demo',
				},
			],
			default: 'demo',
			description: 'The DocuSign environment to connect to',
		},
		{
			displayName: 'Integration Key (Client ID)',
			name: 'integrationKey',
			type: 'string',
			default: '',
			required: true,
			description: 'The Integration Key from your DocuSign app',
		},
		{
			displayName: 'User ID (GUID)',
			name: 'userId',
			type: 'string',
			default: '',
			required: true,
			description: 'The GUID of the user to impersonate',
		},
		{
			displayName: 'RSA Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: { password: true, rows: 5 },
			default: '',
			required: true,
			description: 'The RSA private key (PEM format) for JWT signing',
		},
		{
			displayName: 'Account ID',
			name: 'accountId',
			type: 'string',
			default: '',
			required: true,
			description: 'The DocuSign Account ID (GUID) to use',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL:
				'={{$credentials.environment === "production" ? "https://account.docusign.com" : "https://account-d.docusign.com"}}',
			url: '/oauth/userinfo',
			method: 'GET',
		},
	};
}
