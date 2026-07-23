import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import LedgerEntry from '@/models/LedgerEntry';
import { invoiceLedgerMeta, parseLedgerDate } from '@/lib/ledgerRules';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const type = searchParams.get('type') || 'All';
        const startDate = searchParams.get('startDate') || '';
        const endDate = searchParams.get('endDate') || '';
        const specificDate = searchParams.get('date') || '';

        let query: any = {};

        if (search) {
            query.$or = [
                { invoiceNo: { $regex: search, $options: 'i' } },
                { clientName: { $regex: search, $options: 'i' } },
                { partyName: { $regex: search, $options: 'i' } },
            ];
        }

        if (type !== 'All') {
            query.type = type.toLowerCase();
        }

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate + 'T23:59:59'),
            };
        } else if (specificDate) {
            query.invoiceDate = specificDate;
        }

        const invoices = await Invoice.find(query).sort({ createdAt: -1 }).lean();

        return NextResponse.json({ success: true, data: invoices });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch invoices' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();

        const invoice = await Invoice.create(body);

        // ── Auto-push ledger entry (TT → Debit / OT → Credit) ─────────────────
        const rawType: string = (invoice.type || body.type || '').toLowerCase();
        const ledger = invoiceLedgerMeta(rawType);
        const resolvedPartyName: string = (
            rawType === 'allocation'
                ? (invoice.partyName || body.partyName || '')
                : (invoice.clientName || body.clientName || '')
        ).trim();

        if (resolvedPartyName) {
            try {
                const billingDateStr: string = invoice.billingDate || body.billingDate || '';
                const entryDate = parseLedgerDate(billingDateStr || invoice.createdAt);

                await LedgerEntry.create({
                    partyName: resolvedPartyName,
                    partyType: ledger.partyType,
                    entryType: ledger.entryType,
                    date: entryDate,
                    docNo: invoice.invoiceNo || body.invoiceNo || 'N/A',
                    narration: ledger.narration,
                    amount: Math.max(0, Number(invoice.totalAmount ?? body.totalAmount) || 0),
                    sourceType: 'Invoice',
                    sourceId: String(invoice._id),
                });

                console.log(`[Ledger] ${ledger.entryType} entry created → Party: "${resolvedPartyName}" | Doc: ${invoice.invoiceNo} | ${ledger.narration}`);
            } catch (ledgerErr) {
                console.error('[Ledger] Auto ledger write failed (non-critical):', ledgerErr);
            }
        } else {
            console.warn('[Ledger] Skipped ledger entry — no party name found on invoice:', invoice.invoiceNo);
        }

        return NextResponse.json({ success: true, data: invoice }, { status: 201 });
    } catch (error: any) {
        console.error('API Error:', error);

        if (error.code === 11000 && error.keyPattern && error.keyPattern.invoiceNo) {
            return NextResponse.json(
                { success: false, error: 'Yeh Invoice Number already exist karta hai. Please page refresh karein taake naya number assign ho.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to save invoice' },
            { status: 400 }
        );
    }
}
