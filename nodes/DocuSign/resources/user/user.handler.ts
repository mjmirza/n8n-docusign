import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';

/**
 * Handle all User operations.
 */
export async function handleUser(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/users`;

	switch (operation) {
		case 'list': {
			const qs: IDataObject = {};
			const additionalFields = ctx.getNodeParameter('additionalFields', i, {}) as IDataObject;
			if (additionalFields.status) qs.status = additionalFields.status;
			if (additionalFields.email) qs.email = additionalFields.email;
			if (additionalFields.start_position !== undefined) qs.start_position = additionalFields.start_position;
			if (additionalFields.count !== undefined) qs.count = additionalFields.count;
			return docuSignRequest(ctx, 'GET', basePath, undefined, qs);
		}

		case 'get': {
			const userId = assertSafeId(
				ctx.getNodeParameter('userId', i) as string,
				'User ID',
			);
			return docuSignRequest(ctx, 'GET', `${basePath}/${userId}`);
		}

		case 'create': {
			const email = ctx.getNodeParameter('email', i) as string;
			const userName = ctx.getNodeParameter('userName', i) as string;
			const createFields = ctx.getNodeParameter('createFields', i, {}) as IDataObject;

			const newUser: IDataObject = { email, userName };
			if (createFields.firstName) newUser.firstName = createFields.firstName;
			if (createFields.lastName) newUser.lastName = createFields.lastName;
			if (createFields.middleName) newUser.middleName = createFields.middleName;
			if (createFields.suffixName) newUser.suffixName = createFields.suffixName;
			if (createFields.title) newUser.title = createFields.title;
			if (createFields.company) newUser.company = createFields.company;
			if (createFields.jobTitle) newUser.jobTitle = createFields.jobTitle;
			if (createFields.password) newUser.password = createFields.password;
			if (createFields.activationAccessCode) newUser.activationAccessCode = createFields.activationAccessCode;
			// userInformation has no groupId; DocuSign takes the group through groupList.
			if (createFields.groupId) newUser.groupList = [{ groupId: createFields.groupId }];
			if (createFields.sendActivationEmail !== undefined) newUser.sendActivationEmail = createFields.sendActivationEmail;
			if (createFields.userSettings) {
				newUser.userSettings = JSON.parse(createFields.userSettings as string);
			}

			return docuSignRequest(ctx, 'POST', basePath, { newUsers: [newUser] } as unknown as IDataObject);
		}

		case 'update': {
			const userId = assertSafeId(
				ctx.getNodeParameter('userId', i) as string,
				'User ID',
			);
			const body = JSON.parse(
				ctx.getNodeParameter('updateBody', i) as string,
			) as IDataObject;
			return docuSignRequest(ctx, 'PUT', `${basePath}/${userId}`, body);
		}

		case 'updateList': {
			const users = JSON.parse(
				ctx.getNodeParameter('usersBody', i) as string,
			);
			return docuSignRequest(ctx, 'PUT', basePath, { users } as unknown as IDataObject);
		}

		case 'delete': {
			const userId = assertSafeId(
				ctx.getNodeParameter('userId', i) as string,
				'User ID',
			);
			return docuSignRequest(ctx, 'DELETE', basePath, { users: [{ userId }] } as unknown as IDataObject);
		}

		case 'getSettings': {
			const userId = assertSafeId(
				ctx.getNodeParameter('userId', i) as string,
				'User ID',
			);
			return docuSignRequest(ctx, 'GET', `${basePath}/${userId}/settings`);
		}

		case 'updateSettings': {
			const userId = assertSafeId(
				ctx.getNodeParameter('userId', i) as string,
				'User ID',
			);
			const body = JSON.parse(
				ctx.getNodeParameter('settingsBody', i) as string,
			) as IDataObject;
			return docuSignRequest(ctx, 'PUT', `${basePath}/${userId}/settings`, body);
		}

		case 'getProfileImage': {
			const userId = assertSafeId(
				ctx.getNodeParameter('userId', i) as string,
				'User ID',
			);
			const binaryPropertyName = ctx.getNodeParameter('binaryPropertyName', i, 'data') as string;

			const response = (await docuSignRequest(
				ctx,
				'GET',
				`${basePath}/${userId}/profile/image`,
				undefined,
				undefined,
				{ encoding: null, json: false },
			)) as Buffer;

			const fileName = `user_${userId}_profile_image.png`;
			const binaryData = await ctx.helpers.prepareBinaryData(response, fileName, 'image/png');

			return {
				json: { userId, fileName },
				binary: { [binaryPropertyName]: binaryData },
			} as INodeExecutionData;
		}

		case 'updateProfileImage': {
			const userId = assertSafeId(
				ctx.getNodeParameter('userId', i) as string,
				'User ID',
			);

			let fileBuffer: Buffer;
			const uploadSource = ctx.getNodeParameter('uploadSource', i, 'binary') as string;
			if (uploadSource === 'binary') {
				const binaryPropName = ctx.getNodeParameter('inputBinaryPropertyName', i, 'data') as string;
				const binaryData = ctx.helpers.assertBinaryData(i, binaryPropName);
				fileBuffer = await ctx.helpers.getBinaryDataBuffer(i, binaryPropName);
				void binaryData; // referenced for assertion
			} else {
				const base64 = ctx.getNodeParameter('base64Content', i) as string;
				fileBuffer = Buffer.from(base64, 'base64');
			}

			return docuSignRequest(
				ctx,
				'PUT',
				`${basePath}/${userId}/profile/image`,
				fileBuffer as unknown as IDataObject,
				undefined,
				{ contentType: 'image/png' },
			);
		}

		case 'deleteProfileImage': {
			const userId = assertSafeId(
				ctx.getNodeParameter('userId', i) as string,
				'User ID',
			);
			return docuSignRequest(ctx, 'DELETE', `${basePath}/${userId}/profile/image`);
		}

		default:
			throw new Error(`Unsupported user operation: ${operation}`);
	}
}
