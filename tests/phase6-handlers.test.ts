import { describe, it, expect } from '@jest/globals';
import { createMockContext } from './helpers/mockContext';
import { handleAccountSignature } from '../nodes/DocuSign/resources/accountSignature/accountSignature.handler';
import { handleAccountSealProvider } from '../nodes/DocuSign/resources/accountSealProvider/accountSealProvider.handler';
import { handleAccountSignatureProvider } from '../nodes/DocuSign/resources/accountSignatureProvider/accountSignatureProvider.handler';
import { handleENoteConfiguration } from '../nodes/DocuSign/resources/eNoteConfiguration/eNoteConfiguration.handler';
import { handleFavoriteTemplate } from '../nodes/DocuSign/resources/favoriteTemplate/favoriteTemplate.handler';
import { handleIdentityVerification } from '../nodes/DocuSign/resources/identityVerification/identityVerification.handler';
import { handleSigningGroup } from '../nodes/DocuSign/resources/signingGroup/signingGroup.handler';
import { handleSigningGroupUser } from '../nodes/DocuSign/resources/signingGroupUser/signingGroupUser.handler';
import { handleCustomTab } from '../nodes/DocuSign/resources/customTab/customTab.handler';

const C = { docuSignOAuth2Api: { environment: 'demo' } };
const P = { accountId: { 0: 'acct-1' } };

describe('handleAccountSignature', () => {
	const SP = { ...P, signatureId: { 0: 'sig-1' } };
	it('list', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleAccountSignature(ctx, 'list', 0); });
	it('get', async () => { const ctx = createMockContext({ credentials: C, parameters: SP, httpResponses: [{}] }); await handleAccountSignature(ctx, 'get', 0); });
	it('create', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: '{"signatureName":"Test"}' } }, httpResponses: [{}] }); await handleAccountSignature(ctx, 'create', 0); });
	it('create — invalid JSON', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: 'bad' } } }); await expect(handleAccountSignature(ctx, 'create', 0)).rejects.toThrow(); });
	it('update', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: '{}' } }, httpResponses: [{}] }); await handleAccountSignature(ctx, 'update', 0); });
	it('updateById', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...SP, requestBody: { 0: '{}' } }, httpResponses: [{}] }); await handleAccountSignature(ctx, 'updateById', 0); });
	it('delete', async () => { const ctx = createMockContext({ credentials: C, parameters: SP, httpResponses: [{}] }); await handleAccountSignature(ctx, 'delete', 0); });
	it('getImage — signature_image', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...SP, imageType: { 0: 'signature_image' }, binaryPropertyName: { 0: 'sig' } }, httpResponses: [Buffer.from('img')] });
		const r = await handleAccountSignature(ctx, 'getImage', 0) as { binary: Record<string, unknown> }; expect(r.binary.sig).toBeDefined();
	});
	it('getImage — initials_image', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...SP, imageType: { 0: 'initials_image' }, binaryPropertyName: { 0: 'ini' } }, httpResponses: [Buffer.from('img')] });
		await handleAccountSignature(ctx, 'getImage', 0);
	});
	it('updateImage — base64', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...SP, imageType: { 0: 'signature_image' }, uploadSource: { 0: 'base64' }, base64Content: { 0: 'iVBOR' } }, httpResponses: [{}] }); await handleAccountSignature(ctx, 'updateImage', 0); });
	it('updateImage — binary', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...SP, imageType: { 0: 'initials_image' }, uploadSource: { 0: 'binary' }, inputBinaryPropertyName: { 0: 'data' } }, binaryData: { 0: { data: { data: 'iVBOR', mimeType: 'image/png', fileName: 'sig.png', fileSize: '100' } } }, httpResponses: [{}] });
		await handleAccountSignature(ctx, 'updateImage', 0);
	});
	it('deleteImage', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...SP, imageType: { 0: 'signature_image' } }, httpResponses: [{}] }); await handleAccountSignature(ctx, 'deleteImage', 0); });
	it('rejects invalid imageType', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...SP, imageType: { 0: '__proto__' }, binaryPropertyName: { 0: 'd' } } }); await expect(handleAccountSignature(ctx, 'getImage', 0)).rejects.toThrow('Invalid image type'); });
	it('rejects invalid imageType on update', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...SP, imageType: { 0: 'hack' }, uploadSource: { 0: 'base64' }, base64Content: { 0: 'x' } } }); await expect(handleAccountSignature(ctx, 'updateImage', 0)).rejects.toThrow('Invalid image type'); });
	it('rejects invalid imageType on delete', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...SP, imageType: { 0: 'hack' } } }); await expect(handleAccountSignature(ctx, 'deleteImage', 0)).rejects.toThrow('Invalid image type'); });
	it('rejects invalid signatureId', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, signatureId: { 0: '../x' } } }); await expect(handleAccountSignature(ctx, 'get', 0)).rejects.toThrow('contains invalid characters'); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handleAccountSignature(ctx, 'clone', 0)).rejects.toThrow('Unsupported'); });
});

describe('handleAccountSealProvider', () => {
	it('list', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleAccountSealProvider(ctx, 'list', 0); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handleAccountSealProvider(ctx, 'create', 0)).rejects.toThrow('Unsupported'); });
});

