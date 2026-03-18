import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const accountSealProviderFields: INodeProperties[] = [
	accountIdField(['accountSealProvider']),
];
