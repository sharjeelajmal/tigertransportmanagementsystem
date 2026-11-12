import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Outsider from '@/models/Outsider';
import { cascadePartyRename, isPartyNameTaken, nameChanged, type RenameResult } from '@/lib/partyRename';

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

        const existing = await Outsider.findById(id);
        if (!existing) {
            return NextResponse.json({ success: false, error: 'Outsider not found' }, { status: 404 });
        }

        // Name edits must carry the party's bills and ledger entries to the new name.
        let renamed: RenameResult | null = null;
        if (body.outsiderName !== undefined) {
            const newName = String(body.outsiderName ?? '').trim();
            if (!newName) {
                return NextResponse.json({ success: false, error: 'Outsider name is required' }, { status: 400 });
            }
            body.outsiderName = newName;
            if (nameChanged(existing.outsiderName, newName)) {
                if (await isPartyNameTaken('Outsider', newName, id)) {
                    return NextResponse.json(
                        { success: false, error: `Another outsider is already named "${newName}"` },
                        { status: 409 }
                    );
                }
                // Records first, party last: if anything fails, saving again finishes the move.
                renamed = await cascadePartyRename('Outsider', existing.outsiderName, newName);
            }
        }

        const updated = await Outsider.findByIdAndUpdate(id, body, {
            new: true,
        });
        if (!updated) {
            return NextResponse.json({ success: false, error: 'Outsider not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: updated, renamed }, { status: 200 });
    } catch (error) {
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
