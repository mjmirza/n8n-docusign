/**
 * Phase 4 handler tests — Users & Groups resources.
 * Covers all operations, security (ID validation, allowlists), error handling, and edge cases.
 */
import { describe, it, expect } from '@jest/globals';
import { createMockContext } from './helpers/mockContext';

import { handleUser } from '../nodes/DocuSign/resources/user/user.handler';
import { handleUserProfile } from '../nodes/DocuSign/resources/userProfile/userProfile.handler';
import { handleUserCustomSetting } from '../nodes/DocuSign/resources/userCustomSetting/userCustomSetting.handler';
import { handleUserSignature } from '../nodes/DocuSign/resources/userSignature/userSignature.handler';
import { handleGroup } from '../nodes/DocuSign/resources/group/group.handler';
import { handleGroupUser } from '../nodes/DocuSign/resources/groupUser/groupUser.handler';
import { handleGroupBrand } from '../nodes/DocuSign/resources/groupBrand/groupBrand.handler';
import { handleUserContact } from '../nodes/DocuSign/resources/userContact/userContact.handler';
import { handleAuthorization } from '../nodes/DocuSign/resources/authorization/authorization.handler';

const C = { docuSignOAuth2Api: { environment: 'demo' } };
const P = { accountId: { 0: 'acct-1' } };
const UP = { ...P, userId: { 0: 'user-1' } };

