import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import LedgerEntry from '@/models/LedgerEntry';
import { invoiceLedgerMeta, parseLedgerDate } from '@/lib/ledgerRules';

export async function DELETE(
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

        const deletedInvoice = await Invoice.findByIdAndDelete(id);

        if (!deletedInvoice) {
            return NextResponse.json(
                { success: false, error: 'Invoice not found' },
                { status: 404 }
            );
        }

        // Keep ledger in sync with deleted invoice
        try {
            await LedgerEntry.deleteMany({ sourceType: 'Invoice', sourceId: id });
        } catch (ledgerErr) {
            console.error('[Ledger] Failed to delete linked ledger entry:', ledgerErr);
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

                const payload = {
                    partyName: resolvedPartyName,
                    partyType: ledger.partyType,
                    entryType: ledger.entryType,
                    date: entryDate,
                    docNo: invoice.invoiceNo || body.invoiceNo || 'N/A',
                    narration: ledger.narration,
                    amount: Math.max(0, Number(invoice.totalAmount ?? body.totalAmount) || 0),
                };

                const updatedLedger = await LedgerEntry.findOneAndUpdate(
                    { sourceType: 'Invoice', sourceId: id },
                    payload,
                    { returnDocument: 'after' }
                );

                if (!updatedLedger) {
                    await LedgerEntry.create({
                        ...payload,
                        sourceType: 'Invoice',
                        sourceId: id,
                    });
                }
            } catch (ledgerErr) {
                console.error('[Ledger] Auto ledger update failed (non-critical):', ledgerErr);
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
