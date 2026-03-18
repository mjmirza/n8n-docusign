import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, envelopeIdField } from '../../utils/descriptions';

export const envelopeFormDataFields: INodeProperties[] = [
	accountIdField(['envelopeFormData']),
	envelopeIdField(['envelopeFormData']),
];
