import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOutsider extends Document {
    outsiderName: string;
    category: string;
    contactNo: string;
    contactPersonName: string;
    mobileNo: string;
    emergencyContactNo: string;
    address: string;
    lastAllocation: Date | null;
    balanceStatus: string;
    createdAt: Date;
    updatedAt: Date;
}

const OutsiderSchema: Schema<IOutsider> = new Schema(
    {
        outsiderName: { type: String, required: true },
        category: { type: String, enum: ['Vehicle Outsider', 'Labor Outsider', 'Both'], required: true },
        contactNo: { type: String, required: true },
        contactPersonName: { type: String, default: '' },
        mobileNo: { type: String, default: '' },
        emergencyContactNo: { type: String, default: '' },
        address: { type: String, default: '' },
        lastAllocation: { type: Date, default: null },
        balanceStatus: { type: String, enum: ['Clear', 'Payable'], default: 'Clear' },
    },
    {
        timestamps: true,
    }
);

let Outsider: Model<IOutsider>;

try {
    Outsider = mongoose.model<IOutsider>('Outsider');
} catch {
    Outsider = mongoose.model<IOutsider>('Outsider', OutsiderSchema);
}

export default Outsider;
