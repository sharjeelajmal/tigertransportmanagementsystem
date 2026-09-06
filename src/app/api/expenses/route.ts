import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';

// GET - Fetch all expenses
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const month = searchParams.get("month");
        const startDate = searchParams.get("startDate") || searchParams.get("from");
        const endDate = searchParams.get("endDate") || searchParams.get("to");
        const specificDate = searchParams.get("date") || searchParams.get("specificDate");

        let filterQuery: any = {};
        if (specificDate) {
            filterQuery.date = specificDate;
        } else if (startDate && endDate) {
            filterQuery.date = { $gte: startDate, $lte: endDate };
        } else if (startDate) {
            filterQuery.date = { $gte: startDate };
        } else if (endDate) {
            filterQuery.date = { $lte: endDate };
        } else if (month) {
            filterQuery.date = { $regex: `^${month}` };
        }

        const expenses = await Expense.find(filterQuery).sort({ date: -1, createdAt: -1 }).lean();
        return NextResponse.json({ success: true, data: expenses });
    } catch {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch expenses' },
            { status: 500 }
        );
    }
}

// POST - Create new expense
export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();

        const {
            date, category, expenseType, totalAmount, status,
            vehicleNo, driverName, helperName, route,
            amountGivenTo, remarks,
            paidAmount, remainingAmount, paymentMethod,
        } = body;

        if (!date || !category || !expenseType || !totalAmount) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: date, category, expenseType, totalAmount' },
                { status: 400 }
            );
        }

        const expense = await Expense.create({
            date,
            category,
            expenseType,
            totalAmount: Number(totalAmount),
            paidAmount: Number(paidAmount) || 0,
            remainingAmount: Number(remainingAmount) || 0,
            paymentMethod: paymentMethod || '',
            status: status || 'Unpaid',
            // Vehicle fields
            vehicleNo: vehicleNo || '',
            driverName: driverName || '',
            helperName: helperName || '',
            route: route || '',
            // Office fields
            amountGivenTo: amountGivenTo || '',
            // Shared
            remarks: remarks || '',
        });

        return NextResponse.json({ success: true, data: expense }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create expense' },
            { status: 400 }
        );
    }
}
