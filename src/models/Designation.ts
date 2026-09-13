import mongoose, { Schema, models, Document } from 'mongoose';

export interface IDesignation extends Document {
    name: string;
    isDefault?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const DesignationSchema = new Schema<IDesignation>(
    {
        name: { type: String, required: true, unique: true, trim: true },
        isDefault: { type: Boolean, default: false },
    },
    { timestamps: true }
);

DesignationSchema.index({ name: 1 });

const Designation = models.Designation || mongoose.model<IDesignation>('Designation', DesignationSchema);
export default Designation;
