import mongoose, { Schema, models } from 'mongoose';

export interface IExpense {
    date: string;
    category: 'Vehicle Expense' | 'Office Expense';
    expenseType: string;
    // Vehicle Expense fields
    vehicleNo?: string;
    driverName?: string;
    helperName?: string;
    route?: string;
    // Office Expense fields
    amountGivenTo?: string;
    // Shared
    remarks?: string;
    // Payment
    totalAmount: number;
    paidAmount?: number;
    remainingAmount?: number;
    paymentMethod?: string;
    status: 'Paid' | 'Unpaid' | 'Partial Paid';
}

const ExpenseSchema = new Schema<IExpense>(
    {
        date: { type: String, required: true },
        category: { type: String, required: true, enum: ['Vehicle Expense', 'Office Expense'] },
        expenseType: { type: String, required: true, trim: true },
        vehicleNo: { type: String, trim: true },
        driverName: { type: String, trim: true },
        helperName: { type: String, trim: true },
        route: { type: String, trim: true },
        amountGivenTo: { type: String, trim: true },
        remarks: { type: String, trim: true },
        totalAmount: { type: Number, required: true },
        paidAmount: { type: Number, default: 0 },
        remainingAmount: { type: Number, default: 0 },
        paymentMethod: { type: String, trim: true },
        status: { type: String, required: true, enum: ['Paid', 'Unpaid', 'Partial Paid'], default: 'Unpaid' },
    },
    { timestamps: true }
);

ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1 });
ExpenseSchema.index({ status: 1 });

const Expense = models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
export default Expense;
