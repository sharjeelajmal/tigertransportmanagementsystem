import mongoose, { Schema, Document } from 'mongoose';

export interface IReminder extends Document {
    details: string;
    reminderDate: Date;
    reminderTime: string;
    isCompleted: boolean;
}

const ReminderSchema: Schema = new Schema({
    details: { type: String, required: true },
    reminderDate: { type: Date, required: true },
    reminderTime: { type: String, required: true },
    isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Reminder || mongoose.model<IReminder>('Reminder', ReminderSchema);
