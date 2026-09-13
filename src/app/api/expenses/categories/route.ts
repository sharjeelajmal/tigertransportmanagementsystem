import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ExpenseCategory from '@/models/ExpenseCategory';
import Expense from '@/models/Expense';

const DEFAULT_CATEGORIES = [
    {
        name: 'Vehicle Expense',
        subtypes: ['Fuel', 'Tire Change', 'Maintenance', 'Repair', 'Washing', 'Other'],
        isDefault: true,
    },
    {
        name: 'Office Expense',
        subtypes: ['Electricity Bill', 'Water Bill', 'Rent', 'Stationery', 'Internet', 'Other'],
        isDefault: true,
    },
];

export async function GET() {
    try {
        await dbConnect();

        let categories = await ExpenseCategory.find().sort({ isDefault: -1, createdAt: 1 }).lean();

        if (!categories || categories.length === 0) {
            await ExpenseCategory.insertMany(DEFAULT_CATEGORIES);
            categories = await ExpenseCategory.find().sort({ isDefault: -1, createdAt: 1 }).lean();
        }

        return NextResponse.json({ success: true, data: categories });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { action = 'createCategory' } = body;

        if (action === 'createCategory') {
            const { name, subtypes } = body;
            const trimmed = (name || '').trim();
            if (!trimmed) {
                return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
            }

            const existing = await ExpenseCategory.findOne({
                name: { $regex: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
            });
            if (existing) {
                return NextResponse.json({ success: false, error: 'Category already exists' }, { status: 400 });
            }

            const created = await ExpenseCategory.create({
                name: trimmed,
                subtypes: Array.isArray(subtypes) ? subtypes.map((s: string) => s.trim()).filter(Boolean) : [],
                isDefault: false,
            });

            return NextResponse.json({ success: true, data: created }, { status: 201 });
        }

        if (action === 'addType') {
            const { categoryId, categoryName, typeName } = body;
            const trimmedType = (typeName || '').trim();
            if (!trimmedType) {
                return NextResponse.json({ success: false, error: 'Expense type is required' }, { status: 400 });
            }

            const query = categoryId ? { _id: categoryId } : { name: categoryName };
            const cat = await ExpenseCategory.findOne(query);
            if (!cat) {
                return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
            }

            const exists = cat.subtypes.some((s: string) => s.toLowerCase() === trimmedType.toLowerCase());
            if (exists) {
                return NextResponse.json({ success: false, error: 'Expense type already exists in this category' }, { status: 400 });
            }

            cat.subtypes.push(trimmedType);
            await cat.save();

            return NextResponse.json({ success: true, data: cat });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to process request' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { action } = body;

        if (action === 'renameCategory') {
            const { id, oldName, newName } = body;
            const trimmedNew = (newName || '').trim();
            if (!trimmedNew) {
                return NextResponse.json({ success: false, error: 'New category name is required' }, { status: 400 });
            }

            const duplicate = await ExpenseCategory.findOne({
                _id: { $ne: id },
                name: { $regex: new RegExp(`^${trimmedNew.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
            });
            if (duplicate) {
                return NextResponse.json({ success: false, error: 'Another category with this name already exists' }, { status: 400 });
            }

            const updated = await ExpenseCategory.findByIdAndUpdate(id, { name: trimmedNew }, { new: true });
            if (!updated) {
                return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
            }

            if (oldName && oldName !== trimmedNew) {
                await Expense.updateMany({ category: oldName }, { $set: { category: trimmedNew } });
            }

            return NextResponse.json({ success: true, data: updated });
        }

        if (action === 'renameType') {
            const { id, categoryName, oldTypeName, newTypeName } = body;
            const trimmedNew = (newTypeName || '').trim();
            if (!trimmedNew) {
                return NextResponse.json({ success: false, error: 'New expense type name is required' }, { status: 400 });
            }

            const query = id ? { _id: id } : { name: categoryName };
            const cat = await ExpenseCategory.findOne(query);
            if (!cat) {
                return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
            }

            const targetIdx = cat.subtypes.findIndex((s: string) => s.toLowerCase() === (oldTypeName || '').toLowerCase());
            if (targetIdx === -1) {
                return NextResponse.json({ success: false, error: 'Expense type not found' }, { status: 404 });
            }

            cat.subtypes[targetIdx] = trimmedNew;
            await cat.save();

            if (oldTypeName && oldTypeName !== trimmedNew) {
                await Expense.updateMany(
                    { category: cat.name, expenseType: oldTypeName },
                    { $set: { expenseType: trimmedNew } }
                );
            }

            return NextResponse.json({ success: true, data: cat });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();
        const url = new URL(request.url);
        const queryAction = url.searchParams.get('action');
        const queryId = url.searchParams.get('id');

        let body: any = {};
        try {
            body = await request.json();
        } catch {
            body = {};
        }

        const action = body.action || queryAction;

        if (action === 'deleteCategory') {
            const id = body.id || queryId;
            const name = body.name || url.searchParams.get('name');
            const query = id ? { _id: id } : { name };

            const cat = await ExpenseCategory.findOne(query);
            if (!cat) {
                return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
            }

            await ExpenseCategory.deleteOne(query);
            return NextResponse.json({ success: true, message: 'Category deleted' });
        }

        if (action === 'deleteType') {
            const { id, categoryName, typeName } = body;
            const query = id ? { _id: id } : { name: categoryName };

            const cat = await ExpenseCategory.findOne(query);
            if (!cat) {
                return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
            }

            cat.subtypes = cat.subtypes.filter((s: string) => s !== typeName);
            await cat.save();

            return NextResponse.json({ success: true, data: cat });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete' },
            { status: 500 }
        );
    }
}
