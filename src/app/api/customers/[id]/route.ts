import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const customer = await Customer.findById(id);
        if (!customer) {
            return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: customer }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching customer:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch customer' }, { status: 500 });
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
        const updatedCustomer = await Customer.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });
        if (!updatedCustomer) {
            return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: updatedCustomer }, { status: 200 });
    } catch (error: any) {
        console.error('Error updating customer:', error);
        return NextResponse.json({ success: false, error: 'Failed to update customer' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const deletedCustomer = await Customer.findByIdAndDelete(id);
        if (!deletedCustomer) {
            return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Customer deleted successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('Error deleting customer:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete customer' }, { status: 500 });
    }
}
