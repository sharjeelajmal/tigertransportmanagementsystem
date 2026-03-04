import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const type = searchParams.get('type') || 'All';
        const date = searchParams.get('date') || '';

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

        if (date) {
            // Assuming date is in DD/MM/YYYY or similar string format, or just match exact string for now
            // For a 'pro' management page, we might want to handle date ranges or specific month/day
            query.invoiceDate = date;
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

        // Check for duplicate invoice number if necessary, but Mongoose unique should handle it
        const invoice = await Invoice.create(body);
        return NextResponse.json({ success: true, data: invoice }, { status: 201 });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to save invoice' },
            { status: 400 }
        );
    }
}
