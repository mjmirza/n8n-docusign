import type { INodeProperties } from 'n8n-workflow';
import { accountIdField } from '../../utils/descriptions';

export const accountWatermarkFields: INodeProperties[] = [
	accountIdField(['accountWatermark']),

	// ------------------------------------------------------------------
	// Update / Preview: Watermark Settings
	// ------------------------------------------------------------------
	{
		displayName: 'Watermark Settings',
		name: 'watermarkSettings',
		type: 'collection',
		placeholder: 'Add Setting',
		default: {},
		required: true,
		displayOptions: {
			show: { resource: ['accountWatermark'], operation: ['update', 'preview'] },
		},
		options: [
			{
				displayName: 'Display Angle',
				name: 'displayAngle',
				type: 'string',
				default: '45',
				description: 'The watermark display angle in degrees: 0, 45, 90',
			},
			{
				displayName: 'Enabled',
				name: 'enabled',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'true' },
					{ name: 'No', value: 'false' },
				],
				default: 'true',
				description: 'Whether the watermark is enabled',
			},
			{
				displayName: 'Font',
				name: 'font',
				type: 'string',
				default: 'helvetica',
				description: 'The watermark font: courier, helvetica, timesnewroman',
			},
			{
				displayName: 'Font Color',
				name: 'fontColor',
				type: 'options',
				options: [
					{ name: 'Account Default', value: '' },
					{ name: 'Black', value: 'black' },
					{ name: 'Blue', value: 'blue' },
					{ name: 'Gray', value: 'gray' },
					{ name: 'Red', value: 'red' },
					{ name: 'Yellow', value: 'yellow' },
				],
				default: '',
				description: 'The color of the watermark font',
			},
			{
				displayName: 'Font Size',
				name: 'fontSize',
				type: 'string',
				default: '',
				description: 'The size of the watermark font',
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				default: '',
				description: 'The watermark ID',
			},
			{
				displayName: 'Image Base64',
				name: 'imageBase64',
				type: 'string',
				default: '',
				description: 'The base64-encoded image for the watermark',
			},
			{
				displayName: 'Transparency',
				name: 'transparency',
				type: 'string',
				default: '',
				description: 'The watermark transparency: 5, 10, 15, 20, 25, 30, 35, 40, 45',
			},
			{
				displayName: 'Watermark Text',
				name: 'watermarkText',
				type: 'string',
				default: '',
				description: 'The text displayed as the watermark',
			},
		],
	},
];
