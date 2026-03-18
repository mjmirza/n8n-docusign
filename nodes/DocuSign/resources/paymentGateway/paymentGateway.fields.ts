import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const paymentGatewayFields: INodeProperties[] = [
	accountIdField(['paymentGateway']),
];
