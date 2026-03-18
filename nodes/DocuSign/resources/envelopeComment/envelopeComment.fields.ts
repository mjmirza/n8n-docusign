import type { INodeProperties } from 'n8n-workflow';
import { accountIdField, envelopeIdField } from '../../utils/descriptions';

export const envelopeCommentFields: INodeProperties[] = [
	accountIdField(['envelopeComment']),
	envelopeIdField(['envelopeComment']),
];
