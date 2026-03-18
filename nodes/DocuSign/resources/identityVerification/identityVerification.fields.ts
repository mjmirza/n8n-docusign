import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const identityVerificationFields: INodeProperties[] = [
	accountIdField(['identityVerification']),
];
