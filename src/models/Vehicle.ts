import mongoose, { Schema, models } from 'mongoose';

export interface IVehicle {
    plateNumber: string;
    vehicleName: string;
    modelYear: number;
    status: 'Available' | 'On Route' | 'Under Maintenance' | 'Out of Service';
    engineNumber?: string;
    chassisNumber?: string;
    ownerName?: string;
    routePermitExpiry?: Date;
    tokenTaxExpiry?: Date;
    insuranceExpiry?: Date;
    fitnessExpiry?: Date;
    trackerExpiry?: Date;
}

const VehicleSchema = new Schema<IVehicle>(
    {
        plateNumber: { type: String, required: true, unique: true, trim: true },
        vehicleName: { type: String, required: true, trim: true },
        modelYear: { type: Number, required: true },
        status: {
            type: String,
            enum: ['Available', 'On Route', 'Under Maintenance', 'Out of Service'],
            default: 'Available',
        },
        engineNumber: { type: String, trim: true },
        chassisNumber: { type: String, trim: true },
        ownerName: { type: String, trim: true },
        routePermitExpiry: { type: Date },
        tokenTaxExpiry: { type: Date },
        insuranceExpiry: { type: Date },
        fitnessExpiry: { type: Date },
        trackerExpiry: { type: Date },
    },
    { timestamps: true }
);

const Vehicle = models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);
export default Vehicle;
