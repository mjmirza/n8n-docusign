import type { Icon, ICredentialType, INodeProperties } from 'n8n-workflow';

/** Holds the DocuSign Connect HMAC key encrypted, so it never travels in workflow exports. */
export class DocuSignConnectHmacApi implements ICredentialType {
	name = 'docuSignConnectHmacApi';
	displayName = 'DocuSign Connect HMAC API';
	icon: Icon = {
		light: 'file:../nodes/DocuSign/docusign.light.svg',
		dark: 'file:../nodes/DocuSign/docusign.dark.svg',
	};
	documentationUrl = 'https://developers.docusign.com/platform/webhooks/connect/hmac/';

	properties: INodeProperties[] = [
		{
			displayName: 'HMAC Secret',
			name: 'hmacSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'The key from DocuSign Admin > Connect > Connect Keys. Separate two keys with a comma while you rotate.',
		},
	];
}
