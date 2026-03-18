/**
 * Phase 3 handler tests — Account Administration resources.
 * Targets 100% statements, branches, functions, lines.
 */
import { describe, it, expect } from '@jest/globals';
import { createMockContext } from './helpers/mockContext';

import { handleAccount } from '../nodes/DocuSign/resources/account/account.handler';
import { handleAccountBrand } from '../nodes/DocuSign/resources/accountBrand/accountBrand.handler';
import { handleAccountPermissionProfile } from '../nodes/DocuSign/resources/accountPermissionProfile/accountPermissionProfile.handler';
import { handleAccountCustomField } from '../nodes/DocuSign/resources/accountCustomField/accountCustomField.handler';
import { handleAccountTabSetting } from '../nodes/DocuSign/resources/accountTabSetting/accountTabSetting.handler';
import { handleAccountConsumerDisclosure } from '../nodes/DocuSign/resources/accountConsumerDisclosure/accountConsumerDisclosure.handler';
import { handleAccountPasswordRule } from '../nodes/DocuSign/resources/accountPasswordRule/accountPasswordRule.handler';
import { handleAccountWatermark } from '../nodes/DocuSign/resources/accountWatermark/accountWatermark.handler';

const P = { accountId: { 0: 'acct-1' } };
const C = { docuSignOAuth2Api: { environment: 'demo' } };

