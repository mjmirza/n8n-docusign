import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';
import { parseJsonInput } from '../../utils/jsonInput';

/**
 * Handle all Authorization operations.
 */
export async function handleAuthorization(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const userId = assertSafeId(
		ctx.getNodeParameter('userId', i) as string,
		'User ID',
	);
	const basePath = `${accountPath(
		ctx.getNodeParameter('accountId', i) as string,
	)}/users/${userId}`;

	switch (operation) {
		case 'createUserAuthorization': {
			const agentUserId = assertSafeId(
				ctx.getNodeParameter('agentUserId', i) as string,
				'Agent User ID',
			);
			const permission = ctx.getNodeParameter('permission', i) as string;
			const additionalFields = ctx.getNodeParameter('additionalFields', i, {}) as IDataObject;

			const body: IDataObject = {
				agentUser: {
					userId: agentUserId,
					...(additionalFields.agentAccountId ? { accountId: additionalFields.agentAccountId } : {}),
				},
				permission,
			};
			if (additionalFields.startDate) body.startDate = additionalFields.startDate;
			if (additionalFields.endDate) body.endDate = additionalFields.endDate;

			return docuSignRequest(ctx, 'POST', `${basePath}/authorization`, body);
		}

		case 'createUserAuthorizations': {
			const authorizations = parseJsonInput(
				ctx.getNodeParameter('authorizationsBody', i) as string,
			);
			return docuSignRequest(ctx, 'POST', `${basePath}/authorizations`, { authorizations } as unknown as IDataObject);
		}

		case 'deleteUserAuthorization': {
			const authorizationId = assertSafeId(
				ctx.getNodeParameter('authorizationId', i) as string,
				'Authorization ID',
			);
			return docuSignRequest(ctx, 'DELETE', `${basePath}/authorization/${authorizationId}`);
		}

		case 'deleteUserAuthorizations': {
			const input: unknown = parseJsonInput(ctx.getNodeParameter('deleteAuthorizationsBody', i) as string);
			// The spec body is { authorizations: [{ authorizationId }] }; a bare array or ID list is wrapped.
			const body = Array.isArray(input)
				? { authorizations: input.map((a) => (typeof a === 'string' ? { authorizationId: a } : a)) }
				: (input as IDataObject);
			return docuSignRequest(ctx, 'DELETE', `${basePath}/authorizations`, body as IDataObject);
		}

		case 'getAgentUserAuthorizations': {
			// Authorizations where this user is the agent: GET .../users/{userId}/authorizations/agent
			return docuSignRequest(ctx, 'GET', `${basePath}/authorizations/agent`);
		}

		case 'getPrincipalUserAuthorizations': {
			// Authorizations this user granted as principal: GET .../users/{userId}/authorizations
			return docuSignRequest(ctx, 'GET', `${basePath}/authorizations`);
		}

		case 'getUserAuthorization': {
			const authorizationId = assertSafeId(
				ctx.getNodeParameter('authorizationId', i) as string,
				'Authorization ID',
			);
			return docuSignRequest(ctx, 'GET', `${basePath}/authorization/${authorizationId}`);
		}

		case 'updateUserAuthorization': {
			const authorizationId = assertSafeId(
				ctx.getNodeParameter('authorizationId', i) as string,
				'Authorization ID',
			);
			const body = parseJsonInput(
				ctx.getNodeParameter('updateBody', i) as string,
			) as IDataObject;
			return docuSignRequest(ctx, 'PUT', `${basePath}/authorization/${authorizationId}`, body);
		}

		default:
			throw new Error(`Unsupported authorization operation: ${operation}`);
	}
}
