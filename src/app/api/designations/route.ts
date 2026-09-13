import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Designation from '@/models/Designation';
import Staff from '@/models/Staff';

const DEFAULT_DESIGNATIONS = [
    'Operation Manager',
    'Transport Manager',
    'Warehouse Supervisor',
    'Labor',
    'Driver',
    'Admin',
    'Office Staff',
];

export async function GET() {
    try {
        await dbConnect();

        let designations = await Designation.find().sort({ isDefault: -1, createdAt: 1 }).lean();

        if (!designations || designations.length === 0) {
            const defaultDocs = DEFAULT_DESIGNATIONS.map((name) => ({
                name,
                isDefault: true,
            }));
            await Designation.insertMany(defaultDocs);
            designations = await Designation.find().sort({ isDefault: -1, createdAt: 1 }).lean();
        }

        return NextResponse.json({ success: true, data: designations });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch designations' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { name } = body;
        const trimmed = (name || '').trim();

        if (!trimmed) {
            return NextResponse.json({ success: false, error: 'Designation name is required' }, { status: 400 });
        }

        const existing = await Designation.findOne({
            name: { $regex: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        });

        if (existing) {
            return NextResponse.json({ success: false, error: 'Designation already exists' }, { status: 400 });
        }

        const created = await Designation.create({
            name: trimmed,
            isDefault: false,
        });

        return NextResponse.json({ success: true, data: created }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create designation' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { id, oldName, newName } = body;
        const trimmedNew = (newName || '').trim();

        if (!trimmedNew) {
            return NextResponse.json({ success: false, error: 'New designation name is required' }, { status: 400 });
        }

        const duplicate = await Designation.findOne({
            _id: { $ne: id },
            name: { $regex: new RegExp(`^${trimmedNew.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        });

        if (duplicate) {
            return NextResponse.json({ success: false, error: 'Another designation with this name already exists' }, { status: 400 });
        }

        const updated = await Designation.findByIdAndUpdate(id, { name: trimmedNew }, { new: true });
        if (!updated) {
            return NextResponse.json({ success: false, error: 'Designation not found' }, { status: 404 });
        }

        // Cascading update: update existing staff records
        if (oldName && oldName !== trimmedNew) {
            await Staff.updateMany({ designation: oldName }, { $set: { designation: trimmedNew } });
        }

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update designation' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();
        const url = new URL(request.url);
        const queryId = url.searchParams.get('id');

        let body: any = {};
        try {
            body = await request.json();
        } catch {
            body = {};
        }

        const id = body.id || queryId;
        const name = body.name || url.searchParams.get('name');
        const query = id ? { _id: id } : { name };

        const des = await Designation.findOne(query);
        if (!des) {
            return NextResponse.json({ success: false, error: 'Designation not found' }, { status: 404 });
        }

        await Designation.deleteOne(query);
        return NextResponse.json({ success: true, message: 'Designation deleted' });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete designation' },
            { status: 500 }
        );
    }
}