// ==================================================================
// Account
// ==================================================================
describe('handleAccount', () => {
	it('get', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{ accountId: 'acct-1' }] });
		const r = await handleAccount(ctx, 'get', 0) as { accountId: string };
		expect(r.accountId).toBe('acct-1');
	});

	it('getBillingCharges', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{ billingChargeItems: [] }] });
		await handleAccount(ctx, 'getBillingCharges', 0);
	});

	it('getEnvelopePurgeConfiguration', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] });
		await handleAccount(ctx, 'getEnvelopePurgeConfiguration', 0);
	});

	it('getNotificationDefaults', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] });
		await handleAccount(ctx, 'getNotificationDefaults', 0);
	});

	it('listRecipientNamesByEmail', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, email: { 0: 'test@example.com' } }, httpResponses: [{ recipientNames: [] }] });
		await handleAccount(ctx, 'listRecipientNamesByEmail', 0);
	});

	it('listSettings', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] });
		await handleAccount(ctx, 'listSettings', 0);
	});

	it('listSharedAccess', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] });
		await handleAccount(ctx, 'listSharedAccess', 0);
	});

	it('listSupportedLanguages', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] });
		await handleAccount(ctx, 'listSupportedLanguages', 0);
	});

	it('listUnsupportedFileTypes', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] });
		await handleAccount(ctx, 'listUnsupportedFileTypes', 0);
	});

	it('updateEnvelopePurgeConfiguration', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, purgeConfiguration: { 0: '{"purgeEnvelopes":"false"}' } }, httpResponses: [{}] });
		await handleAccount(ctx, 'updateEnvelopePurgeConfiguration', 0);
	});

	it('updateEnvelopePurgeConfiguration — invalid JSON', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, purgeConfiguration: { 0: 'bad' } } });
		await expect(handleAccount(ctx, 'updateEnvelopePurgeConfiguration', 0)).rejects.toThrow();
	});

	it('updateNotificationDefaults', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, notificationDefaults: { 0: '{}' } }, httpResponses: [{}] });
		await handleAccount(ctx, 'updateNotificationDefaults', 0);
	});

	it('updateNotificationDefaults — invalid JSON', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, notificationDefaults: { 0: '{bad' } } });
		await expect(handleAccount(ctx, 'updateNotificationDefaults', 0)).rejects.toThrow();
	});

	it('updateSettings', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, settings: { 0: '{"useNewDocuSignExperience":"true"}' } }, httpResponses: [{}] });
		await handleAccount(ctx, 'updateSettings', 0);
	});

	it('updateSettings — invalid JSON', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, settings: { 0: 'x' } } });
		await expect(handleAccount(ctx, 'updateSettings', 0)).rejects.toThrow();
	});

	it('updateSharedAccess', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, sharedAccess: { 0: '{"sharedAccess":[]}' } }, httpResponses: [{}] });
		await handleAccount(ctx, 'updateSharedAccess', 0);
	});

	it('updateSharedAccess — invalid JSON', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, sharedAccess: { 0: 'nope' } } });
		await expect(handleAccount(ctx, 'updateSharedAccess', 0)).rejects.toThrow();
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P });
		await expect(handleAccount(ctx, 'purge', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Account Brand
// ==================================================================
describe('handleAccountBrand', () => {
	const BP = { ...P, brandId: { 0: 'brand-1' } };

	it('list', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{ brands: [] }] });
		await handleAccountBrand(ctx, 'list', 0);
	});

	it('get', async () => {
		const ctx = createMockContext({ credentials: C, parameters: BP, httpResponses: [{ brandId: 'brand-1' }] });
		await handleAccountBrand(ctx, 'get', 0);
	});

	it('create', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, brandName: { 0: 'My Brand' }, defaultBrandLanguage: { 0: 'en' }, additionalFields: { 0: { brandCompany: 'Acme Corp' } } },
			httpResponses: [{ brands: [{ brandId: 'new-brand' }] }],
		});
		await handleAccountBrand(ctx, 'create', 0);
	});

	it('create — with colors and logos JSON', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: {
				...P,
				brandName: { 0: 'Full Brand' },
				defaultBrandLanguage: { 0: 'en' },
				additionalFields: { 0: {
					brandCompany: 'Corp',
					colors: '[{"colorName":"primary","colorValue":"#FF0000"}]',
					logos: '[{"logoType":"primary","fileName":"logo.png"}]',
				} },
			},
			httpResponses: [{ brands: [{ brandId: 'b1' }] }],
		});
		await handleAccountBrand(ctx, 'create', 0);
	});

	it('update — with colors and logos', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: {
				...BP,
				additionalFields: { 0: {
					brandCompany: 'New Corp',
					colors: '[{"colorName":"secondary","colorValue":"#00FF00"}]',
					logos: '[{"logoType":"secondary"}]',
				} },
			},
			httpResponses: [{}],
		});
		await handleAccountBrand(ctx, 'update', 0);
	});

	it('create — without additional fields', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, brandName: { 0: 'Simple Brand' }, defaultBrandLanguage: { 0: 'en' }, additionalFields: { 0: {} } },
			httpResponses: [{ brands: [{ brandId: 'new' }] }],
		});
		await handleAccountBrand(ctx, 'create', 0);
	});

	it('update', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...BP, additionalFields: { 0: { brandName: 'Updated Brand', brandCompany: 'New Corp' } } },
			httpResponses: [{}],
		});
		await handleAccountBrand(ctx, 'update', 0);
	});

	it('update — empty fields', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...BP, additionalFields: { 0: {} } },
			httpResponses: [{}],
		});
		await handleAccountBrand(ctx, 'update', 0);
	});

	it('delete', async () => {
		const ctx = createMockContext({ credentials: C, parameters: BP, httpResponses: [{}] });
		await handleAccountBrand(ctx, 'delete', 0);
	});

	it('deleteList', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, brandIds: { 0: 'b1, b2, b3' } },
			httpResponses: [{}],
		});
		await handleAccountBrand(ctx, 'deleteList', 0);
	});

	it('getLogo — binary download', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...BP, logoType: { 0: 'primary' }, binaryPropertyName: { 0: 'logo' } },
			httpResponses: [Buffer.from('PNG data')],
		});
		const r = await handleAccountBrand(ctx, 'getLogo', 0) as { binary: Record<string, unknown> };
		expect(r.binary.logo).toBeDefined();
	});

	it('deleteLogo', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...BP, logoType: { 0: 'secondary' } },
			httpResponses: [{}],
		});
		await handleAccountBrand(ctx, 'deleteLogo', 0);
	});

	it('updateLogo — base64 upload', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...BP, logoType: { 0: 'email' }, uploadSource: { 0: 'base64' }, base64Content: { 0: 'iVBOR' } },
			httpResponses: [{}],
		});
		await handleAccountBrand(ctx, 'updateLogo', 0);
	});

	it('updateLogo — binary upload', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...BP, logoType: { 0: 'primary' }, uploadSource: { 0: 'binary' }, inputBinaryPropertyName: { 0: 'data' } },
			binaryData: { 0: { data: { data: 'iVBOR', mimeType: 'image/png', fileName: 'logo.png', fileSize: '100' } } },
			httpResponses: [{}],
		});
		await handleAccountBrand(ctx, 'updateLogo', 0);
	});

	it('getResource — binary download', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...BP, resourceContentType: { 0: 'signing' }, binaryPropertyName: { 0: 'resource' } },
			httpResponses: [Buffer.from('resource data')],
		});
		const r = await handleAccountBrand(ctx, 'getResource', 0) as { binary: Record<string, unknown> };
		expect(r.binary.resource).toBeDefined();
	});

	it('updateResource — binary upload', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...BP, resourceContentType: { 0: 'signing' }, uploadSource: { 0: 'binary' }, inputBinaryPropertyName: { 0: 'data' } },
			binaryData: { 0: { data: { data: 'PCFET0NUWVBF', mimeType: 'text/html', fileName: 'resource.html', fileSize: '200' } } },
			httpResponses: [{}],
		});
		await handleAccountBrand(ctx, 'updateResource', 0);
	});

	it('updateResource — base64', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...BP, resourceContentType: { 0: 'email' }, uploadSource: { 0: 'base64' }, base64Content: { 0: 'PCFET0NUWVBF' } },
			httpResponses: [{}],
		});
		await handleAccountBrand(ctx, 'updateResource', 0);
	});

	it('listResources', async () => {
		const ctx = createMockContext({ credentials: C, parameters: BP, httpResponses: [{ resources: [] }] });
		await handleAccountBrand(ctx, 'listResources', 0);
	});

	it('getExportFile — binary download', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...BP, binaryPropertyName: { 0: 'export' } },
			httpResponses: [Buffer.from('ZIP data')],
		});
		const r = await handleAccountBrand(ctx, 'getExportFile', 0) as { binary: Record<string, unknown> };
		expect(r.binary.export).toBeDefined();
	});

	it('should reject invalid logo type on deleteLogo', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...BP, logoType: { 0: 'hack' } },
		});
		await expect(handleAccountBrand(ctx, 'deleteLogo', 0)).rejects.toThrow('Invalid logo type');
	});

	it('should reject invalid logo type on updateLogo', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...BP, logoType: { 0: 'hack' }, uploadSource: { 0: 'base64' }, base64Content: { 0: 'x' } },
		});
		await expect(handleAccountBrand(ctx, 'updateLogo', 0)).rejects.toThrow('Invalid logo type');
	});

	it('should reject invalid resource type on updateResource', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...BP, resourceContentType: { 0: 'hack' }, uploadSource: { 0: 'base64' }, base64Content: { 0: 'x' } },
		});
		await expect(handleAccountBrand(ctx, 'updateResource', 0)).rejects.toThrow('Invalid resource content type');
	});

	it('should reject invalid logo type on getLogo', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...BP, logoType: { 0: 'malicious' }, binaryPropertyName: { 0: 'data' } },
		});
		await expect(handleAccountBrand(ctx, 'getLogo', 0)).rejects.toThrow('Invalid logo type');
	});

	it('should reject invalid resource type', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...BP, resourceContentType: { 0: '__proto__' }, binaryPropertyName: { 0: 'data' } },
		});
		await expect(handleAccountBrand(ctx, 'getResource', 0)).rejects.toThrow('Invalid resource content type');
	});

	it('should reject invalid brand ID', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, brandId: { 0: '../etc' } },
		});
		await expect(handleAccountBrand(ctx, 'get', 0)).rejects.toThrow('contains invalid characters');
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P });
		await expect(handleAccountBrand(ctx, 'clone', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Account Permission Profile
// ==================================================================
describe('handleAccountPermissionProfile', () => {
	const PP = { ...P, permissionProfileId: { 0: 'prof-1' } };

	it('list', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{ permissionProfiles: [] }] });
		await handleAccountPermissionProfile(ctx, 'list', 0);
	});

	it('get', async () => {
		const ctx = createMockContext({ credentials: C, parameters: PP, httpResponses: [{ permissionProfileId: 'prof-1' }] });
		await handleAccountPermissionProfile(ctx, 'get', 0);
	});

	it('create', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, permissionProfileName: { 0: 'Custom Profile' }, settings: { 0: { allowBulkSending: 'true', allowEnvelopeSending: 'true' } } },
			httpResponses: [{ permissionProfileId: 'new-prof' }],
		});
		await handleAccountPermissionProfile(ctx, 'create', 0);
	});

	it('update', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...PP, permissionProfileName: { 0: 'Updated Profile' }, settings: { 0: { allowBulkSending: 'false' } } },
			httpResponses: [{}],
		});
		await handleAccountPermissionProfile(ctx, 'update', 0);
	});

	it('update — with empty settings', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...PP, permissionProfileName: { 0: '' }, settings: { 0: {} } },
			httpResponses: [{}],
		});
		await handleAccountPermissionProfile(ctx, 'update', 0);
	});

	it('delete', async () => {
		const ctx = createMockContext({ credentials: C, parameters: PP, httpResponses: [{}] });
		await handleAccountPermissionProfile(ctx, 'delete', 0);
	});

	it('should reject invalid profile ID', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, permissionProfileId: { 0: 'a/b' } } });
		await expect(handleAccountPermissionProfile(ctx, 'get', 0)).rejects.toThrow('contains invalid characters');
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P });
		await expect(handleAccountPermissionProfile(ctx, 'clone', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Account Custom Field
// ==================================================================
describe('handleAccountCustomField', () => {
	it('list', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{ textCustomFields: [] }] });
		await handleAccountCustomField(ctx, 'list', 0);
	});

	it('create — text field', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, fieldType: { 0: 'text' }, name: { 0: 'PO Number' }, additionalFields: { 0: { required: 'true', show: 'true', value: '12345' } } },
			httpResponses: [{}],
		});
		await handleAccountCustomField(ctx, 'create', 0);
	});

	it('create — list field with items', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, fieldType: { 0: 'list' }, name: { 0: 'Department' }, additionalFields: { 0: { listItems: 'Sales;Marketing;Engineering', value: 'Sales' } } },
			httpResponses: [{}],
		});
		await handleAccountCustomField(ctx, 'create', 0);
	});

	it('create — minimal fields', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, fieldType: { 0: 'text' }, name: { 0: 'Simple' }, additionalFields: { 0: {} } },
			httpResponses: [{}],
		});
		await handleAccountCustomField(ctx, 'create', 0);
	});

	it('update', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, customFieldId: { 0: 'cf-1' }, fieldType: { 0: 'text' }, name: { 0: 'Updated' }, additionalFields: { 0: { value: 'new-val' } } },
			httpResponses: [{}],
		});
		await handleAccountCustomField(ctx, 'update', 0);
	});

	it('delete', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, customFieldId: { 0: 'cf-1' } },
			httpResponses: [{}],
		});
		await handleAccountCustomField(ctx, 'delete', 0);
	});

	it('should reject invalid field ID', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, customFieldId: { 0: '../x' } } });
		await expect(handleAccountCustomField(ctx, 'delete', 0)).rejects.toThrow('contains invalid characters');
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P });
		await expect(handleAccountCustomField(ctx, 'clone', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Account Tab Setting
// ==================================================================
describe('handleAccountTabSetting', () => {
	it('get', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{ tabSettings: {} }] });
		await handleAccountTabSetting(ctx, 'get', 0);
	});

	it('update', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, tabSettings: { 0: { allowTabOrder: 'true', tabLockingEnabled: 'true' } } },
			httpResponses: [{}],
		});
		await handleAccountTabSetting(ctx, 'update', 0);
	});

	it('update — empty settings', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, tabSettings: { 0: {} } },
			httpResponses: [{}],
		});
		await handleAccountTabSetting(ctx, 'update', 0);
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P });
		await expect(handleAccountTabSetting(ctx, 'clone', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Account Consumer Disclosure
// ==================================================================
describe('handleAccountConsumerDisclosure', () => {
	it('getDefault', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{ accountEsignId: 'abc' }] });
		await handleAccountConsumerDisclosure(ctx, 'getDefault', 0);
	});

	it('get — by language', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, langCode: { 0: 'en' } },
			httpResponses: [{ accountEsignId: 'abc' }],
		});
		await handleAccountConsumerDisclosure(ctx, 'get', 0);
	});

	it('update', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, langCode: { 0: 'en' }, disclosureData: { 0: '{"esignAgreementText":"Updated text"}' } },
			httpResponses: [{}],
		});
		await handleAccountConsumerDisclosure(ctx, 'update', 0);
	});

	it('update — invalid JSON', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, langCode: { 0: 'en' }, disclosureData: { 0: 'bad' } },
		});
		await expect(handleAccountConsumerDisclosure(ctx, 'update', 0)).rejects.toThrow();
	});

	it('should reject invalid lang code', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, langCode: { 0: '../x' } } });
		await expect(handleAccountConsumerDisclosure(ctx, 'get', 0)).rejects.toThrow('contains invalid characters');
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P });
		await expect(handleAccountConsumerDisclosure(ctx, 'clone', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Account Password Rule
// ==================================================================
describe('handleAccountPasswordRule', () => {
	it('get', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{ minimumPasswordLength: '8' }] });
		await handleAccountPasswordRule(ctx, 'get', 0);
	});

	it('getForUser', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, userId: { 0: 'user-1' } },
			httpResponses: [{}],
		});
		await handleAccountPasswordRule(ctx, 'getForUser', 0);
	});

	it('update', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, passwordRules: { 0: '{"minimumPasswordLength":"10"}' } },
			httpResponses: [{}],
		});
		await handleAccountPasswordRule(ctx, 'update', 0);
	});

	it('update — invalid JSON', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, passwordRules: { 0: 'bad' } },
		});
		await expect(handleAccountPasswordRule(ctx, 'update', 0)).rejects.toThrow();
	});

	it('should reject invalid user ID', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, userId: { 0: 'u/x' } } });
		await expect(handleAccountPasswordRule(ctx, 'getForUser', 0)).rejects.toThrow('contains invalid characters');
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P });
		await expect(handleAccountPasswordRule(ctx, 'clone', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Account Watermark
// ==================================================================
describe('handleAccountWatermark', () => {
	it('get', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{ enabled: 'false' }] });
		await handleAccountWatermark(ctx, 'get', 0);
	});

	it('preview', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, watermarkSettings: { 0: { watermarkText: 'DRAFT', enabled: 'true', font: 'Arial', fontSize: 'size48', fontColor: '#FF0000', displayAngle: '-45', transparency: '0.5' } } },
			httpResponses: [{}],
		});
		await handleAccountWatermark(ctx, 'preview', 0);
	});

	it('update', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, watermarkSettings: { 0: { watermarkText: 'CONFIDENTIAL', enabled: 'true' } } },
			httpResponses: [{}],
		});
		await handleAccountWatermark(ctx, 'update', 0);
	});

	it('update — empty settings', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, watermarkSettings: { 0: {} } },
			httpResponses: [{}],
		});
		await handleAccountWatermark(ctx, 'update', 0);
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P });
		await expect(handleAccountWatermark(ctx, 'clone', 0)).rejects.toThrow('Unsupported');
	});
});
