/**
 * Phase 5 handler tests — Envelope Advanced Features.
 * Every operation, security check, error path, and edge case.
 */
import { describe, it, expect } from '@jest/globals';
import { createMockContext } from './helpers/mockContext';

import { handleEnvelopeWorkflow } from '../nodes/DocuSign/resources/envelopeWorkflow/envelopeWorkflow.handler';
import { handleEnvelopeTransferRule } from '../nodes/DocuSign/resources/envelopeTransferRule/envelopeTransferRule.handler';
import { handleEnvelopeConsumerDisclosure } from '../nodes/DocuSign/resources/envelopeConsumerDisclosure/envelopeConsumerDisclosure.handler';
import { handleEnvelopeHtmlDefinition } from '../nodes/DocuSign/resources/envelopeHtmlDefinition/envelopeHtmlDefinition.handler';
import { handleEnvelopeComment } from '../nodes/DocuSign/resources/envelopeComment/envelopeComment.handler';
import { handleDocumentGeneration } from '../nodes/DocuSign/resources/documentGeneration/documentGeneration.handler';
import { handleEnvelopePublish } from '../nodes/DocuSign/resources/envelopePublish/envelopePublish.handler';
import { handleTabsBlob } from '../nodes/DocuSign/resources/tabsBlob/tabsBlob.handler';
import { handleResponsiveHtmlPreview } from '../nodes/DocuSign/resources/responsiveHtmlPreview/responsiveHtmlPreview.handler';

const C = { docuSignOAuth2Api: { environment: 'demo' } };
const P = { accountId: { 0: 'acct-1' } };
const EP = { ...P, envelopeId: { 0: 'env-1' } };

