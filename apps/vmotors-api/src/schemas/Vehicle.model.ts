import { Schema } from 'mongoose';
import { VehicleBrand, VehicleFuel, VehicleStatus, VehicleTransmission } from '../libs/enums/vehicle.enum';

const VehicleSchema = new Schema(
	{
		vehicleBrand: {
			type: String,
			enum: VehicleBrand,
			required: true,
		},

		vehicleModel: {
			type: String,
			required: true,
		},

		vehicleTrim: {
			type: String,
			required: true,
		},

		vehicleYear: {
			type: Number,
			required: true,
		},

		vehicleFuel: {
			type: String,
			enum: VehicleFuel,
			required: true,
		},

		vehicleTransmission: {
			type: String,
			enum: VehicleTransmission,
			required: true,
		},

		vehicleColor: {
			type: String,
			required: true,
		},

		vehiclePrice: {
			type: Number,
			required: true,
		},

		vehicleLocation: {
			type: String,
			required: true,
		},

		vehicleStockQuantity: {
			type: Number,
			required: true,
			default: 1,
		},

		vehicleImages: {
			type: [String],
			required: true,
		},

		vehicleDesc: {
			type: String,
		},

		vehicleBodyType: {
			type: String,
		},

		vehicleMileage: {
			type: Number,
		},

		vehicleStatus: {
			type: String,
			enum: VehicleStatus,
			default: VehicleStatus.AVAILABLE,
		},

		vehicleViews: {
			type: Number,
			default: 0,
		},

		vehicleLikes: {
			type: Number,
			default: 0,
		},

		vehicleComments: {
			type: Number,
			default: 0,
		},

		vehicleRank: {
			type: Number,
			default: 0,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			ref: 'Member',
			required: true,
		},

		soldAt: {
			type: Date,
		},

		deletedAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
		collection: 'vehicles',
	},
);

export default VehicleSchema;
