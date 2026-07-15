import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';

// CRITICAL: Disable Next.js route caching for this endpoint.
// Without this, Next.js returns a stale cached response and the
// invoice number never increments past 0001.
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();

        // Find the invoice with the highest numeric invoice number.
        // collation with numericOrdering ensures "0009" < "0010" is respected.
        const latestInvoice = await Invoice.findOne({ invoiceNo: { $regex: /^\d+$/ } })
            .sort({ invoiceNo: -1 })
            .collation({ locale: 'en_US', numericOrdering: true })
            .lean();

        let nextNumber = 1;
        if (latestInvoice && latestInvoice.invoiceNo) {
            const currentNum = parseInt(String(latestInvoice.invoiceNo), 10);
            if (!isNaN(currentNum)) {
                nextNumber = currentNum + 1;
            }
        }

        // Format as 4 digits, e.g., "0001", "0002", "0010", ...
        const nextInvoiceNo = String(nextNumber).padStart(4, '0');

        return NextResponse.json({ success: true, nextInvoiceNo });
    } catch (error) {
        // Log server-side only — never expose internal errors to the client
        console.error('[invoices/next-number] DB error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch next invoice number' },
            { status: 500 }
        );
    }
}
