import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payroll from '@/models/Payroll';
import Expense from '@/models/Expense';
import OutsiderAllocation from '@/models/OutsiderAllocation';
import LedgerEntry from '@/models/LedgerEntry';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LedgerRow {
    _id: string;
    date: string;
    docNo: string;
    narration: string;
    entryType: 'Debit' | 'Credit';
    debit: number;
    credit: number;
    balance: number; // Running balance (computed server-side for reference)
}

// ─── Route Handler ───────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const partyName = searchParams.get('partyName') || '';
        const startDate = searchParams.get('startDate') || '';
        const endDate = searchParams.get('endDate') || '';

        // ════════════════════════════════════════════════════════════════════
        // MODE A — Party-Specific Ledger
        // Activated when partyName query param is provided
        // ════════════════════════════════════════════════════════════════════
        if (partyName.trim()) {
            // ── Bug Fix #3: Date filter offset ───────────────────────────────────
            // new Date('2025-03-06') → UTC midnight → shows as Mar 5 in UTC+5
            // new Date('2025-03-06T00:00:00') → local midnight → correct
            const dateFilter: any = {};
            if (startDate && endDate) {
                dateFilter.date = {
                    $gte: new Date(`${startDate}T00:00:00`),
                    $lte: new Date(`${endDate}T23:59:59.999`),
                };
            } else if (startDate) {
                dateFilter.date = { $gte: new Date(`${startDate}T00:00:00`) };
            } else if (endDate) {
                dateFilter.date = { $lte: new Date(`${endDate}T23:59:59.999`) };
            }

            // ── Bug Fix #2: Dual-role & case-insensitive search ──────────────────
            // Use a flexible regex: case-insensitive exact match on the full name.
            // This matches entries regardless of whether they were originally created
            // as Customer-type or Outsider-type — both share the same partyName field.
            const escapedName = partyName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const entries = await LedgerEntry.find({
                partyName: new RegExp(escapedName, 'i'),
                ...dateFilter,
            })
                .sort({ date: 1, createdAt: 1 })
                .lean();

            // ── Bug Fix #4: Opening Balance ──────────────────────────────────────
            let openingBalance = 0;
            if (startDate) {
                const pastEntries = await LedgerEntry.find({
                    partyName: new RegExp(escapedName, 'i'),
                    date: { $lt: new Date(`${startDate}T00:00:00`) }
                }).lean();
                
                pastEntries.forEach((e: any) => {
                    const debit = e.entryType === 'Debit' ? e.amount : 0;
                    const credit = e.entryType === 'Credit' ? e.amount : 0;
                    openingBalance += (debit - credit);
                });
            }

            // Compute running balance row-by-row (standard accounting ledger)
            let runningBalance = openingBalance;
            let totalDebit = 0;
            let totalCredit = 0;

            const rows: LedgerRow[] = entries.map((e: any) => {
                const debit = e.entryType === 'Debit' ? e.amount : 0;
                const credit = e.entryType === 'Credit' ? e.amount : 0;
                runningBalance += debit - credit;
                totalDebit += debit;
                totalCredit += credit;

                return {
                    _id: String(e._id),
                    date: e.date instanceof Date ? e.date.toISOString() : String(e.date),
                    docNo: e.docNo,
                    narration: e.narration,
                    entryType: e.entryType,
                    debit,
                    credit,
                    balance: runningBalance,
                };
            });

            if (startDate && openingBalance !== 0) {
                rows.unshift({
                    _id: 'opening-balance',
                    date: new Date(`${startDate}T00:00:00`).toISOString(),
                    docNo: '-',
                    narration: 'Opening Balance',
                    entryType: openingBalance >= 0 ? 'Debit' : 'Credit',
                    debit: openingBalance > 0 ? openingBalance : 0,
                    credit: openingBalance < 0 ? Math.abs(openingBalance) : 0,
                    balance: openingBalance,
                });
            }

            return NextResponse.json({
                success: true,
                mode: 'party',
                data: {
                    partyName: partyName.trim(),
                    entries: rows,
                    totalDebit,
                    totalCredit,
                    // positive = party owes us (receivable); negative = we owe them (payable)
                    netBalance: runningBalance,
                },
            });
        }

        // ════════════════════════════════════════════════════════════════════
        // MODE B — General Financial Overview (existing behaviour — unchanged)
        // Activated when no partyName is provided
        // ════════════════════════════════════════════════════════════════════

        const expenseDateFilter: any = {};
        const payrollDateFilter: any = {};
        const allocationDateFilter: any = {};

        if (startDate && endDate) {
            // Expense uses string date (YYYY-MM-DD)
            expenseDateFilter.date = { $gte: startDate, $lte: endDate };
            payrollDateFilter.paymentDate = { $gte: new Date(startDate), $lte: new Date(endDate + 'T23:59:59') };
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
        const payrolls = await Payroll.find(payrollDateFilter)
            .populate('staffId', 'firstName lastName designation')
            .lean() as any[];
        const totalPayrollOut = payrolls.reduce((sum: number, p: any) => sum + (p.netSalary || 0), 0);

        const expenses = await Expense.find(expenseDateFilter).lean() as any[];
        const totalExpenseOut = expenses.reduce((sum: number, e: any) => sum + (e.paidAmount || 0), 0);

        const totalCashOut = totalPayrollOut + totalExpenseOut;
        const netBalance = totalCashIn - totalCashOut;

        const totalPayables = allocations
            .filter((a: any) => a.paymentStatus !== 'Paid')
            .reduce((sum: number, a: any) => sum + ((a.totalAmount || 0) - (a.paidAmount || 0)), 0);

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
            mode: 'general',
            data: {
                totalCashIn,
                totalCashOut,
                totalPayrollOut,
                totalExpenseOut,
                netBalance,
                totalPayables,
                transactions,
            },
        });
    } catch (error: any) {
        console.error('Error fetching ledger data:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch ledger data' }, { status: 500 });
    }
}
