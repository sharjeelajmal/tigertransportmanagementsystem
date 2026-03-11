import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';

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
                $lte: new Date(endDate + 'T23:59:59') 
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
