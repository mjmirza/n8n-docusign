import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { docuSignRequest, envelopePath, templatePath, assertSafeId } from '../../transport';
import { parseJsonInput } from '../../utils/jsonInput';

const VALID_SCOPES = ['envelope', 'template'] as const;

function buildBasePath(ctx: IExecuteFunctions, i: number): string {
	const scope = ctx.getNodeParameter('scope', i) as string;
	if (!VALID_SCOPES.includes(scope as (typeof VALID_SCOPES)[number])) {
		throw new Error(`Invalid scope: "${scope}". Must be "envelope" or "template".`);
	}

	const accountId = ctx.getNodeParameter('accountId', i) as string;

	if (scope === 'envelope') {
		return envelopePath(accountId, ctx.getNodeParameter('envelopeId', i) as string);
	}
	return templatePath(accountId, ctx.getNodeParameter('templateId', i) as string);
}

function parseBody(ctx: IExecuteFunctions, i: number): IDataObject {
	const raw = ctx.getNodeParameter('requestBody', i) as string;
	try {
		return parseJsonInput(raw) as IDataObject;
	} catch {
		throw new NodeOperationError(ctx.getNode(), 'Request body must be valid JSON');
	}
}

/**
 * Handle all Envelope Workflow operations (envelope and template scoped).
 */
export async function handleEnvelopeWorkflow(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<unknown> {
	const basePath = buildBasePath(ctx, i);

	switch (operation) {
		// --- Workflow ---
		case 'getEnvelopeWorkflow': {
			return docuSignRequest(ctx, 'GET', `${basePath}/workflow`);
		}

		case 'updateEnvelopeWorkflow': {
			const body = parseBody(ctx, i);
			return docuSignRequest(ctx, 'PUT', `${basePath}/workflow`, body);
		}

		case 'deleteEnvelopeWorkflow': {
			return docuSignRequest(ctx, 'DELETE', `${basePath}/workflow`);
		}

		// --- Workflow Steps ---
		case 'getEnvelopeWorkflowStep': {
			const stepId = assertSafeId(
				ctx.getNodeParameter('stepId', i) as string,
				'Step ID',
			);
			return docuSignRequest(ctx, 'GET', `${basePath}/workflow/steps/${stepId}`);
		}

		case 'createEnvelopeWorkflowStep': {
			const body = parseBody(ctx, i);
			return docuSignRequest(ctx, 'POST', `${basePath}/workflow/steps`, body);
		}

		case 'updateEnvelopeWorkflowStep': {
			const stepId = assertSafeId(
				ctx.getNodeParameter('stepId', i) as string,
				'Step ID',
			);
			const body = parseBody(ctx, i);
			return docuSignRequest(ctx, 'PUT', `${basePath}/workflow/steps/${stepId}`, body);
		}

		case 'deleteEnvelopeWorkflowStep': {
			const stepId = assertSafeId(
				ctx.getNodeParameter('stepId', i) as string,
				'Step ID',
			);
			return docuSignRequest(ctx, 'DELETE', `${basePath}/workflow/steps/${stepId}`);
		}

		// --- Delayed Routing ---
		case 'getEnvelopeDelayedRouting': {
			const stepId = assertSafeId(
				ctx.getNodeParameter('stepId', i) as string,
				'Step ID',
			);
			return docuSignRequest(ctx, 'GET', `${basePath}/workflow/steps/${stepId}/delayedRouting`);
		}

		case 'updateEnvelopeDelayedRouting': {
			const stepId = assertSafeId(
				ctx.getNodeParameter('stepId', i) as string,
				'Step ID',
			);
			const body = parseBody(ctx, i);
			return docuSignRequest(ctx, 'PUT', `${basePath}/workflow/steps/${stepId}/delayedRouting`, body);
		}

		case 'deleteEnvelopeDelayedRouting': {
			const stepId = assertSafeId(
				ctx.getNodeParameter('stepId', i) as string,
				'Step ID',
			);
			return docuSignRequest(ctx, 'DELETE', `${basePath}/workflow/steps/${stepId}/delayedRouting`);
		}

		// --- Scheduled Sending ---
		case 'getEnvelopeScheduledSending': {
			return docuSignRequest(ctx, 'GET', `${basePath}/workflow/scheduledSending`);
		}

		case 'updateEnvelopeScheduledSending': {
			const body = parseBody(ctx, i);
			return docuSignRequest(ctx, 'PUT', `${basePath}/workflow/scheduledSending`, body);
		}

		case 'deleteEnvelopeScheduledSending': {
			return docuSignRequest(ctx, 'DELETE', `${basePath}/workflow/scheduledSending`);
		}

		default:
			throw new Error(`Unsupported envelope workflow operation: ${operation}`);
	}
}
