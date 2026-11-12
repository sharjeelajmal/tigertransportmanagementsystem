import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import LedgerEntry from '@/models/LedgerEntry';
import { getRequestSession } from '@/lib/auth';
import { cashNarration, ymdToLedgerDate } from '@/lib/ledgerRules';

/**
 * Correction of manual ledger entries (Cash Received / Cash Paid).
 * Bill entries (sourceType "Invoice") are changed from the invoice itself and are rejected here.
 */
const EDITABLE_SOURCES = ['Receipt', 'Payment'];
const MAX_AMOUNT = 1_000_000_000;

interface Params { params: Promise<{ id: string }> }

type Guard = { ok: true } | { ok: false; res: NextResponse };

async function guard(req: NextRequest, id: string, needsAdmin = false): Promise<Guard> {
    const session = await getRequestSession(req);
    if (!session) return { ok: false, res: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
    if (needsAdmin && session.role !== 'admin') {
        return { ok: false, res: NextResponse.json({ success: false, error: 'Only admin can delete entries' }, { status: 403 }) };
    }
    if (!mongoose.isValidObjectId(id)) {
        return { ok: false, res: NextResponse.json({ success: false, error: 'Invalid entry id' }, { status: 400 }) };
    }
    return { ok: true };
}

async function findManualEntry(id: string) {
    const entry = await LedgerEntry.findById(id);
    if (!entry) return { error: NextResponse.json({ success: false, error: 'Entry not found' }, { status: 404 }) };
    if (!EDITABLE_SOURCES.includes(entry.sourceType)) {
        return {
            error: NextResponse.json(
                { success: false, error: 'Bill entries are corrected from the invoice, not from the ledger' },
                { status: 409 }
            ),
        };
    }
    return { entry };
}

// PATCH /api/ledger/entries/:id  { entryType?, date?, amount?, docNo? }
export async function PATCH(request: NextRequest, { params }: Params) {
    const { id } = await params;
    const g = await guard(request, id);
    if (!g.ok) return g.res;

    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const update: Record<string, unknown> = {};

    if (body.entryType !== undefined) {
        if (body.entryType !== 'Debit' && body.entryType !== 'Credit') {
            return NextResponse.json({ success: false, error: 'Entry type must be Debit or Credit' }, { status: 400 });
        }
        update.entryType = body.entryType;
        update.narration = cashNarration(body.entryType);
        update.sourceType = body.entryType === 'Credit' ? 'Receipt' : 'Payment';
    }
    if (body.date !== undefined) {
        const date = ymdToLedgerDate(String(body.date));
        if (!date) return NextResponse.json({ success: false, error: 'A valid date (YYYY-MM-DD) is required' }, { status: 400 });
        update.date = date;
    }
    if (body.amount !== undefined) {
        const amount = Number(body.amount);
        if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) {
            return NextResponse.json({ success: false, error: 'Amount must be greater than 0' }, { status: 400 });
        }
        update.amount = Math.round(amount * 100) / 100;
    }
    if (body.docNo !== undefined) {
        const docNo = String(body.docNo ?? '').trim();
        if (docNo) update.docNo = docNo.slice(0, 100);
    }
    if (Object.keys(update).length === 0) {
        return NextResponse.json({ success: false, error: 'Nothing to update' }, { status: 400 });
    }

    try {
        await dbConnect();
        const found = await findManualEntry(id);
        if (found.error) return found.error;

        found.entry.set(update);
        await found.entry.save();
        return NextResponse.json({ success: true, data: found.entry });
    } catch (error) {
        console.error('[Ledger] Entry update failed:', error);
        return NextResponse.json({ success: false, error: 'Failed to update entry' }, { status: 500 });
    }
}

// DELETE /api/ledger/entries/:id  (admin only)
export async function DELETE(request: NextRequest, { params }: Params) {
    const { id } = await params;
    const g = await guard(request, id, true);
    if (!g.ok) return g.res;

    try {
        await dbConnect();
        const found = await findManualEntry(id);
        if (found.error) return found.error;

        await found.entry.deleteOne();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Ledger] Entry delete failed:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete entry' }, { status: 500 });
    }
}