// ==================================================================
// Envelope Workflow (most complex)
// ==================================================================
describe('handleEnvelopeWorkflow', () => {
	// Envelope scope
	it('getWorkflow — envelope', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, scope: { 0: 'envelope' } }, httpResponses: [{ workflowSteps: [] }] });
		await handleEnvelopeWorkflow(ctx, 'getEnvelopeWorkflow', 0);
	});

	it('updateWorkflow — envelope', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, scope: { 0: 'envelope' }, requestBody: { 0: '{"workflowStatus":"in_progress"}' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'updateEnvelopeWorkflow', 0);
	});

	it('updateWorkflow — invalid JSON', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, scope: { 0: 'envelope' }, requestBody: { 0: 'bad' } } });
		await expect(handleEnvelopeWorkflow(ctx, 'updateEnvelopeWorkflow', 0)).rejects.toThrow();
	});

	it('deleteWorkflow — envelope', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, scope: { 0: 'envelope' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'deleteEnvelopeWorkflow', 0);
	});

	it('getWorkflowStep — envelope', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, scope: { 0: 'envelope' }, stepId: { 0: 'step-1' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'getEnvelopeWorkflowStep', 0);
	});

	it('createWorkflowStep — envelope', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, scope: { 0: 'envelope' }, requestBody: { 0: '{"name":"Step 1"}' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'createEnvelopeWorkflowStep', 0);
	});

	it('updateWorkflowStep — envelope', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, scope: { 0: 'envelope' }, stepId: { 0: 'step-1' }, requestBody: { 0: '{"name":"Updated"}' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'updateEnvelopeWorkflowStep', 0);
	});

	it('deleteWorkflowStep — envelope', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, scope: { 0: 'envelope' }, stepId: { 0: 'step-1' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'deleteEnvelopeWorkflowStep', 0);
	});

	it('getDelayedRouting — envelope', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, scope: { 0: 'envelope' }, stepId: { 0: 'step-1' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'getEnvelopeDelayedRouting', 0);
	});

	it('updateDelayedRouting — envelope', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, scope: { 0: 'envelope' }, stepId: { 0: 'step-1' }, requestBody: { 0: '{"delay":"24h"}' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'updateEnvelopeDelayedRouting', 0);
	});

	it('deleteDelayedRouting — envelope', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, scope: { 0: 'envelope' }, stepId: { 0: 'step-1' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'deleteEnvelopeDelayedRouting', 0);
	});

	it('getScheduledSending — envelope', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, scope: { 0: 'envelope' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'getEnvelopeScheduledSending', 0);
	});

	it('updateScheduledSending — envelope', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, scope: { 0: 'envelope' }, requestBody: { 0: '{"scheduledDate":"2025-01-01"}' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'updateEnvelopeScheduledSending', 0);
	});

	it('deleteScheduledSending — envelope', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, scope: { 0: 'envelope' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'deleteEnvelopeScheduledSending', 0);
	});

	// Template scope
	it('getWorkflow — template', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, scope: { 0: 'template' }, templateId: { 0: 'tmpl-1' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'getEnvelopeWorkflow', 0);
	});

	it('updateWorkflow — template', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, scope: { 0: 'template' }, templateId: { 0: 'tmpl-1' }, requestBody: { 0: '{}' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'updateEnvelopeWorkflow', 0);
	});

	it('deleteWorkflow — template', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, scope: { 0: 'template' }, templateId: { 0: 'tmpl-1' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'deleteEnvelopeWorkflow', 0);
	});

	it('createWorkflowStep — template', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, scope: { 0: 'template' }, templateId: { 0: 'tmpl-1' }, requestBody: { 0: '{}' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'createEnvelopeWorkflowStep', 0);
	});

	it('getWorkflowStep — template', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, scope: { 0: 'template' }, templateId: { 0: 'tmpl-1' }, stepId: { 0: 's1' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'getEnvelopeWorkflowStep', 0);
	});

	it('updateWorkflowStep — template', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, scope: { 0: 'template' }, templateId: { 0: 'tmpl-1' }, stepId: { 0: 's1' }, requestBody: { 0: '{}' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'updateEnvelopeWorkflowStep', 0);
	});

	it('deleteWorkflowStep — template', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, scope: { 0: 'template' }, templateId: { 0: 'tmpl-1' }, stepId: { 0: 's1' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'deleteEnvelopeWorkflowStep', 0);
	});

	it('getDelayedRouting — template', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, scope: { 0: 'template' }, templateId: { 0: 'tmpl-1' }, stepId: { 0: 's1' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'getEnvelopeDelayedRouting', 0);
	});

	it('updateDelayedRouting — template', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, scope: { 0: 'template' }, templateId: { 0: 'tmpl-1' }, stepId: { 0: 's1' }, requestBody: { 0: '{}' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'updateEnvelopeDelayedRouting', 0);
	});

	it('deleteDelayedRouting — template', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, scope: { 0: 'template' }, templateId: { 0: 'tmpl-1' }, stepId: { 0: 's1' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'deleteEnvelopeDelayedRouting', 0);
	});

	it('getScheduledSending — template', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, scope: { 0: 'template' }, templateId: { 0: 'tmpl-1' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'getEnvelopeScheduledSending', 0);
	});

	it('updateScheduledSending — template', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, scope: { 0: 'template' }, templateId: { 0: 'tmpl-1' }, requestBody: { 0: '{}' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'updateEnvelopeScheduledSending', 0);
	});

	it('deleteScheduledSending — template', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, scope: { 0: 'template' }, templateId: { 0: 'tmpl-1' } }, httpResponses: [{}] });
		await handleEnvelopeWorkflow(ctx, 'deleteEnvelopeScheduledSending', 0);
	});

	// Security
	it('rejects invalid scope', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, scope: { 0: '__proto__' } } });
		await expect(handleEnvelopeWorkflow(ctx, 'getEnvelopeWorkflow', 0)).rejects.toThrow('Invalid scope');
	});

	it('rejects invalid stepId', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, scope: { 0: 'envelope' }, stepId: { 0: '../hack' } } });
		await expect(handleEnvelopeWorkflow(ctx, 'getEnvelopeWorkflowStep', 0)).rejects.toThrow('contains invalid characters');
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, scope: { 0: 'envelope' } } });
		await expect(handleEnvelopeWorkflow(ctx, 'purge', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Envelope Transfer Rule
// ==================================================================
describe('handleEnvelopeTransferRule', () => {
	it('get', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P, httpResponses: [{ transferRules: [] }] });
		await handleEnvelopeTransferRule(ctx, 'get', 0);
	});

	it('create', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: '{"fromUserId":"u1","toUserId":"u2"}' } }, httpResponses: [{}] });
		await handleEnvelopeTransferRule(ctx, 'create', 0);
	});

	it('create — invalid JSON', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: 'bad' } } });
		await expect(handleEnvelopeTransferRule(ctx, 'create', 0)).rejects.toThrow();
	});

	it('update', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, ruleId: { 0: 'rule-1' }, requestBody: { 0: '{"enabled":"true"}' } }, httpResponses: [{}] });
		await handleEnvelopeTransferRule(ctx, 'update', 0);
	});

	it('updateRule — bulk', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: '{"transferRules":[]}' } }, httpResponses: [{}] });
		await handleEnvelopeTransferRule(ctx, 'updateRule', 0);
	});

	it('delete', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, ruleId: { 0: 'rule-1' } }, httpResponses: [{}] });
		await handleEnvelopeTransferRule(ctx, 'delete', 0);
	});

	it('rejects invalid ruleId', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, ruleId: { 0: '../x' } } });
		await expect(handleEnvelopeTransferRule(ctx, 'delete', 0)).rejects.toThrow('contains invalid characters');
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P });
		await expect(handleEnvelopeTransferRule(ctx, 'clone', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Envelope Consumer Disclosure
// ==================================================================
describe('handleEnvelopeConsumerDisclosure', () => {
	it('get', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, recipientId: { 0: 'r1' } }, httpResponses: [{}] });
		await handleEnvelopeConsumerDisclosure(ctx, 'get', 0);
	});

	it('getDefault — with langCode', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, recipientId: { 0: 'r1' }, langCode: { 0: 'en' } }, httpResponses: [{}] });
		await handleEnvelopeConsumerDisclosure(ctx, 'getDefault', 0);
	});

	it('rejects invalid recipientId', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, recipientId: { 0: '../x' } } });
		await expect(handleEnvelopeConsumerDisclosure(ctx, 'get', 0)).rejects.toThrow('contains invalid characters');
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, recipientId: { 0: 'r1' } } });
		await expect(handleEnvelopeConsumerDisclosure(ctx, 'update', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Envelope HTML Definition
// ==================================================================
describe('handleEnvelopeHtmlDefinition', () => {
	it('list', async () => {
		const ctx = createMockContext({ credentials: C, parameters: EP, httpResponses: [{}] });
		await handleEnvelopeHtmlDefinition(ctx, 'list', 0);
	});

	it('getDocument', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, documentId: { 0: '1' } }, httpResponses: [{}] });
		await handleEnvelopeHtmlDefinition(ctx, 'getDocument', 0);
	});

	it('rejects invalid documentId', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, documentId: { 0: '../x' } } });
		await expect(handleEnvelopeHtmlDefinition(ctx, 'getDocument', 0)).rejects.toThrow('contains invalid characters');
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: EP });
		await expect(handleEnvelopeHtmlDefinition(ctx, 'purge', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Envelope Comment
// ==================================================================
describe('handleEnvelopeComment', () => {
	it('get', async () => {
		const ctx = createMockContext({ credentials: C, parameters: EP, httpResponses: [{ comments: [] }] });
		await handleEnvelopeComment(ctx, 'get', 0);
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: EP });
		await expect(handleEnvelopeComment(ctx, 'create', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Document Generation
// ==================================================================
describe('handleDocumentGeneration', () => {
	it('getFormFields', async () => {
		const ctx = createMockContext({ credentials: C, parameters: EP, httpResponses: [{ formFields: [] }] });
		await handleDocumentGeneration(ctx, 'getFormFields', 0);
	});

	it('updateFormFields', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, requestBody: { 0: '{"formFields":[{"name":"f1","value":"v1"}]}' } }, httpResponses: [{}] });
		await handleDocumentGeneration(ctx, 'updateFormFields', 0);
	});

	it('updateFormFields — invalid JSON', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, requestBody: { 0: 'bad' } } });
		await expect(handleDocumentGeneration(ctx, 'updateFormFields', 0)).rejects.toThrow();
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: EP });
		await expect(handleDocumentGeneration(ctx, 'delete', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Envelope Publish
// ==================================================================
describe('handleEnvelopePublish', () => {
	it('createHistorical', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: '{"envelopeIds":["e1","e2"]}' } }, httpResponses: [{}] });
		await handleEnvelopePublish(ctx, 'createHistorical', 0);
	});

	it('createHistorical — invalid JSON', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...P, requestBody: { 0: 'bad' } } });
		await expect(handleEnvelopePublish(ctx, 'createHistorical', 0)).rejects.toThrow();
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: P });
		await expect(handleEnvelopePublish(ctx, 'delete', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Tabs Blob
// ==================================================================
describe('handleTabsBlob', () => {
	it('get', async () => {
		const ctx = createMockContext({ credentials: C, parameters: EP, httpResponses: [{}] });
		await handleTabsBlob(ctx, 'get', 0);
	});

	it('update', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, requestBody: { 0: '{"tabsBlob":"data"}' } }, httpResponses: [{}] });
		await handleTabsBlob(ctx, 'update', 0);
	});

	it('update — invalid JSON', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, requestBody: { 0: 'bad' } } });
		await expect(handleTabsBlob(ctx, 'update', 0)).rejects.toThrow();
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: EP });
		await expect(handleTabsBlob(ctx, 'delete', 0)).rejects.toThrow('Unsupported');
	});
});

