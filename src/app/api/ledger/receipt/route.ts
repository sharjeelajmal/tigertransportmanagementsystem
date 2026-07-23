import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LedgerEntry from '@/models/LedgerEntry';
import { LedgerPartyType } from '@/models/LedgerEntry';
import { cashNarration } from '@/lib/ledgerRules';

// ─── POST /api/ledger/receipt ─────────────────────────────────────────────────
// Credit = Cash Received | Debit = Cash Paid (Excel pattern)

interface ReceiptPayload {
    partyName: string;
    partyType: LedgerPartyType;
    entryType: 'Debit' | 'Credit';
    date: string;          // ISO date string YYYY-MM-DD
    docNo?: string;        // Optional; auto-generated if not provided
    narration?: string;
    amount: number;
}

// Auto-generate doc numbers: RCPT-YYYYMMDD-XXXXX
async function generateDocNo(prefix: string): Promise<string> {
    const count = await LedgerEntry.countDocuments({ sourceType: prefix === 'RCPT' ? 'Receipt' : 'Payment' });
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `${prefix}-${datePart}-${String(count + 1).padStart(4, '0')}`;
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body: ReceiptPayload = await request.json();

        // ── Validation ─────────────────────────────────────────────────────
        if (!body.partyName?.trim()) {
            return NextResponse.json({ success: false, error: 'Party name is required' }, { status: 400 });
        }
        if (!body.amount || body.amount <= 0) {
            return NextResponse.json({ success: false, error: 'Amount must be greater than 0' }, { status: 400 });
        }
        if (!body.date) {
            return NextResponse.json({ success: false, error: 'Date is required' }, { status: 400 });
        }
        if (!['Debit', 'Credit'].includes(body.entryType)) {
            return NextResponse.json({ success: false, error: 'Entry type must be Debit or Credit' }, { status: 400 });
        }

        // ── Build doc number ───────────────────────────────────────────────
        const isCredit = body.entryType === 'Credit';
        const docNo = body.docNo?.trim() || (await generateDocNo(isCredit ? 'RCPT' : 'PMT'));
        // Excel pattern: always use fixed narrations
        const narration = cashNarration(body.entryType);

        // ── Create ledger entry ────────────────────────────────────────────
        const entry = await LedgerEntry.create({
            partyName: body.partyName.trim(),
            partyType: body.partyType || 'Customer',
            entryType: body.entryType,
            date: new Date(body.date),
            docNo,
            narration,
            amount: body.amount,
            sourceType: isCredit ? 'Receipt' : 'Payment',
            sourceId: docNo, // Self-referential for manual entries
        });

        return NextResponse.json({ success: true, data: entry }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating ledger entry:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create ledger entry' },
            { status: 500 }
        );
    }
}
