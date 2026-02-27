import mongoose, { Schema, Document } from 'mongoose';

export interface IOutsiderAllocation extends Document {
    outsider: mongoose.Types.ObjectId;
    customerName: string;
    allocationDate: Date; // Legacy or created date

    // Trip Details
    tripDate: Date;
    tripTime: string;
    pickupLocation: string;
    dropLocation: string;

    // Vehicle Details
    vehicleQty: number; // Usually matches vehicles.length
    vehicles?: { vehicleName: string; vehicleNo: string; driverName: string }[];
    remarksVehicle?: string;

    // Labor Details
    laborQty: number; // No. of Laborers
    laborNames?: string; // Names of Laborers
    remarksLabor?: string;

    // Payment Details
    totalAmount: number;
    paidAmount: number;
    paymentStatus: 'Paid' | 'Unpaid' | 'Partial Paid';
    remarksPayment?: string;

    description?: string; // Legacy
}

const OutsiderAllocationSchema: Schema = new Schema({
    outsider: { type: Schema.Types.ObjectId, ref: 'Outsider', required: true },
    customerName: { type: String, required: true },
    allocationDate: { type: Date, default: Date.now },

    tripDate: { type: Date },
    tripTime: { type: String },
    pickupLocation: { type: String },
    dropLocation: { type: String },

    vehicleQty: { type: Number, default: 0 },
    vehicles: [{
        vehicleName: { type: String },
        vehicleNo: { type: String },
        driverName: { type: String }
    }],
    remarksVehicle: { type: String },

    laborQty: { type: Number, default: 0 },
    laborNames: { type: String },
    remarksLabor: { type: String },

    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Unpaid', 'Partial Paid'],
        default: 'Unpaid'
    },
    remarksPayment: { type: String },

    description: { type: String }
}, { timestamps: true });

export default mongoose.models.OutsiderAllocation || mongoose.model<IOutsiderAllocation>('OutsiderAllocation', OutsiderAllocationSchema);
