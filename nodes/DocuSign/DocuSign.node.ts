import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { CATEGORIES, CATEGORY_RESOURCES } from './utils/descriptions';

// ---- Operations ----
import { envelopeOperations } from './resources/envelope/envelope.operations';
import { templateOperations } from './resources/template/template.operations';
import { recipientOperations } from './resources/recipient/recipient.operations';
import { documentOperations } from './resources/document/document.operations';
import { envelopeCustomFieldOperations } from './resources/envelopeCustomField/envelopeCustomField.operations';
import { envelopeRecipientTabOperations } from './resources/envelopeRecipientTab/envelopeRecipientTab.operations';
import { envelopeViewOperations } from './resources/envelopeView/envelopeView.operations';
import { envelopeFormDataOperations } from './resources/envelopeFormData/envelopeFormData.operations';
import { envelopeLockOperations } from './resources/envelopeLock/envelopeLock.operations';
import { envelopeAttachmentOperations } from './resources/envelopeAttachment/envelopeAttachment.operations';
import { envelopeTemplateOperations } from './resources/envelopeTemplate/envelopeTemplate.operations';
import { envelopeDocumentTabOperations } from './resources/envelopeDocumentTab/envelopeDocumentTab.operations';
import { envelopeDocumentFieldOperations } from './resources/envelopeDocumentField/envelopeDocumentField.operations';
import { envelopeEmailSettingOperations } from './resources/envelopeEmailSetting/envelopeEmailSetting.operations';
import { envelopeDocumentVisibilityOperations } from './resources/envelopeDocumentVisibility/envelopeDocumentVisibility.operations';
// Phase 2: Template sub-resources
import { templateDocumentOperations } from './resources/templateDocument/templateDocument.operations';
import { templateRecipientOperations } from './resources/templateRecipient/templateRecipient.operations';
import { templateRecipientTabOperations } from './resources/templateRecipientTab/templateRecipientTab.operations';
import { templateCustomFieldOperations } from './resources/templateCustomField/templateCustomField.operations';
import { templateDocumentFieldOperations } from './resources/templateDocumentField/templateDocumentField.operations';
import { templateDocumentTabOperations } from './resources/templateDocumentTab/templateDocumentTab.operations';
import { templateDocumentVisibilityOperations } from './resources/templateDocumentVisibility/templateDocumentVisibility.operations';
import { templateLockOperations } from './resources/templateLock/templateLock.operations';
import { templateViewOperations } from './resources/templateView/templateView.operations';
import { templateHtmlDefinitionOperations } from './resources/templateHtmlDefinition/templateHtmlDefinition.operations';
// Phase 3: Account administration
import { accountOperations } from './resources/account/account.operations';
import { accountBrandOperations } from './resources/accountBrand/accountBrand.operations';
import { accountPermissionProfileOperations } from './resources/accountPermissionProfile/accountPermissionProfile.operations';
import { accountCustomFieldOperations } from './resources/accountCustomField/accountCustomField.operations';
import { accountTabSettingOperations } from './resources/accountTabSetting/accountTabSetting.operations';
import { accountConsumerDisclosureOperations } from './resources/accountConsumerDisclosure/accountConsumerDisclosure.operations';
import { accountPasswordRuleOperations } from './resources/accountPasswordRule/accountPasswordRule.operations';
import { accountWatermarkOperations } from './resources/accountWatermark/accountWatermark.operations';
// Phase 4: Users & Groups
import { userOperations } from './resources/user/user.operations';
import { userProfileOperations } from './resources/userProfile/userProfile.operations';
import { userCustomSettingOperations } from './resources/userCustomSetting/userCustomSetting.operations';
import { userSignatureOperations } from './resources/userSignature/userSignature.operations';
import { groupOperations } from './resources/group/group.operations';
import { groupUserOperations } from './resources/groupUser/groupUser.operations';
import { groupBrandOperations } from './resources/groupBrand/groupBrand.operations';
import { userContactOperations } from './resources/userContact/userContact.operations';
import { authorizationOperations } from './resources/authorization/authorization.operations';
// Phase 5: Envelope Advanced
import { envelopeWorkflowOperations } from './resources/envelopeWorkflow/envelopeWorkflow.operations';
import { envelopeTransferRuleOperations } from './resources/envelopeTransferRule/envelopeTransferRule.operations';
import { envelopeConsumerDisclosureOperations } from './resources/envelopeConsumerDisclosure/envelopeConsumerDisclosure.operations';
import { envelopeHtmlDefinitionOperations } from './resources/envelopeHtmlDefinition/envelopeHtmlDefinition.operations';
import { envelopeCommentOperations } from './resources/envelopeComment/envelopeComment.operations';
import { documentGenerationOperations } from './resources/documentGeneration/documentGeneration.operations';
import { envelopePublishOperations } from './resources/envelopePublish/envelopePublish.operations';
import { tabsBlobOperations } from './resources/tabsBlob/tabsBlob.operations';
import { responsiveHtmlPreviewOperations } from './resources/responsiveHtmlPreview/responsiveHtmlPreview.operations';
// Phase 6: Account Advanced
import { accountSignatureOperations } from './resources/accountSignature/accountSignature.operations';
import { accountSealProviderOperations } from './resources/accountSealProvider/accountSealProvider.operations';
import { accountSignatureProviderOperations } from './resources/accountSignatureProvider/accountSignatureProvider.operations';
import { eNoteConfigurationOperations } from './resources/eNoteConfiguration/eNoteConfiguration.operations';
import { favoriteTemplateOperations } from './resources/favoriteTemplate/favoriteTemplate.operations';
import { identityVerificationOperations } from './resources/identityVerification/identityVerification.operations';
import { signingGroupOperations } from './resources/signingGroup/signingGroup.operations';
import { signingGroupUserOperations } from './resources/signingGroupUser/signingGroupUser.operations';
import { customTabOperations } from './resources/customTab/customTab.operations';

