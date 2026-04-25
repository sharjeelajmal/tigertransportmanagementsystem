import mongoose, { Schema, Document, Model } from 'mongoose';

export type LedgerEntryType = 'Debit' | 'Credit';
export type LedgerPartyType = 'Customer' | 'Outsider' | 'Both';
export type LedgerSourceType = 'Invoice' | 'Receipt' | 'Payment' | 'Allocation';

export interface ILedgerEntry extends Document {
    partyName: string;           // Normalized name (case-insensitive search key)
    partyType: LedgerPartyType;  // Role of the party
    entryType: LedgerEntryType;  // 'Debit' (money owed to us / we owe) or 'Credit' (money received / we paid)
    date: Date;                  // Transaction date
    docNo: string;               // Invoice No, RCPT-XXX, ALLOC-XXX, etc.
    narration: string;           // Description e.g. "August Bills Amount", "Cash Received"
    amount: number;              // Transaction amount (always positive)
    sourceType: LedgerSourceType;
    sourceId: string;            // ObjectId of the source document (Invoice, etc.)
    createdAt: Date;
    updatedAt: Date;
}

const LedgerEntrySchema: Schema<ILedgerEntry> = new Schema(
    {
        partyName: {
            type: String,
            required: true,
            trim: true,
        },
        partyType: {
            type: String,
            enum: ['Customer', 'Outsider', 'Both'],
            required: true,
        },
        entryType: {
            type: String,
            enum: ['Debit', 'Credit'],
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        docNo: {
            type: String,
            required: true,
            trim: true,
        },
        narration: {
            type: String,
            required: true,
            trim: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        sourceType: {
            type: String,
            enum: ['Invoice', 'Receipt', 'Payment', 'Allocation'],
            required: true,
        },
        sourceId: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for fast party lookups (case-insensitive via collation on query)
LedgerEntrySchema.index({ partyName: 1 });
LedgerEntrySchema.index({ date: -1 });
LedgerEntrySchema.index({ partyName: 1, date: -1 });

let LedgerEntry: Model<ILedgerEntry>;

try {
    LedgerEntry = mongoose.model<ILedgerEntry>('LedgerEntry');
} catch {
    LedgerEntry = mongoose.model<ILedgerEntry>('LedgerEntry', LedgerEntrySchema);
}

export default LedgerEntry;
