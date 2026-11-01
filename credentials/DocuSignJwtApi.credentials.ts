import type {
	Icon,
	IAuthenticateGeneric,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IDataObject,
	IHttpRequestHelper,
	INodeProperties,
} from 'n8n-workflow';
import { createSign } from 'crypto';

/** OAuth host per environment; also the JWT audience (without the scheme). */
export const DOCUSIGN_JWT_AUTH_HOSTS: Record<string, string> = {
	demo: 'account-d.docusign.com',
	production: 'account.docusign.com',
};

function base64Url(value: Buffer | string): string {
	return Buffer.from(value).toString('base64url');
}

/** Restores PEM line breaks when a key was pasted as one line with literal \n sequences. */
export function normalizePrivateKey(key: string): string {
	return key.includes('\\n') ? key.replace(/\\n/g, '\n').trim() : key.trim();
}

/**
 * Builds the RS256 JWT grant assertion DocuSign expects for service integrations:
 * iss = integration key, sub = impersonated user, aud = the OAuth host, one hour lifetime.
 */
export function buildDocuSignJwtAssertion(
	credentials: ICredentialDataDecryptedObject,
	nowSeconds = Math.floor(Date.now() / 1000),
): string {
	const environment = (credentials.environment as string) || 'demo';
	const audience = DOCUSIGN_JWT_AUTH_HOSTS[environment];
	if (!audience) {
		throw new Error(`Invalid DocuSign environment: "${environment}". Use "demo" or "production".`);
	}
	const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
	const payload = base64Url(
		JSON.stringify({
			iss: credentials.integrationKey,
			sub: credentials.userId,
			aud: audience,
			iat: nowSeconds,
			exp: nowSeconds + 3600,
			scope: 'signature impersonation',
		}),
	);
	const signer = createSign('RSA-SHA256');
	signer.update(`${header}.${payload}`);
	const signature = signer.sign(normalizePrivateKey(String(credentials.privateKey ?? '')));
	return `${header}.${payload}.${base64Url(signature)}`;
}

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
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'hidden',
			typeOptions: { expirable: true, password: true },
			default: '',
		},
	];

	/** Exchanges the signed JWT grant for an access token; n8n reruns this when the token expires. */
	async preAuthentication(
		this: IHttpRequestHelper,
		credentials: ICredentialDataDecryptedObject,
	): Promise<IDataObject> {
		const environment = (credentials.environment as string) || 'demo';
		const assertion = buildDocuSignJwtAssertion(credentials);
		const response = (await this.helpers.httpRequest({
			method: 'POST',
			url: `https://${DOCUSIGN_JWT_AUTH_HOSTS[environment]}/oauth/token`,
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
				assertion,
			}).toString(),
			json: true,
		})) as { access_token?: string };
		if (!response?.access_token) {
			throw new Error('DocuSign did not return an access token for the JWT grant. Check consent and the private key.');
		}
		return { accessToken: response.access_token };
	}

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL:
				'={{$credentials.environment === "production" ? "https://account.docusign.com" : "https://account-d.docusign.com"}}',
			url: '/oauth/userinfo',
			method: 'GET',
		},
	};
}
