import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import LedgerEntry from '@/models/LedgerEntry';

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

        // ── Auto-push Debit entry to LedgerEntry ──────────────────────────────
        // Read partyName from the saved invoice doc;
        // allocation invoices store the vendor in partyName, all others use clientName.
        // Also fall back to the raw body in case mongoose lean doesn't surface the field.
        const rawType: string = (invoice.type || body.type || '').toLowerCase();
        const resolvedPartyName: string = (
            rawType === 'allocation'
                ? (invoice.partyName || body.partyName || '')
                : (invoice.clientName || body.clientName || '')
        ).trim();

        if (resolvedPartyName) {
            try {
                // ── Build narration from billingDate ──────────────────────────
                // billingDate is stored as YYYY-MM-DD string.
                // We split manually instead of using new Date() to avoid UTC offset.
                const billingDateStr: string = invoice.billingDate || body.billingDate || '';
                let billingLabel = 'Invoice Amount';
                if (billingDateStr) {
                    const parts = billingDateStr.split('-');
                    if (parts.length >= 2) {
                        const year = parts[0];
                        const month = parseInt(parts[1], 10) - 1; // 0-indexed
                        const monthName = new Date(Number(year), month, 1).toLocaleString('en-US', { month: 'long' });
                        billingLabel = `${monthName} ${year} Bills Amount`;
                    }
                }

                let entryDate = new Date();
                const rawDate = billingDateStr || invoice.createdAt;
                if (rawDate) {
                    const parsed = new Date(rawDate);
                    if (!isNaN(parsed.getTime())) entryDate = parsed;
                }

                await LedgerEntry.create({
                    partyName: resolvedPartyName,
                    partyType: rawType === 'allocation' ? 'Outsider' : 'Customer',
                    entryType: 'Debit',
                    date: entryDate,
                    docNo: invoice.invoiceNo || body.invoiceNo || 'N/A',
                    narration: billingLabel,
                    amount: Math.max(0, Number(invoice.totalAmount ?? body.totalAmount) || 0),
                    sourceType: 'Invoice',
                    sourceId: String(invoice._id),
                });

                console.log(`[Ledger] Debit entry created → Party: "${resolvedPartyName}" | Doc: ${invoice.invoiceNo} | Amount: ${invoice.totalAmount}`);
            } catch (ledgerErr) {
                // Ledger write failure must NOT rollback the invoice
                console.error('[Ledger] Auto-debit failed (non-critical):', ledgerErr);
            }
        } else {
            console.warn('[Ledger] Skipped ledger entry — no party name found on invoice:', invoice.invoiceNo);
        }
        // ─────────────────────────────────────────────────────────────────────

        return NextResponse.json({ success: true, data: invoice }, { status: 201 });
    } catch (error: any) {
        console.error('API Error:', error);
        
        // Handle MongoDB duplicate key error for invoiceNo
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
