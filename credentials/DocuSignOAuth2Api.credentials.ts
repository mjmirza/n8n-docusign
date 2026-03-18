import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class DocuSignOAuth2Api implements ICredentialType {
	name = 'docuSignOAuth2Api';
	extends = ['oAuth2Api'];
	displayName = 'DocuSign OAuth2 API';
	documentationUrl = 'https://developers.docusign.com/platform/auth/authcode/';

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
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default:
				'={{$self.environment === "production" ? "https://account.docusign.com/oauth/auth" : "https://account-d.docusign.com/oauth/auth"}}',
			required: true,
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default:
				'={{$self.environment === "production" ? "https://account.docusign.com/oauth/token" : "https://account-d.docusign.com/oauth/token"}}',
			required: true,
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'signature extended',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header',
		},
	];
}