// ==================================================================
// User
// ==================================================================
describe('handleUser', () => {
	it('list', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, filters: { 0: { status: 'active', email: 'a@b.com' } }, maxResults: { 0: 50 } }, httpResponses: [{ users: [], totalSetSize: '0', resultSetSize: '0' }] });
		await handleUser(ctx, 'list', 0);
	});

	it('get', async () => {
		const ctx = createMockContext({ credentials: C, parameters: UP, httpResponses: [{ userId: 'user-1' }] });
		await handleUser(ctx, 'get', 0);
	});

	it('create', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, email: { 0: 'new@test.com' }, userName: { 0: 'New User' }, createFields: { 0: { firstName: 'New', lastName: 'User', company: 'Acme', title: 'Eng', jobTitle: 'Dev', sendActivationEmail: 'true' } } },
			httpResponses: [{ newUsers: [{ userId: 'new-user' }] }],
		});
		await handleUser(ctx, 'create', 0);
	});

	it('create — with userSettings and all fields', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, email: { 0: 'full@test.com' }, userName: { 0: 'Full User' }, createFields: { 0: { firstName: 'Full', lastName: 'User', middleName: 'M', suffixName: 'Jr', company: 'Acme', title: 'Mr', jobTitle: 'Dev', groupId: 'g1', sendActivationEmail: 'true', userSettings: '{"canSend":"true"}' } } },
			httpResponses: [{ newUsers: [{ userId: 'full-user' }] }],
		});
		await handleUser(ctx, 'create', 0);
	});

	it('create — minimal fields', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, email: { 0: 'min@test.com' }, userName: { 0: 'Min User' }, createFields: { 0: {} } },
			httpResponses: [{ newUsers: [{ userId: 'min-user' }] }],
		});
		await handleUser(ctx, 'create', 0);
	});

	it('update', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...UP, updateBody: { 0: '{"firstName":"Updated","lastName":"Name"}' } },
			httpResponses: [{}],
		});
		await handleUser(ctx, 'update', 0);
	});

	it('delete', async () => {
		const ctx = createMockContext({ credentials: C, parameters: UP, httpResponses: [{}] });
		await handleUser(ctx, 'delete', 0);
	});

	it('getSettings', async () => {
		const ctx = createMockContext({ credentials: C, parameters: UP, httpResponses: [{}] });
		await handleUser(ctx, 'getSettings', 0);
	});

	it('updateSettings', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...UP, settingsBody: { 0: '{"canSendEnvelope":"true"}' } },
			httpResponses: [{}],
		});
		await handleUser(ctx, 'updateSettings', 0);
	});

	it('updateSettings — invalid JSON', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...UP, settingsBody: { 0: 'bad' } } });
		await expect(handleUser(ctx, 'updateSettings', 0)).rejects.toThrow();
	});

	it('getProfileImage — binary download', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...UP, binaryPropertyName: { 0: 'image' } },
			httpResponses: [Buffer.from('PNG image data')],
		});
		const r = await handleUser(ctx, 'getProfileImage', 0) as { binary: Record<string, unknown> };
		expect(r.binary.image).toBeDefined();
	});

	it('updateProfileImage — binary upload', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...UP, uploadSource: { 0: 'binary' }, inputBinaryPropertyName: { 0: 'data' } },
			binaryData: { 0: { data: { data: 'iVBOR', mimeType: 'image/png', fileName: 'photo.png', fileSize: '100' } } },
			httpResponses: [{}],
		});
		await handleUser(ctx, 'updateProfileImage', 0);
	});

	it('updateProfileImage — base64 upload', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...UP, uploadSource: { 0: 'base64' }, base64Content: { 0: 'iVBOR' } },
			httpResponses: [{}],
		});
		await handleUser(ctx, 'updateProfileImage', 0);
	});

	it('deleteProfileImage', async () => {
		const ctx = createMockContext({ credentials: C, parameters: UP, httpResponses: [{}] });
		await handleUser(ctx, 'deleteProfileImage', 0);
	});

	it('updateList', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, usersBody: { 0: '[{"userId":"u1","firstName":"Updated"}]' } },
			httpResponses: [{}],
		});
		await handleUser(ctx, 'updateList', 0);
	});

	it('updateList — invalid JSON', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, usersBody: { 0: 'bad' } } });
		await expect(handleUser(ctx, 'updateList', 0)).rejects.toThrow();
	});

	it('rejects invalid userId', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, userId: { 0: '../admin' } } });
		await expect(handleUser(ctx, 'get', 0)).rejects.toThrow('contains invalid characters');
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P });
		await expect(handleUser(ctx, 'purge', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// User Profile
// ==================================================================
describe('handleUserProfile', () => {
	it('get', async () => {
		const ctx = createMockContext({ credentials: C, parameters: UP, httpResponses: [{ company: 'Acme' }] });
		await handleUserProfile(ctx, 'get', 0);
	});

	it('update — with address and userDetails', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...UP, additionalFields: { 0: { company: 'New Corp', title: 'CTO', street1: '123 Main St', city: 'NYC', state: 'NY', zip: '10001', country: 'US', phone: '555-1234', fax: '555-5678', userDetails: '{"customField":"value"}' } } },
			httpResponses: [{}],
		});
		await handleUserProfile(ctx, 'update', 0);
	});

	it('update — minimal', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...UP, additionalFields: { 0: {} } },
			httpResponses: [{}],
		});
		await handleUserProfile(ctx, 'update', 0);
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: UP });
		await expect(handleUserProfile(ctx, 'delete', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// User Custom Setting
// ==================================================================
describe('handleUserCustomSetting', () => {
	it('list', async () => {
		const ctx = createMockContext({ credentials: C, parameters: UP, httpResponses: [{ customSettings: [] }] });
		await handleUserCustomSetting(ctx, 'list', 0);
	});

	it('update', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...UP, customSettings: { 0: '{"key1":"value1"}' } },
			httpResponses: [{}],
		});
		await handleUserCustomSetting(ctx, 'update', 0);
	});

	it('update — invalid JSON', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...UP, customSettings: { 0: 'bad' } } });
		await expect(handleUserCustomSetting(ctx, 'update', 0)).rejects.toThrow();
	});

	it('delete', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...UP, customSettings: { 0: '{"key1":""}' } },
			httpResponses: [{}],
		});
		await handleUserCustomSetting(ctx, 'delete', 0);
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: UP });
		await expect(handleUserCustomSetting(ctx, 'merge', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// User Signature
// ==================================================================
describe('handleUserSignature', () => {
	const SP = { ...UP, signatureId: { 0: 'sig-1' } };

	it('list', async () => {
		const ctx = createMockContext({ credentials: C, parameters: UP, httpResponses: [{ userSignatures: [] }] });
		await handleUserSignature(ctx, 'list', 0);
	});

	it('get', async () => {
		const ctx = createMockContext({ credentials: C, parameters: SP, httpResponses: [{ signatureId: 'sig-1' }] });
		await handleUserSignature(ctx, 'get', 0);
	});

	it('create', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...UP, signatureBody: { 0: '{"signatureName":"My Signature"}' } },
			httpResponses: [{}],
		});
		await handleUserSignature(ctx, 'create', 0);
	});

	it('create — invalid JSON', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...UP, signatureBody: { 0: 'bad' } } });
		await expect(handleUserSignature(ctx, 'create', 0)).rejects.toThrow();
	});

	it('update', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...SP, updateBody: { 0: '{"signatureName":"Updated"}' } },
			httpResponses: [{}],
		});
		await handleUserSignature(ctx, 'update', 0);
	});

	it('delete', async () => {
		const ctx = createMockContext({ credentials: C, parameters: SP, httpResponses: [{}] });
		await handleUserSignature(ctx, 'delete', 0);
	});

	it('getImage — signature_image download', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...SP, imageType: { 0: 'signature_image' }, binaryPropertyName: { 0: 'sig' } },
			httpResponses: [Buffer.from('sig image')],
		});
		const r = await handleUserSignature(ctx, 'getImage', 0) as { binary: Record<string, unknown> };
		expect(r.binary.sig).toBeDefined();
	});

	it('getImage — initials_image download', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...SP, imageType: { 0: 'initials_image' }, binaryPropertyName: { 0: 'ini' } },
			httpResponses: [Buffer.from('initials image')],
		});
		await handleUserSignature(ctx, 'getImage', 0);
	});

	it('updateImage — binary upload', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...SP, imageType: { 0: 'signature_image' }, uploadSource: { 0: 'binary' }, inputBinaryPropertyName: { 0: 'data' } },
			binaryData: { 0: { data: { data: 'iVBOR', mimeType: 'image/png', fileName: 'sig.png', fileSize: '100' } } },
			httpResponses: [{}],
		});
		await handleUserSignature(ctx, 'updateImage', 0);
	});

	it('updateImage — base64 upload', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...SP, imageType: { 0: 'initials_image' }, uploadSource: { 0: 'base64' }, base64Content: { 0: 'iVBOR' } },
			httpResponses: [{}],
		});
		await handleUserSignature(ctx, 'updateImage', 0);
	});

	it('deleteImage', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...SP, imageType: { 0: 'signature_image' } },
			httpResponses: [{}],
		});
		await handleUserSignature(ctx, 'deleteImage', 0);
	});

	it('updateList', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...UP, signaturesBody: { 0: '[{"signatureId":"s1","signatureName":"Updated"}]' } },
			httpResponses: [{}],
		});
		await handleUserSignature(ctx, 'updateList', 0);
	});

	it('rejects invalid imageType on deleteImage', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...SP, imageType: { 0: 'evil_type' } },
		});
		await expect(handleUserSignature(ctx, 'deleteImage', 0)).rejects.toThrow('Invalid image type');
	});

	it('rejects invalid imageType on updateImage', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...SP, imageType: { 0: 'evil_type' }, uploadSource: { 0: 'base64' }, base64Content: { 0: 'x' } },
		});
		await expect(handleUserSignature(ctx, 'updateImage', 0)).rejects.toThrow('Invalid image type');
	});

	it('rejects invalid imageType on getImage', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...SP, imageType: { 0: '__proto__' }, binaryPropertyName: { 0: 'data' } },
		});
		await expect(handleUserSignature(ctx, 'getImage', 0)).rejects.toThrow('Invalid image type');
	});

	it('rejects invalid signatureId', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...UP, signatureId: { 0: '../hack' } } });
		await expect(handleUserSignature(ctx, 'get', 0)).rejects.toThrow('contains invalid characters');
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: UP });
		await expect(handleUserSignature(ctx, 'clone', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Group
// ==================================================================
describe('handleGroup', () => {
	it('list', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{ groups: [] }] });
		await handleGroup(ctx, 'list', 0);
	});

	it('create', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, groupName: { 0: 'New Group' }, additionalFields: { 0: { permissionProfileId: 'prof-1' } } },
			httpResponses: [{ groups: [{ groupId: 'g1' }] }],
		});
		await handleGroup(ctx, 'create', 0);
	});

	it('create — minimal', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, groupName: { 0: 'Simple Group' }, additionalFields: { 0: {} } },
			httpResponses: [{}],
		});
		await handleGroup(ctx, 'create', 0);
	});

	it('update', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, groupId: { 0: 'g1' }, updateGroupName: { 0: 'Updated Group' } },
			httpResponses: [{}],
		});
		await handleGroup(ctx, 'update', 0);
	});

	it('delete', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, groupId: { 0: 'g1' } },
			httpResponses: [{}],
		});
		await handleGroup(ctx, 'delete', 0);
	});

	it('rejects invalid groupId', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, groupId: { 0: '../etc' } } });
		await expect(handleGroup(ctx, 'delete', 0)).rejects.toThrow('contains invalid characters');
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P });
		await expect(handleGroup(ctx, 'merge', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Group User
// ==================================================================
describe('handleGroupUser', () => {
	const GP = { ...P, groupId: { 0: 'g1' } };

	it('list', async () => {
		const ctx = createMockContext({ credentials: C, parameters: GP, httpResponses: [{ users: [] }] });
		await handleGroupUser(ctx, 'list', 0);
	});

	it('update — add user', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...GP, userId: { 0: 'u1' }, additionalFields: { 0: { userName: 'Test User', email: 'test@test.com' } } },
			httpResponses: [{}],
		});
		await handleGroupUser(ctx, 'update', 0);
	});

	it('delete — remove user', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...GP, userId: { 0: 'u1' } },
			httpResponses: [{}],
		});
		await handleGroupUser(ctx, 'delete', 0);
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: GP });
		await expect(handleGroupUser(ctx, 'create', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Group Brand
// ==================================================================
describe('handleGroupBrand', () => {
	const GP = { ...P, groupId: { 0: 'g1' } };

	it('get', async () => {
		const ctx = createMockContext({ credentials: C, parameters: GP, httpResponses: [{ brands: [] }] });
		await handleGroupBrand(ctx, 'get', 0);
	});

	it('update', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...GP, brandId: { 0: 'b1' } },
			httpResponses: [{}],
		});
		await handleGroupBrand(ctx, 'update', 0);
	});

	it('delete', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...GP, brandId: { 0: 'b1' } },
			httpResponses: [{}],
		});
		await handleGroupBrand(ctx, 'delete', 0);
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: GP });
		await expect(handleGroupBrand(ctx, 'create', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// User Contact
// ==================================================================
describe('handleUserContact', () => {
	it('get', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, contactId: { 0: 'contact-1' } },
			httpResponses: [{ contactId: 'contact-1' }],
		});
		await handleUserContact(ctx, 'get', 0);
	});

	it('create', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, name: { 0: 'John Doe' }, additionalFields: { 0: { emails: '["john@test.com"]', organization: 'Acme', contactPhoneNumbers: '[{"phoneNumber":"555-1234"}]', signingGroup: 'sg1', signingGroupName: 'SG', shared: 'true' } } },
			httpResponses: [{}],
		});
		await handleUserContact(ctx, 'create', 0);
	});

	it('create — minimal', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, name: { 0: 'Min Contact' }, additionalFields: { 0: {} } },
			httpResponses: [{}],
		});
		await handleUserContact(ctx, 'create', 0);
	});

	it('update', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, contactsBody: { 0: '[{"contactId":"c1","name":"Updated"}]' } },
			httpResponses: [{}],
		});
		await handleUserContact(ctx, 'update', 0);
	});

	it('delete', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, contactId: { 0: 'c1' } },
			httpResponses: [{}],
		});
		await handleUserContact(ctx, 'delete', 0);
	});

	it('deleteList', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...P, contactIds: { 0: 'c1, c2' } },
			httpResponses: [{}],
		});
		await handleUserContact(ctx, 'deleteList', 0);
	});

	it('rejects invalid contactId', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, contactId: { 0: '../etc' } } });
		await expect(handleUserContact(ctx, 'get', 0)).rejects.toThrow('contains invalid characters');
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P });
		await expect(handleUserContact(ctx, 'merge', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Authorization
// ==================================================================
describe('handleAuthorization', () => {
	const AP = { ...UP, authorizationId: { 0: 'auth-1' } };

	it('getUserAuthorization', async () => {
		const ctx = createMockContext({ credentials: C, parameters: AP, httpResponses: [{ authorizationId: 'auth-1' }] });
		await handleAuthorization(ctx, 'getUserAuthorization', 0);
	});

	it('getAgentUserAuthorizations', async () => {
		const ctx = createMockContext({ credentials: C, parameters: UP, httpResponses: [{ authorizations: [] }] });
		await handleAuthorization(ctx, 'getAgentUserAuthorizations', 0);
	});

	it('getPrincipalUserAuthorizations', async () => {
		const ctx = createMockContext({ credentials: C, parameters: UP, httpResponses: [{ authorizations: [] }] });
		await handleAuthorization(ctx, 'getPrincipalUserAuthorizations', 0);
	});

	it('createUserAuthorization', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...UP, agentUserId: { 0: 'agent-1' }, permission: { 0: 'manage' }, additionalFields: { 0: { startDate: '2024-01-01', endDate: '2025-12-31', agentAccountId: 'acct-2' } } },
			httpResponses: [{ authorizationId: 'new-auth' }],
		});
		await handleAuthorization(ctx, 'createUserAuthorization', 0);
	});

	it('createUserAuthorization — minimal', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...UP, agentUserId: { 0: 'agent-1' }, permission: { 0: 'sign' }, additionalFields: { 0: {} } },
			httpResponses: [{}],
		});
		await handleAuthorization(ctx, 'createUserAuthorization', 0);
	});

	it('createUserAuthorizations — batch', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...UP, authorizationsBody: { 0: '[{"agentUser":{"userId":"a1"},"permission":"sign"}]' } },
			httpResponses: [{}],
		});
		await handleAuthorization(ctx, 'createUserAuthorizations', 0);
	});

	it('updateUserAuthorization', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...AP, updateBody: { 0: '{"permission":"sign","endDate":"2025-12-31"}' } },
			httpResponses: [{}],
		});
		await handleAuthorization(ctx, 'updateUserAuthorization', 0);
	});

	it('deleteUserAuthorization', async () => {
		const ctx = createMockContext({ credentials: C, parameters: AP, httpResponses: [{}] });
		await handleAuthorization(ctx, 'deleteUserAuthorization', 0);
	});

	it('deleteUserAuthorizations — batch', async () => {
		const ctx = createMockContext({
			credentials: C,
			parameters: { ...UP, deleteAuthorizationsBody: { 0: '{"authorizations":[{"authorizationId":"auth-1"}]}' } },
			httpResponses: [{}],
		});
		await handleAuthorization(ctx, 'deleteUserAuthorizations', 0);
	});

	it('rejects invalid authorizationId', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...UP, authorizationId: { 0: '../hack' } } });
		await expect(handleAuthorization(ctx, 'getUserAuthorization', 0)).rejects.toThrow('contains invalid characters');
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: UP });
		await expect(handleAuthorization(ctx, 'clone', 0)).rejects.toThrow('Unsupported');
	});
});