// ---- Fields ----
import { envelopeFields } from './resources/envelope/envelope.fields';
import { templateFields } from './resources/template/template.fields';
import { recipientFields } from './resources/recipient/recipient.fields';
import { documentFields } from './resources/document/document.fields';
import { envelopeCustomFieldFields } from './resources/envelopeCustomField/envelopeCustomField.fields';
import { envelopeRecipientTabFields } from './resources/envelopeRecipientTab/envelopeRecipientTab.fields';
import { envelopeViewFields } from './resources/envelopeView/envelopeView.fields';
import { envelopeFormDataFields } from './resources/envelopeFormData/envelopeFormData.fields';
import { envelopeLockFields } from './resources/envelopeLock/envelopeLock.fields';
import { envelopeAttachmentFields } from './resources/envelopeAttachment/envelopeAttachment.fields';
import { envelopeTemplateFields } from './resources/envelopeTemplate/envelopeTemplate.fields';
import { envelopeDocumentTabFields } from './resources/envelopeDocumentTab/envelopeDocumentTab.fields';
import { envelopeDocumentFieldFields } from './resources/envelopeDocumentField/envelopeDocumentField.fields';
import { envelopeEmailSettingFields } from './resources/envelopeEmailSetting/envelopeEmailSetting.fields';
import { envelopeDocumentVisibilityFields } from './resources/envelopeDocumentVisibility/envelopeDocumentVisibility.fields';
// Phase 2: Template sub-resources
import { templateDocumentFields } from './resources/templateDocument/templateDocument.fields';
import { templateRecipientFields } from './resources/templateRecipient/templateRecipient.fields';
import { templateRecipientTabFields } from './resources/templateRecipientTab/templateRecipientTab.fields';
import { templateCustomFieldFields } from './resources/templateCustomField/templateCustomField.fields';
import { templateDocumentFieldFields } from './resources/templateDocumentField/templateDocumentField.fields';
import { templateDocumentTabFields } from './resources/templateDocumentTab/templateDocumentTab.fields';
import { templateDocumentVisibilityFields } from './resources/templateDocumentVisibility/templateDocumentVisibility.fields';
import { templateLockFields } from './resources/templateLock/templateLock.fields';
import { templateViewFields } from './resources/templateView/templateView.fields';
import { templateHtmlDefinitionFields } from './resources/templateHtmlDefinition/templateHtmlDefinition.fields';
// Phase 3: Account administration
import { accountFields } from './resources/account/account.fields';
import { accountBrandFields } from './resources/accountBrand/accountBrand.fields';
import { accountPermissionProfileFields } from './resources/accountPermissionProfile/accountPermissionProfile.fields';
import { accountCustomFieldFields } from './resources/accountCustomField/accountCustomField.fields';
import { accountTabSettingFields } from './resources/accountTabSetting/accountTabSetting.fields';
import { accountConsumerDisclosureFields } from './resources/accountConsumerDisclosure/accountConsumerDisclosure.fields';
import { accountPasswordRuleFields } from './resources/accountPasswordRule/accountPasswordRule.fields';
import { accountWatermarkFields } from './resources/accountWatermark/accountWatermark.fields';
// Phase 4
import { userFields } from './resources/user/user.fields';
import { userProfileFields } from './resources/userProfile/userProfile.fields';
import { userCustomSettingFields } from './resources/userCustomSetting/userCustomSetting.fields';
import { userSignatureFields } from './resources/userSignature/userSignature.fields';
import { groupFields } from './resources/group/group.fields';
import { groupUserFields } from './resources/groupUser/groupUser.fields';
import { groupBrandFields } from './resources/groupBrand/groupBrand.fields';
import { userContactFields } from './resources/userContact/userContact.fields';
import { authorizationFields } from './resources/authorization/authorization.fields';
// Phase 5
import { envelopeWorkflowFields } from './resources/envelopeWorkflow/envelopeWorkflow.fields';
import { envelopeTransferRuleFields } from './resources/envelopeTransferRule/envelopeTransferRule.fields';
import { envelopeConsumerDisclosureFields } from './resources/envelopeConsumerDisclosure/envelopeConsumerDisclosure.fields';
import { envelopeHtmlDefinitionFields } from './resources/envelopeHtmlDefinition/envelopeHtmlDefinition.fields';
import { envelopeCommentFields } from './resources/envelopeComment/envelopeComment.fields';
import { documentGenerationFields } from './resources/documentGeneration/documentGeneration.fields';
import { envelopePublishFields } from './resources/envelopePublish/envelopePublish.fields';
import { tabsBlobFields } from './resources/tabsBlob/tabsBlob.fields';
import { responsiveHtmlPreviewFields } from './resources/responsiveHtmlPreview/responsiveHtmlPreview.fields';
import { accountSignatureFields } from './resources/accountSignature/accountSignature.fields';
import { accountSealProviderFields } from './resources/accountSealProvider/accountSealProvider.fields';
import { accountSignatureProviderFields } from './resources/accountSignatureProvider/accountSignatureProvider.fields';
import { eNoteConfigurationFields } from './resources/eNoteConfiguration/eNoteConfiguration.fields';
import { favoriteTemplateFields } from './resources/favoriteTemplate/favoriteTemplate.fields';
import { identityVerificationFields } from './resources/identityVerification/identityVerification.fields';
import { signingGroupFields } from './resources/signingGroup/signingGroup.fields';
import { signingGroupUserFields } from './resources/signingGroupUser/signingGroupUser.fields';
import { customTabFields } from './resources/customTab/customTab.fields';