describe('handleAccountSignatureProvider', () => {
	it('list', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleAccountSignatureProvider(ctx, 'list', 0); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handleAccountSignatureProvider(ctx, 'create', 0)).rejects.toThrow('Unsupported'); });
});

describe('handleENoteConfiguration', () => {
	it('get', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleENoteConfiguration(ctx, 'get', 0); });
	it('update', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: '{"eNoteEnabled":"true"}' } }, httpResponses: [{}] }); await handleENoteConfiguration(ctx, 'update', 0); });
	it('update — invalid JSON', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: 'bad' } } }); await expect(handleENoteConfiguration(ctx, 'update', 0)).rejects.toThrow(); });
	it('delete', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleENoteConfiguration(ctx, 'delete', 0); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handleENoteConfiguration(ctx, 'create', 0)).rejects.toThrow('Unsupported'); });
});

describe('handleFavoriteTemplate', () => {
	it('get', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleFavoriteTemplate(ctx, 'get', 0); });
	it('update', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, templateIds: { 0: 't1, t2' } }, httpResponses: [{}] }); await handleFavoriteTemplate(ctx, 'update', 0); });
	it('unFavorite', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, templateIds: { 0: 't1' } }, httpResponses: [{}] }); await handleFavoriteTemplate(ctx, 'unFavorite', 0); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handleFavoriteTemplate(ctx, 'create', 0)).rejects.toThrow('Unsupported'); });
});

describe('handleIdentityVerification', () => {
	it('list', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleIdentityVerification(ctx, 'list', 0); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handleIdentityVerification(ctx, 'create', 0)).rejects.toThrow('Unsupported'); });
});

describe('handleSigningGroup', () => {
	const GP = { ...P, signingGroupId: { 0: 'sg-1' } };
	it('list', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleSigningGroup(ctx, 'list', 0); });
	it('get', async () => { const ctx = createMockContext({ credentials: C, parameters: GP, httpResponses: [{}] }); await handleSigningGroup(ctx, 'get', 0); });
	it('create', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: '{"groups":[{"groupName":"SG1"}]}' } }, httpResponses: [{}] }); await handleSigningGroup(ctx, 'create', 0); });
	it('create — invalid JSON', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: 'bad' } } }); await expect(handleSigningGroup(ctx, 'create', 0)).rejects.toThrow(); });
	it('update', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: '{"groups":[{"signingGroupId":"sg-1","groupName":"Updated"}]}' } }, httpResponses: [{}] }); await handleSigningGroup(ctx, 'update', 0); });
	it('delete', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: '{"groups":[{"signingGroupId":"sg-1"}]}' } }, httpResponses: [{}] }); await handleSigningGroup(ctx, 'delete', 0); });
	it('rejects invalid signingGroupId', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, signingGroupId: { 0: '../x' } } }); await expect(handleSigningGroup(ctx, 'get', 0)).rejects.toThrow('contains invalid characters'); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handleSigningGroup(ctx, 'clone', 0)).rejects.toThrow('Unsupported'); });
});

describe('handleSigningGroupUser', () => {
	const GP = { ...P, signingGroupId: { 0: 'sg-1' } };
	it('list', async () => { const ctx = createMockContext({ credentials: C, parameters: GP, httpResponses: [{}] }); await handleSigningGroupUser(ctx, 'list', 0); });
	it('update', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...GP, requestBody: { 0: '{"users":[{"email":"a@b.com"}]}' } }, httpResponses: [{}] }); await handleSigningGroupUser(ctx, 'update', 0); });
	it('delete', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...GP, requestBody: { 0: '{"users":[{"email":"a@b.com"}]}' } }, httpResponses: [{}] }); await handleSigningGroupUser(ctx, 'delete', 0); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: GP }); await expect(handleSigningGroupUser(ctx, 'create', 0)).rejects.toThrow('Unsupported'); });
});

describe('handleCustomTab', () => {
	const TP = { ...P, customTabId: { 0: 'ct-1' } };
	it('list', async () => { const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{}] }); await handleCustomTab(ctx, 'list', 0); });
	it('get', async () => { const ctx = createMockContext({ credentials: C, parameters: TP, httpResponses: [{}] }); await handleCustomTab(ctx, 'get', 0); });
	it('create', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: '{"tabLabel":"MyTab","type":"text"}' } }, httpResponses: [{}] }); await handleCustomTab(ctx, 'create', 0); });
	it('create — invalid JSON', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: 'bad' } } }); await expect(handleCustomTab(ctx, 'create', 0)).rejects.toThrow(); });
	it('update', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...TP, requestBody: { 0: '{"tabLabel":"Updated"}' } }, httpResponses: [{}] }); await handleCustomTab(ctx, 'update', 0); });
	it('delete', async () => { const ctx = createMockContext({ credentials: C, parameters: TP, httpResponses: [{}] }); await handleCustomTab(ctx, 'delete', 0); });
	it('rejects invalid customTabId', async () => { const ctx = createMockContext({ credentials: C, parameters: { ...P, customTabId: { 0: '../x' } } }); await expect(handleCustomTab(ctx, 'get', 0)).rejects.toThrow('contains invalid characters'); });
	it('unsupported', async () => { const ctx = createMockContext({ credentials: C, parameters: P }); await expect(handleCustomTab(ctx, 'clone', 0)).rejects.toThrow('Unsupported'); });
});
