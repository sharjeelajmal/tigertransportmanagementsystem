import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';

interface Params { params: Promise<{ id: string }> }

function normalizeDate(val: unknown): string | undefined {
    if (!val) return undefined;
    const str = String(val);
    return str.includes('T') ? str.split('T')[0] : str;
}

// GET - Fetch single expense
export async function GET(_req: NextRequest, { params }: Params) {
    try {
        await dbConnect();
        const { id } = await params;
        const expense = await Expense.findById(id).lean() as any;
        if (!expense) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
        if (expense.date) expense.date = normalizeDate(expense.date);
        return NextResponse.json({ success: true, data: expense });
    } catch {
        return NextResponse.json({ success: false, error: 'Failed to fetch expense' }, { status: 500 });
    }
}

// DELETE - Delete expense
export async function DELETE(_req: NextRequest, { params }: Params) {
    try {
        await dbConnect();
        const { id } = await params;
        const deleted = await Expense.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, message: 'Expense deleted' });
    } catch {
        return NextResponse.json({ success: false, error: 'Failed to delete expense' }, { status: 500 });
    }
}

// PATCH - Update expense
export async function PATCH(req: NextRequest, { params }: Params) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();
        if (body.date) body.date = normalizeDate(body.date);
        const updated = await Expense.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean() as any;
        if (!updated) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
        if (updated.date) updated.date = normalizeDate(updated.date);
        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

