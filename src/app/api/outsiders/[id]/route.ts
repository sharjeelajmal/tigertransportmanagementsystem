import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Outsider from '@/models/Outsider';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const outsider = await Outsider.findById(id);
        if (!outsider) {
            return NextResponse.json({ success: false, error: 'Outsider not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: outsider }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching outsider:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch outsider' }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();
        const updatedOutsider = await Outsider.findByIdAndUpdate(id, body, { new: true });
        if (!updatedOutsider) {
            return NextResponse.json({ success: false, error: 'Outsider not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: updatedOutsider }, { status: 200 });
    } catch (error: any) {
        console.error('Error updating outsider:', error);
        return NextResponse.json({ success: false, error: 'Failed to update outsider' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const deletedOutsider = await Outsider.findByIdAndDelete(id);
        if (!deletedOutsider) {
            return NextResponse.json({ success: false, error: 'Outsider not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: {} }, { status: 200 });
    } catch (error: any) {
        console.error('Error deleting outsider:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete outsider' }, { status: 500 });
    }
}
