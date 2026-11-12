import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import { cascadePartyRename, isPartyNameTaken, nameChanged, type RenameResult } from '@/lib/partyRename';

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

        const existing = await Customer.findById(id);
        if (!existing) {
            return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
        }

        // Name edits must carry the party's bills and ledger entries to the new name.
        let renamed: RenameResult | null = null;
        if (body.customerName !== undefined) {
            const newName = String(body.customerName ?? '').trim();
            if (!newName) {
                return NextResponse.json({ success: false, error: 'Customer name is required' }, { status: 400 });
            }
            body.customerName = newName;
            if (nameChanged(existing.customerName, newName)) {
                if (await isPartyNameTaken('Customer', newName, id)) {
                    return NextResponse.json(
                        { success: false, error: `Another customer is already named "${newName}"` },
                        { status: 409 }
                    );
                }
                // Records first, party last: if anything fails, saving again finishes the move.
                renamed = await cascadePartyRename('Customer', existing.customerName, newName);
            }
        }

        const updated = await Customer.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });
        if (!updated) {
            return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: updated, renamed }, { status: 200 });
    } catch (error) {
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
