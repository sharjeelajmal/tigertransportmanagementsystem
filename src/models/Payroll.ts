import mongoose, { Schema } from "mongoose";

const payrollSchema = new Schema(
    {
        staffId: {
            type: Schema.Types.ObjectId,
            ref: "Staff",
            required: true,
        },
        month: {
            type: String, // format YYYY-MM
            required: true,
        },
        basicSalary: {
            type: Number,
            required: true,
        },
        // Earnings
        allowance: {
            type: Number,
            default: 0,
        },
        bonus: {
            type: Number,
            default: 0,
        },
        overtimeHours: {
            type: Number,
            default: 0,
        },
        overtimeRate: {
            type: Number,
            default: 0,
        },
        otherEarnings: {
            type: Number,
            default: 0,
        },
        // Deductions
        absentDays: {
            type: Number,
            default: 0,
        },
        absentFinePerDay: {
            type: Number,
            default: 0,
        },
        advanceDeduction: {
            type: Number,
            default: 0,
        },
        advanceIds: [{
            type: Schema.Types.ObjectId,
            ref: "Advance"
        }],
        fine: {
            type: Number,
            default: 0,
        },
        otherDeductions: {
            type: Number,
            default: 0,
        },
        // Totals
        totalEarnings: {
            type: Number,
            required: true,
        },
        totalDeductions: {
            type: Number,
            required: true,
        },
        netSalary: {
            type: Number,
            required: true,
        },
        paymentDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["Paid", "Unpaid"],
            default: "Paid",
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure 1 payroll per staff per month
payrollSchema.index({ staffId: 1, month: 1 }, { unique: true });

const Payroll = mongoose.models.Payroll || mongoose.model("Payroll", payrollSchema);

export default Payroll;