// ---- Handlers ----
import { handleEnvelope } from './resources/envelope/envelope.handler';
import { handleTemplate } from './resources/template/template.handler';
import { handleRecipient } from './resources/recipient/recipient.handler';
import { handleDocument } from './resources/document/document.handler';
import { handleEnvelopeCustomField } from './resources/envelopeCustomField/envelopeCustomField.handler';
import { handleEnvelopeRecipientTab } from './resources/envelopeRecipientTab/envelopeRecipientTab.handler';
import { handleEnvelopeView } from './resources/envelopeView/envelopeView.handler';
import { handleEnvelopeFormData } from './resources/envelopeFormData/envelopeFormData.handler';
import { handleEnvelopeLock } from './resources/envelopeLock/envelopeLock.handler';
import { handleEnvelopeAttachment } from './resources/envelopeAttachment/envelopeAttachment.handler';
import { handleEnvelopeTemplate } from './resources/envelopeTemplate/envelopeTemplate.handler';
import { handleEnvelopeDocumentTab } from './resources/envelopeDocumentTab/envelopeDocumentTab.handler';
import { handleEnvelopeDocumentField } from './resources/envelopeDocumentField/envelopeDocumentField.handler';
import { handleEnvelopeEmailSetting } from './resources/envelopeEmailSetting/envelopeEmailSetting.handler';
import { handleEnvelopeDocumentVisibility } from './resources/envelopeDocumentVisibility/envelopeDocumentVisibility.handler';
// Phase 2: Template sub-resources
import { handleTemplateDocument } from './resources/templateDocument/templateDocument.handler';
import { handleTemplateRecipient } from './resources/templateRecipient/templateRecipient.handler';
import { handleTemplateRecipientTab } from './resources/templateRecipientTab/templateRecipientTab.handler';
import { handleTemplateCustomField } from './resources/templateCustomField/templateCustomField.handler';
import { handleTemplateDocumentField } from './resources/templateDocumentField/templateDocumentField.handler';
import { handleTemplateDocumentTab } from './resources/templateDocumentTab/templateDocumentTab.handler';
import { handleTemplateDocumentVisibility } from './resources/templateDocumentVisibility/templateDocumentVisibility.handler';
import { handleTemplateLock } from './resources/templateLock/templateLock.handler';
import { handleTemplateView } from './resources/templateView/templateView.handler';
import { handleTemplateHtmlDefinition } from './resources/templateHtmlDefinition/templateHtmlDefinition.handler';
// Phase 3: Account administration
import { handleAccount } from './resources/account/account.handler';
import { handleAccountBrand } from './resources/accountBrand/accountBrand.handler';
import { handleAccountPermissionProfile } from './resources/accountPermissionProfile/accountPermissionProfile.handler';
import { handleAccountCustomField } from './resources/accountCustomField/accountCustomField.handler';
import { handleAccountTabSetting } from './resources/accountTabSetting/accountTabSetting.handler';
import { handleAccountConsumerDisclosure } from './resources/accountConsumerDisclosure/accountConsumerDisclosure.handler';
import { handleAccountPasswordRule } from './resources/accountPasswordRule/accountPasswordRule.handler';
import { handleAccountWatermark } from './resources/accountWatermark/accountWatermark.handler';
// Phase 4
import { handleUser } from './resources/user/user.handler';
import { handleUserProfile } from './resources/userProfile/userProfile.handler';
import { handleUserCustomSetting } from './resources/userCustomSetting/userCustomSetting.handler';
import { handleUserSignature } from './resources/userSignature/userSignature.handler';
import { handleGroup } from './resources/group/group.handler';
import { handleGroupUser } from './resources/groupUser/groupUser.handler';
import { handleGroupBrand } from './resources/groupBrand/groupBrand.handler';
import { handleUserContact } from './resources/userContact/userContact.handler';
import { handleAuthorization } from './resources/authorization/authorization.handler';
// Phase 5
import { handleEnvelopeWorkflow } from './resources/envelopeWorkflow/envelopeWorkflow.handler';
import { handleEnvelopeTransferRule } from './resources/envelopeTransferRule/envelopeTransferRule.handler';
import { handleEnvelopeConsumerDisclosure } from './resources/envelopeConsumerDisclosure/envelopeConsumerDisclosure.handler';
import { handleEnvelopeHtmlDefinition } from './resources/envelopeHtmlDefinition/envelopeHtmlDefinition.handler';
import { handleEnvelopeComment } from './resources/envelopeComment/envelopeComment.handler';
import { handleDocumentGeneration } from './resources/documentGeneration/documentGeneration.handler';
import { handleEnvelopePublish } from './resources/envelopePublish/envelopePublish.handler';
import { handleTabsBlob } from './resources/tabsBlob/tabsBlob.handler';
import { handleResponsiveHtmlPreview } from './resources/responsiveHtmlPreview/responsiveHtmlPreview.handler';
import { handleAccountSignature } from './resources/accountSignature/accountSignature.handler';
import { handleAccountSealProvider } from './resources/accountSealProvider/accountSealProvider.handler';
import { handleAccountSignatureProvider } from './resources/accountSignatureProvider/accountSignatureProvider.handler';
import { handleENoteConfiguration } from './resources/eNoteConfiguration/eNoteConfiguration.handler';
import { handleFavoriteTemplate } from './resources/favoriteTemplate/favoriteTemplate.handler';
import { handleIdentityVerification } from './resources/identityVerification/identityVerification.handler';
import { handleSigningGroup } from './resources/signingGroup/signingGroup.handler';
import { handleSigningGroupUser } from './resources/signingGroupUser/signingGroupUser.handler';
import { handleCustomTab } from './resources/customTab/customTab.handler';

