import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import { formatPrefixedInvoiceNo, invoiceNumberPrefix, parseInvoiceSerial } from '@/lib/ledgerRules';

export const dynamic = 'force-dynamic';

/**
 * GET /api/invoices/next-number?type=inbound|outbound|allocation
 * Returns TT0001 for customer bills, OT0001 for outsider (allocation) bills.
 */
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const type = (searchParams.get('type') || 'inbound').toLowerCase();
        const prefix = invoiceNumberPrefix(type);

        // Match prefixed series (TT#### / OT####). For TT, also include legacy digit-only numbers.
        const regex =
            prefix === 'TT'
                ? /^(TT)?\d+$/i
                : /^OT\d+$/i;

        const candidates = await Invoice.find({ invoiceNo: { $regex: regex } })
            .select('invoiceNo')
            .lean();

        let maxSerial = 0;
        for (const inv of candidates) {
            const serial = parseInvoiceSerial(String(inv.invoiceNo || ''));
            if (serial !== null && serial > maxSerial) maxSerial = serial;
        }

        const nextInvoiceNo = formatPrefixedInvoiceNo(prefix, maxSerial + 1);

        return NextResponse.json({ success: true, nextInvoiceNo, prefix });
    } catch (error) {
        console.error('[invoices/next-number] DB error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch next invoice number' },
            { status: 500 }
        );
    }
}
