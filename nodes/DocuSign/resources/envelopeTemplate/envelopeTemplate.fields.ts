import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, envelopeIdField, templateIdField, documentIdField } from '../../utils/descriptions';

export const envelopeTemplateFields: INodeProperties[] = [
	accountIdField(['envelopeTemplate']),
	envelopeIdField(['envelopeTemplate']),
	templateIdField(['envelopeTemplate'], ['apply', 'applyToDocument', 'delete']),
	documentIdField(['envelopeTemplate'], ['applyToDocument', 'delete', 'listByDocument']),
];