// ---------------------------------------------------------------------------
// Handler routing map
// ---------------------------------------------------------------------------
const resourceHandlers: Record<
	string,
	(ctx: IExecuteFunctions, op: string, i: number) => Promise<unknown>
> = {
	// Phase 0 resources
	envelope: handleEnvelope,
	template: handleTemplate,
	recipient: handleRecipient,
	envelopeRecipient: handleRecipient,
	document: handleDocument,
	envelopeDocument: handleDocument,
	// Phase 1 resources
	envelopeCustomField: handleEnvelopeCustomField,
	envelopeRecipientTab: handleEnvelopeRecipientTab,
	envelopeView: handleEnvelopeView,
	envelopeFormData: handleEnvelopeFormData,
	envelopeLock: handleEnvelopeLock,
	envelopeAttachment: handleEnvelopeAttachment,
	envelopeTemplate: handleEnvelopeTemplate,
	envelopeDocumentTab: handleEnvelopeDocumentTab,
	envelopeDocumentField: handleEnvelopeDocumentField,
	envelopeEmailSetting: handleEnvelopeEmailSetting,
	envelopeDocumentVisibility: handleEnvelopeDocumentVisibility,
	// Phase 2
	templateDocument: handleTemplateDocument,
	templateRecipient: handleTemplateRecipient,
	templateRecipientTab: handleTemplateRecipientTab,
	templateCustomField: handleTemplateCustomField,
	templateDocumentField: handleTemplateDocumentField,
	templateDocumentTab: handleTemplateDocumentTab,
	templateDocumentVisibility: handleTemplateDocumentVisibility,
	templateLock: handleTemplateLock,
	templateView: handleTemplateView,
	templateHtmlDefinition: handleTemplateHtmlDefinition,
	// Phase 3
	account: handleAccount,
	accountBrand: handleAccountBrand,
	accountPermissionProfile: handleAccountPermissionProfile,
	accountCustomField: handleAccountCustomField,
	accountTabSetting: handleAccountTabSetting,
	accountConsumerDisclosure: handleAccountConsumerDisclosure,
	accountPasswordRule: handleAccountPasswordRule,
	accountWatermark: handleAccountWatermark,
	// Phase 4
	user: handleUser,
	userProfile: handleUserProfile,
	userCustomSetting: handleUserCustomSetting,
	userSignature: handleUserSignature,
	group: handleGroup,
	groupUser: handleGroupUser,
	groupBrand: handleGroupBrand,
	userContact: handleUserContact,
	authorization: handleAuthorization,
	// Phase 5
	envelopeWorkflow: handleEnvelopeWorkflow,
	envelopeTransferRule: handleEnvelopeTransferRule,
	envelopeConsumerDisclosure: handleEnvelopeConsumerDisclosure,
	envelopeHtmlDefinition: handleEnvelopeHtmlDefinition,
	envelopeComment: handleEnvelopeComment,
	documentGeneration: handleDocumentGeneration,
	envelopePublish: handleEnvelopePublish,
	tabsBlob: handleTabsBlob,
	responsiveHtmlPreview: handleResponsiveHtmlPreview,
	// Phase 6
	accountSignature: handleAccountSignature,
	accountSealProvider: handleAccountSealProvider,
	accountSignatureProvider: handleAccountSignatureProvider,
	eNoteConfiguration: handleENoteConfiguration,
	favoriteTemplate: handleFavoriteTemplate,
	identityVerification: handleIdentityVerification,
	signingGroup: handleSigningGroup,
	signingGroupUser: handleSigningGroupUser,
	customTab: handleCustomTab,
};

