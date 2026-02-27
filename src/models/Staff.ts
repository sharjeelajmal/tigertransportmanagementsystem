import mongoose, { Schema, models } from 'mongoose';

export interface IStaff {
    firstName: string;
    lastName: string;
    cnic: string;
    guarantorName: string;
    guarantorContact: string;
    mobile: string;
    emergencyContact: string;
    address: string;
    designation: string;
    basicSalary: number;
    photo?: string;
    status: 'On Duty' | 'Off Duty';

    // New Fields
    dateOfBirth?: Date;
    maritalStatus?: string;
    email?: string;
    permanentAddress?: string;

    joiningDate?: Date;
    dutyTime?: string;

    // Driver Specific
    licenseNo?: string;
    licenseType?: string;
    issuingAuthority?: string;
    licenseIssueDate?: Date;
    licenseExpiryDate?: Date;
    vehiclesAllowed?: string[];
    driverType?: string;
    experience?: string;

    // Payroll Extended
    allowance?: number;
    increment?: number;
    payPerTrip?: number;
}

const StaffSchema = new Schema<IStaff>(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        cnic: { type: String, required: true, trim: true },
        guarantorName: { type: String, trim: true },
        guarantorContact: { type: String, trim: true },
        mobile: { type: String, required: true, trim: true },
        emergencyContact: { type: String, trim: true },
        address: { type: String, trim: true },
        designation: {
            type: String,
            required: true,
            enum: ['Operation Manager', 'Transport Manager', 'Warehouse Supervisor', 'Labor', 'Driver', 'Admin', 'Office Staff'],
        },
        basicSalary: { type: Number, required: true },
        photo: { type: String },
        status: { type: String, enum: ['On Duty', 'Off Duty'], default: 'On Duty' },

        // New Fields
        dateOfBirth: { type: Date },
        maritalStatus: { type: String, trim: true },
        email: { type: String, trim: true },
        permanentAddress: { type: String, trim: true },

        joiningDate: { type: Date },
        dutyTime: { type: String, trim: true },

        // Driver Specific
        licenseNo: { type: String, trim: true },
        licenseType: { type: String, trim: true },
        issuingAuthority: { type: String, trim: true },
        licenseIssueDate: { type: Date },
        licenseExpiryDate: { type: Date },
        vehiclesAllowed: [{ type: String, trim: true }],
        driverType: { type: String, trim: true },
        experience: { type: String, trim: true },

        // Payroll Extended
        allowance: { type: Number, default: 0 },
        increment: { type: Number, default: 0 },
        payPerTrip: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Indexes for fast queries and sorting
StaffSchema.index({ createdAt: -1 });
StaffSchema.index({ designation: 1, status: 1 });

const Staff = models.Staff || mongoose.model<IStaff>('Staff', StaffSchema);
export default Staff;
