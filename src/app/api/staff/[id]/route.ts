import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Staff from '@/models/Staff';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const staff = await Staff.findById(id);

        if (!staff) {
            return NextResponse.json({ message: 'Staff member not found' }, { status: 404 });
        }

        return NextResponse.json(staff, { status: 200 });
    } catch (error) {
        console.error('Error fetching staff member:', error);
        return NextResponse.json({ message: 'Error fetching staff member' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const updatedStaff = await Staff.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!updatedStaff) {
            return NextResponse.json({ message: 'Staff member not found' }, { status: 404 });
        }

        return NextResponse.json(updatedStaff, { status: 200 });
    } catch (error) {
        console.error('Error updating staff member:', error);
        return NextResponse.json({ message: 'Error updating staff member' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const deletedStaff = await Staff.findByIdAndDelete(id);

        if (!deletedStaff) {
            return NextResponse.json({ message: 'Staff member not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Staff member deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting staff member:', error);
        return NextResponse.json({ message: 'Error deleting staff member' }, { status: 500 });
    }
}
