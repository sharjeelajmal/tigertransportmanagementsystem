import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import LedgerEntry from '@/models/LedgerEntry';

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        // Next.js 15 requires unboxing params
        const params = await context.params;
        const id = params.id;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Invoice ID is required' },
                { status: 400 }
            );
        }

        const deletedInvoice = await Invoice.findByIdAndDelete(id);

        if (!deletedInvoice) {
            return NextResponse.json(
                { success: false, error: 'Invoice not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: 'Invoice deleted successfully' });
    } catch (error: any) {
        console.error('DELETE API Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete invoice' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const params = await context.params;
        const id = params.id;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Invoice ID is required' },
                { status: 400 }
            );
        }

        const body = await request.json();
        
        const invoice = await Invoice.findByIdAndUpdate(id, body, { returnDocument: 'after', runValidators: true });

        if (!invoice) {
            return NextResponse.json(
                { success: false, error: 'Invoice not found' },
                { status: 404 }
            );
        }

        // ── Auto-update Debit entry in LedgerEntry ───────────────────────────
        const rawType: string = (invoice.type || body.type || '').toLowerCase();
        const resolvedPartyName: string = (
            rawType === 'allocation'
                ? (invoice.partyName || body.partyName || '')
                : (invoice.clientName || body.clientName || '')
        ).trim();

        if (resolvedPartyName) {
            try {
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

                const updatedLedger = await LedgerEntry.findOneAndUpdate(
                    { sourceType: 'Invoice', sourceId: id },
                    {
                        partyName: resolvedPartyName,
                        partyType: rawType === 'allocation' ? 'Outsider' : 'Customer',
                        date: entryDate,
                        docNo: invoice.invoiceNo || body.invoiceNo || 'N/A',
                        narration: billingLabel,
                        amount: Math.max(0, Number(invoice.totalAmount ?? body.totalAmount) || 0),
                    },
                    { returnDocument: 'after' }
                );

                if (!updatedLedger) {
                    await LedgerEntry.create({
                        partyName: resolvedPartyName,
                        partyType: rawType === 'allocation' ? 'Outsider' : 'Customer',
                        entryType: 'Debit',
                        date: entryDate,
                        docNo: invoice.invoiceNo || body.invoiceNo || 'N/A',
                        narration: billingLabel,
                        amount: Math.max(0, Number(invoice.totalAmount ?? body.totalAmount) || 0),
                        sourceType: 'Invoice',
                        sourceId: id,
                    });
                }
            } catch (ledgerErr) {
                console.error('[Ledger] Auto-debit update failed (non-critical):', ledgerErr);
            }
        }

        return NextResponse.json({ success: true, data: invoice });
    } catch (error: any) {
        console.error('PUT API Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update invoice' },
            { status: 500 }
        );
    }
}
