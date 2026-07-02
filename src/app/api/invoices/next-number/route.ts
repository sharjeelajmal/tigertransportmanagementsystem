import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';

export async function GET() {
    try {
        await dbConnect();
        
        // Find the invoice with the highest numeric invoice number
        const latestInvoice = await Invoice.findOne({ invoiceNo: { $regex: /^\\d+$/ } })
            .sort({ invoiceNo: -1 })
            .collation({ locale: "en_US", numericOrdering: true })
            .lean();

        let nextNumber = 1;
        if (latestInvoice && latestInvoice.invoiceNo) {
            const currentNum = parseInt(latestInvoice.invoiceNo, 10);
            if (!isNaN(currentNum)) {
                nextNumber = currentNum + 1;
            }
        }

        // Format as 4 digits, e.g., "0001"
        const nextInvoiceNo = String(nextNumber).padStart(4, '0');

        return NextResponse.json({ success: true, nextInvoiceNo });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch next invoice number' },
            { status: 500 }
        );
    }
}
