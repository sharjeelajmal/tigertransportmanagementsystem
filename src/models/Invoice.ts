import mongoose, { Schema, Document } from "mongoose";

export interface IInvoice extends Document {
    type: "inbound" | "outbound" | "allocation";
    invoiceNo: string;
    billingDate: string;
    invoiceDate: string;
    clientName?: string;
    clientPhone?: string;
    clientAddress?: string;
    partyName?: string;
    vehicleNo?: string;
    vehicleDetail?: string;
    upcountryVehicle?: string;
    pickupFrom?: string;
    deliverTo?: string;
    remarks?: string;
    items: {
        id: string;
        cargoDetails: string;
        vehicle: string;
        rate: number;
        qty: number;
    }[];
    subtotal: number;
    discount: number;
    advance: number;
    totalAmount: number;
    remainingAmount: number;
    createdAt: Date;
}

const InvoiceSchema: Schema = new Schema({
    type: { type: String, required: true, enum: ["inbound", "outbound", "allocation"] },
    invoiceNo: { type: String, required: true, unique: true },
    billingDate: { type: String, required: true },
    invoiceDate: { type: String, required: true },
    clientName: { type: String },
    clientPhone: { type: String },
    clientAddress: { type: String },
    partyName: { type: String },
    vehicleNo: { type: String },
    vehicleDetail: { type: String },
    upcountryVehicle: { type: String },
    pickupFrom: { type: String },
    deliverTo: { type: String },
    remarks: { type: String },
    items: [
        {
            id: { type: String, required: true },
            cargoDetails: { type: String, required: true },
            vehicle: { type: String },
            rate: { type: Number, required: true },
            qty: { type: Number, required: true },
        },
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    advance: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    remainingAmount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);
