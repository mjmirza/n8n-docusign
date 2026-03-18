import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { docuSignRequest } from '../../transport';

/**
 * Handle all Notary Journal operations.
 * These use /current_user/ path — no account prefix.
 */
export async function handleNotaryJournal(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	switch (operation) {
		case 'list': {
			const qs: IDataObject = {};

			const count = ctx.getNodeParameter('count', i, 100) as number;
			if (count) {
				qs.count = String(count);
			}

			const startPosition = ctx.getNodeParameter('startPosition', i, 0) as number;
			if (startPosition > 0) {
				qs.start_position = String(startPosition);
			}

			const searchText = ctx.getNodeParameter('searchText', i, '') as string;
			if (searchText) {
				qs.search_text = searchText;
			}

			return docuSignRequest(ctx, 'GET', 'current_user/notary/journals', undefined, qs);
		}

		default:
			throw new Error(`Unsupported notary journal operation: ${operation}`);
	}
}
