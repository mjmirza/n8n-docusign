import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest, accountPath, assertSafeId } from '../../transport';
import { parseJsonInput } from '../../utils/jsonInput';

/**
 * Handle all User Profile operations.
 */
export async function handleUserProfile(
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
	)}/users/${userId}/profile`;

	switch (operation) {
		case 'get': {
			return docuSignRequest(ctx, 'GET', basePath);
		}

		case 'update': {
			const additionalFields = ctx.getNodeParameter('additionalFields', i, {}) as IDataObject;
			const body: IDataObject = {};

			// Build addressInformation from flat fields, using the spec's key names.
			const address: IDataObject = {};
			if (additionalFields.street1) address.address1 = additionalFields.street1;
			if (additionalFields.street2) address.address2 = additionalFields.street2;
			if (additionalFields.city) address.city = additionalFields.city;
			if (additionalFields.state) address.stateOrProvince = additionalFields.state;
			if (additionalFields.zip) address.postalCode = additionalFields.zip;
			if (additionalFields.country) address.country = additionalFields.country;
			if (additionalFields.phone) address.phone = additionalFields.phone;
			if (additionalFields.fax) address.fax = additionalFields.fax;

			if (Object.keys(address).length > 0) {
				body.address = address;
			}

			// userProfile names the field companyName.
			if (additionalFields.company) body.companyName = additionalFields.company;
			if (additionalFields.title) body.title = additionalFields.title;
			if (additionalFields.userDetails) {
				body.userDetails = parseJsonInput(additionalFields.userDetails as string);
			}

			return docuSignRequest(ctx, 'PUT', basePath, body);
		}

		default:
			throw new Error(`Unsupported user profile operation: ${operation}`);
	}
}
