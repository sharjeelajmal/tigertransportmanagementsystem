import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Staff from '@/models/Staff';

// GET - Fetch all staff
export async function GET() {
    try {
        await dbConnect();
        const staff = await Staff.find({}, {
            firstName: 1, lastName: 1, mobile: 1,
            designation: 1, status: 1, cnic: 1, photo: 1
        }).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ success: true, data: staff });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch staff' },
            { status: 500 }
        );
    }
}

// POST - Create new staff
export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();

        const staff = await Staff.create(body);
        return NextResponse.json({ success: true, data: staff }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create staff' },
            { status: 400 }
        );
    }
}
