import type {
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class DocuSignJwtApi implements ICredentialType {
	name = 'docuSignJwtApi';
	displayName = 'DocuSign JWT API';
	icon: Icon = {
		light: 'file:../nodes/DocuSign/docusign.light.svg',
		dark: 'file:../nodes/DocuSign/docusign.dark.svg',
	};
	documentationUrl = 'https://developers.docusign.com/platform/auth/jwt/';

	properties: INodeProperties[] = [
		{
			displayName:
				'Setup: Go to developers.docusign.com → Settings → Apps and Keys → create an app. ' +
				'Copy the Integration Key. Under Service Integration, click Generate RSA and save the private key. ' +
				'Then grant consent once by visiting: https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=YOUR_INTEGRATION_KEY&redirect_uri=https://www.docusign.com',
			name: 'setupNotice',
			type: 'notice',
			default: '',
		},
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
			description: 'The DocuSign environment to connect to. Use Demo for testing, Production for live signing.',
		},
		{
			displayName: 'Integration Key (Client ID)',
			name: 'integrationKey',
			type: 'string',
			default: '',
			required: true,
			description: 'The Integration Key (GUID) from your DocuSign app. Found in Apps and Keys.',
		},
		{
			displayName: 'User ID (GUID)',
			name: 'userId',
			type: 'string',
			default: '',
			required: true,
			description: 'The GUID of the DocuSign user to impersonate. Found in Apps and Keys under your profile.',
		},
		{
			displayName: 'RSA Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: { password: true, rows: 5 },
			default: '',
			required: true,
			description: 'The RSA private key in PEM format. Starts with -----BEGIN RSA PRIVATE KEY-----',
		},
		{
			displayName: 'Account ID',
			name: 'accountId',
			type: 'string',
			default: '',
			required: true,
			description: 'The DocuSign Account ID (GUID). Found in Apps and Keys under API Account ID.',
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
