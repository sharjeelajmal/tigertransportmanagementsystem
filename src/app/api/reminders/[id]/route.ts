import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Reminder from '@/models/Reminder';

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();
        const updated = await Reminder.findByIdAndUpdate(id, body, { new: true });
        if (!updated) return NextResponse.json({ success: false, error: 'Reminder not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: updated }, { status: 200 });
    } catch (error: any) {
        console.error('Error updating reminder:', error);
        return NextResponse.json({ success: false, error: 'Failed to update reminder' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const deleted = await Reminder.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ success: false, error: 'Reminder not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: {} }, { status: 200 });
    } catch (error: any) {
        console.error('Error deleting reminder:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete reminder' }, { status: 500 });
    }
}
