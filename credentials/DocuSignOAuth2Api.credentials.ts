import type { Icon, ICredentialType, INodeProperties } from 'n8n-workflow';

export class DocuSignOAuth2Api implements ICredentialType {
	name = 'docuSignOAuth2Api';
	extends = ['oAuth2Api'];
	displayName = 'DocuSign OAuth2 API';
	icon: Icon = {
		light: 'file:../nodes/DocuSign/docusign.light.svg',
		dark: 'file:../nodes/DocuSign/docusign.dark.svg',
	};
	documentationUrl = 'https://developers.docusign.com/platform/auth/authcode/';

	properties: INodeProperties[] = [
		{
			displayName:
				'Setup: Go to developers.docusign.com → Settings → Apps and Keys → create an app. ' +
				'Copy the Integration Key (Client ID) and add a Secret Key. ' +
				'Under Redirect URIs, add your n8n OAuth callback URL (shown below after you save).',
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
