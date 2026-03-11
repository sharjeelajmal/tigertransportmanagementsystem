import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        let query: any = {};
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate + 'T23:59:59')
            };
        } else if (startDate) {
            query.createdAt = { $gte: new Date(startDate) };
        } else if (endDate) {
            query.createdAt = { $lte: new Date(endDate + 'T23:59:59') };
        }

        const customers = await Customer.find(query).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: customers }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch customers' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        
        // Only customerName is really required by business logic as per user request
        if (!body.customerName) {
            return NextResponse.json({ success: false, error: 'Customer Name is required' }, { status: 400 });
        }

        const newCustomer = await Customer.create(body);
        return NextResponse.json({ success: true, data: newCustomer }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating customer:', error);
        return NextResponse.json({ success: false, error: 'Failed to create customer' }, { status: 500 });
    }
}
