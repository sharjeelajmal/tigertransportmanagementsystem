import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomer extends Document {
    customerName: string;
    mobileNo: string;
    emergencyNo: string;
    address: string;
    email: string;
    refPerson: string;
    remarks: string;
    createdAt: Date;
    updatedAt: Date;
}

const CustomerSchema: Schema<ICustomer> = new Schema(
    {
        customerName: { type: String, required: true },
        mobileNo: { type: String, default: '' },
        emergencyNo: { type: String, default: '' },
        address: { type: String, default: '' },
        email: { type: String, default: '' },
        refPerson: { type: String, default: '' },
        remarks: { type: String, default: '' },
    },
    {
        timestamps: true,
    }
);

let Customer: Model<ICustomer>;

try {
    Customer = mongoose.model<ICustomer>('Customer');
} catch {
    Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
}

export default Customer;
