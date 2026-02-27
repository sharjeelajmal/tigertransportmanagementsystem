import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import OutsiderAllocation from '@/models/OutsiderAllocation';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Await params according to Next.js 15
) {
    try {
        await dbConnect();
        const { id } = await params;

        const deletedAllocation = await OutsiderAllocation.findByIdAndDelete(id);

        if (!deletedAllocation) {
            return NextResponse.json({ success: false, error: 'Allocation not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: {} }, { status: 200 });
    } catch (error: any) {
        console.error('Error deleting allocation:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete allocation' }, { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const allocation = await OutsiderAllocation.findById(id).populate('outsider');

        if (!allocation) {
            return NextResponse.json({ success: false, error: 'Allocation not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: allocation }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching allocation:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch allocation' }, { status: 500 });
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

        // Auto-calculate payment status
        if (body.totalAmount !== undefined && body.paidAmount !== undefined) {
            if (body.paidAmount >= body.totalAmount) {
                body.paymentStatus = 'Paid';
            } else if (body.paidAmount > 0) {
                body.paymentStatus = 'Partial Paid';
            } else {
                body.paymentStatus = 'Unpaid';
            }
        }

        const updated = await OutsiderAllocation.findByIdAndUpdate(id, body, { new: true }).populate('outsider');

        if (!updated) {
            return NextResponse.json({ success: false, error: 'Allocation not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updated }, { status: 200 });
    } catch (error: any) {
        console.error('Error updating allocation:', error);
        return NextResponse.json({ success: false, error: 'Failed to update allocation' }, { status: 500 });
    }
}
