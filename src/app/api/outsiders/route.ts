import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Outsider from '@/models/Outsider';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const outsiders = await Outsider.find().sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: outsiders }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching outsiders:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch outsiders' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const newOutsider = await Outsider.create(body);
        return NextResponse.json({ success: true, data: newOutsider }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating outsider:', error);
        return NextResponse.json({ success: false, error: 'Failed to create outsider' }, { status: 500 });
    }
}
