import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, envelopeIdField, documentIdField } from '../../utils/descriptions';

export const envelopeHtmlDefinitionFields: INodeProperties[] = [
	accountIdField(['envelopeHtmlDefinition']),
	envelopeIdField(['envelopeHtmlDefinition']),
	documentIdField(['envelopeHtmlDefinition'], ['getDocument']),
];