// ==================================================================
// Responsive HTML Preview
// ==================================================================
describe('handleResponsiveHtmlPreview', () => {
	it('createEnvelopePreview', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, requestBody: { 0: '{}' } }, httpResponses: [{}] });
		await handleResponsiveHtmlPreview(ctx, 'createEnvelopePreview', 0);
	});

	it('createDocumentPreview', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, documentId: { 0: '1' }, requestBody: { 0: '{}' } }, httpResponses: [{}] });
		await handleResponsiveHtmlPreview(ctx, 'createDocumentPreview', 0);
	});

	it('createDocumentPreview — invalid JSON', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, documentId: { 0: '1' }, requestBody: { 0: 'bad' } } });
		await expect(handleResponsiveHtmlPreview(ctx, 'createDocumentPreview', 0)).rejects.toThrow();
	});

	it('createEnvelopePreview — invalid JSON', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, requestBody: { 0: 'bad' } } });
		await expect(handleResponsiveHtmlPreview(ctx, 'createEnvelopePreview', 0)).rejects.toThrow();
	});

	it('rejects invalid documentId', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, documentId: { 0: '../x' }, requestBody: { 0: '{}' } } });
		await expect(handleResponsiveHtmlPreview(ctx, 'createDocumentPreview', 0)).rejects.toThrow('contains invalid characters');
	});

	it('unsupported operation', async () => {
		const ctx = createMockContext({ credentials: C, parameters: { ...EP, requestBody: { 0: '{}' } } });
		await expect(handleResponsiveHtmlPreview(ctx, 'delete', 0)).rejects.toThrow('Unsupported');
	});
});
