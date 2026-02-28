import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payroll from '@/models/Payroll';
import Expense from '@/models/Expense';
import OutsiderAllocation from '@/models/OutsiderAllocation';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build date filters
        const expenseDateFilter: any = {};
        const payrollDateFilter: any = {};
        const allocationDateFilter: any = {};

        if (startDate && endDate) {
            // Expense uses string date (YYYY-MM-DD)
            expenseDateFilter.date = { $gte: startDate, $lte: endDate };
            // Payroll uses Date paymentDate
            payrollDateFilter.paymentDate = { $gte: new Date(startDate), $lte: new Date(endDate + 'T23:59:59') };
            // OutsiderAllocation uses Date allocationDate
            allocationDateFilter.allocationDate = { $gte: new Date(startDate), $lte: new Date(endDate + 'T23:59:59') };
        } else if (startDate) {
            expenseDateFilter.date = { $gte: startDate };
            payrollDateFilter.paymentDate = { $gte: new Date(startDate) };
            allocationDateFilter.allocationDate = { $gte: new Date(startDate) };
        } else if (endDate) {
            expenseDateFilter.date = { $lte: endDate };
            payrollDateFilter.paymentDate = { $lte: new Date(endDate + 'T23:59:59') };
            allocationDateFilter.allocationDate = { $lte: new Date(endDate + 'T23:59:59') };
        }

        // Cash In: OutsiderAllocation paidAmount
        const allocations = await OutsiderAllocation.find(allocationDateFilter).lean() as any[];
        const totalCashIn = allocations.reduce((sum: number, a: any) => sum + (a.paidAmount || 0), 0);

        // Cash Out: Payroll + Expense
        const payrolls = await Payroll.find(payrollDateFilter).populate('staffId', 'firstName lastName designation').lean() as any[];
        const totalPayrollOut = payrolls.reduce((sum: number, p: any) => sum + (p.netSalary || 0), 0);

        const expenses = await Expense.find(expenseDateFilter).lean() as any[];
        const totalExpenseOut = expenses.reduce((sum: number, e: any) => sum + (e.paidAmount || 0), 0);

        const totalCashOut = totalPayrollOut + totalExpenseOut;
        const netBalance = totalCashIn - totalCashOut;

        // Payables
        const totalPayables = allocations
            .filter((a: any) => a.paymentStatus !== 'Paid')
            .reduce((sum: number, a: any) => sum + ((a.totalAmount || 0) - (a.paidAmount || 0)), 0);

        // Recent Transactions
        const recentExpenses = expenses.slice(-30).map((e: any) => ({
            _id: e._id,
            type: 'Expense',
            description: `${e.category} — ${e.expenseType}`,
            amount: e.paidAmount || e.totalAmount || 0,
            date: e.date || e.createdAt,
            status: e.status,
        }));

        const recentPayrolls = payrolls.slice(-30).map((p: any) => ({
            _id: p._id,
            type: 'Payroll',
            description: `Salary — ${p.staffId?.firstName || ''} ${p.staffId?.lastName || ''}`.trim(),
            amount: p.netSalary || 0,
            date: p.paymentDate || p.createdAt,
            status: p.status || 'Paid',
        }));

        const recentAllocations = allocations.slice(-30).map((a: any) => ({
            _id: a._id,
            type: 'Outsider Payment',
            description: `Outsider — ${a.customerName || 'Unknown'}`,
            amount: a.paidAmount || 0,
            date: a.allocationDate || a.createdAt,
            status: a.paymentStatus,
        }));

        const transactions = [...recentExpenses, ...recentPayrolls, ...recentAllocations]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 30);

        return NextResponse.json({
            success: true,
            data: {
                totalCashIn,
                totalCashOut,
                totalPayrollOut,
                totalExpenseOut,
                netBalance,
                totalPayables,
                transactions,
            }
        });
    } catch (error: any) {
        console.error('Error fetching ledger data:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch ledger data' }, { status: 500 });
    }
}
