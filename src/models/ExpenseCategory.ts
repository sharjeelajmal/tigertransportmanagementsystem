import mongoose, { Schema, models, Document } from 'mongoose';

export interface IExpenseCategory extends Document {
    name: string;
    subtypes: string[];
    isDefault?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const ExpenseCategorySchema = new Schema<IExpenseCategory>(
    {
        name: { type: String, required: true, unique: true, trim: true },
        subtypes: { type: [String], default: [] },
        isDefault: { type: Boolean, default: false },
    },
    { timestamps: true }
);

ExpenseCategorySchema.index({ name: 1 });

const ExpenseCategory = models.ExpenseCategory || mongoose.model<IExpenseCategory>('ExpenseCategory', ExpenseCategorySchema);
export default ExpenseCategory;