// ---------------------------------------------------------------------------
// Build the resource selector
// ---------------------------------------------------------------------------
function buildResourceOptions(): Array<{
	name: string;
	value: string;
	description: string;
}> {
	const all: Array<{ name: string; value: string; description: string }> = [];
	for (const category of Object.values(CATEGORY_RESOURCES)) {
		all.push(...category);
	}
	return all.sort((a, b) => a.name.localeCompare(b.name));
}

export class DocuSign implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DocuSign',
		name: 'docuSign',
		icon: 'file:docusign.svg',
		group: ['transform'],
		version: 1,
		subtitle:
			'={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Interact with the DocuSign eSignature REST API v2.1 — complete enterprise coverage',
		defaults: { name: 'DocuSign' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'docuSignOAuth2Api',
				required: true,
				displayOptions: { show: { authentication: ['oAuth2'] } },
			},
			{
				name: 'docuSignJwtApi',
				required: true,
				displayOptions: { show: { authentication: ['jwt'] } },
			},
		],
		properties: [
			// Authentication
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{ name: 'OAuth2', value: 'oAuth2' },
					{ name: 'JWT (Service Integration)', value: 'jwt' },
				],
				default: 'oAuth2',
			},
			// Category
			{
				displayName: 'Category',
				name: 'category',
				type: 'options',
				noDataExpression: true,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				options: CATEGORIES as any,
				default: 'envelopes',
				description: 'The API category to work with',
			},
			// Resource
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: buildResourceOptions(),
				default: 'envelope',
			},

			// ---- All operations ----
			...envelopeOperations,
			...templateOperations,
			...recipientOperations,
			...documentOperations,
			...envelopeCustomFieldOperations,
			...envelopeRecipientTabOperations,
			...envelopeViewOperations,
			...envelopeFormDataOperations,
			...envelopeLockOperations,
			...envelopeAttachmentOperations,
			...envelopeTemplateOperations,
			...envelopeDocumentTabOperations,
			...envelopeDocumentFieldOperations,
			...envelopeEmailSettingOperations,
			...envelopeDocumentVisibilityOperations,
			// Phase 2
			...templateDocumentOperations,
			...templateRecipientOperations,
			...templateRecipientTabOperations,
			...templateCustomFieldOperations,
			...templateDocumentFieldOperations,
			...templateDocumentTabOperations,
			...templateDocumentVisibilityOperations,
			...templateLockOperations,
			...templateViewOperations,
			...templateHtmlDefinitionOperations,
			// Phase 3
			...accountOperations,
			...accountBrandOperations,
			...accountPermissionProfileOperations,
			...accountCustomFieldOperations,
			...accountTabSettingOperations,
			...accountConsumerDisclosureOperations,
			...accountPasswordRuleOperations,
			...accountWatermarkOperations,
			// Phase 4
			...userOperations,
			...userProfileOperations,
			...userCustomSettingOperations,
			...userSignatureOperations,
			...groupOperations,
			...groupUserOperations,
			...groupBrandOperations,
			...userContactOperations,
			...authorizationOperations,
			// Phase 5
			...envelopeWorkflowOperations,
			...envelopeTransferRuleOperations,
			...envelopeConsumerDisclosureOperations,
			...envelopeHtmlDefinitionOperations,
			...envelopeCommentOperations,
			...documentGenerationOperations,
			...envelopePublishOperations,
			...tabsBlobOperations,
			...responsiveHtmlPreviewOperations,
			...accountSignatureOperations, ...accountSealProviderOperations, ...accountSignatureProviderOperations,
			...eNoteConfigurationOperations, ...favoriteTemplateOperations, ...identityVerificationOperations,
			...signingGroupOperations, ...signingGroupUserOperations, ...customTabOperations,

			// ---- All fields ----
			...envelopeFields,
			...templateFields,
			...recipientFields,
			...documentFields,
			...envelopeCustomFieldFields,
			...envelopeRecipientTabFields,
			...envelopeViewFields,
			...envelopeFormDataFields,
			...envelopeLockFields,
			...envelopeAttachmentFields,
			...envelopeTemplateFields,
			...envelopeDocumentTabFields,
			...envelopeDocumentFieldFields,
			...envelopeEmailSettingFields,
			...envelopeDocumentVisibilityFields,
			// Phase 2
			...templateDocumentFields,
			...templateRecipientFields,
			...templateRecipientTabFields,
			...templateCustomFieldFields,
			...templateDocumentFieldFields,
			...templateDocumentTabFields,
			...templateDocumentVisibilityFields,
			...templateLockFields,
			...templateViewFields,
			...templateHtmlDefinitionFields,
			// Phase 3
			...accountFields,
			...accountBrandFields,
			...accountPermissionProfileFields,
			...accountCustomFieldFields,
			...accountTabSettingFields,
			...accountConsumerDisclosureFields,
			...accountPasswordRuleFields,
			...accountWatermarkFields,
			// Phase 4
			...userFields,
			...userProfileFields,
			...userCustomSettingFields,
			...userSignatureFields,
			...groupFields,
			...groupUserFields,
			...groupBrandFields,
			...userContactFields,
			...authorizationFields,
			// Phase 5
			...envelopeWorkflowFields,
			...envelopeTransferRuleFields,
			...envelopeConsumerDisclosureFields,
			...envelopeHtmlDefinitionFields,
			...envelopeCommentFields,
			...documentGenerationFields,
			...envelopePublishFields,
			...tabsBlobFields,
			...responsiveHtmlPreviewFields,
			...accountSignatureFields, ...accountSealProviderFields, ...accountSignatureProviderFields,
			...eNoteConfigurationFields, ...favoriteTemplateFields, ...identityVerificationFields,
			...signingGroupFields, ...signingGroupUserFields, ...customTabFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const handler = resourceHandlers[resource];

		if (!handler) {
			throw new Error(`Unknown resource: ${resource}`);
		}

		for (let i = 0; i < items.length; i++) {
			try {
				const result = await handler(this, operation, i);

				if (result === null || result === undefined) {
					returnData.push({ json: { success: true }, pairedItem: { item: i } });
				} else if (Array.isArray(result)) {
					if (result.length === 0) {
						returnData.push({ json: { success: true, count: 0 }, pairedItem: { item: i } });
					} else {
						for (const entry of result) {
							returnData.push({
								json: typeof entry === 'object' && entry !== null ? (entry as IDataObject) : { data: entry },
								pairedItem: { item: i },
							});
						}
					}
				} else if (typeof result === 'object') {
					const obj = result as Record<string, unknown>;
					if ('binary' in obj && 'json' in obj) {
						returnData.push({ ...(result as INodeExecutionData), pairedItem: { item: i } });
					} else if (Array.isArray(obj.data)) {
						if (obj.data.length === 0) {
							returnData.push({ json: { success: true, count: 0 }, pairedItem: { item: i } });
						} else {
							for (const entry of obj.data) {
								returnData.push({
									json: typeof entry === 'object' && entry !== null ? (entry as IDataObject) : { data: entry },
									pairedItem: { item: i },
								});
							}
						}
					} else {
						returnData.push({ json: result as IDataObject, pairedItem: { item: i } });
					}
				} else {
					returnData.push({ json: { data: result }, pairedItem: { item: i } });
				}
			} catch (error: unknown) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
