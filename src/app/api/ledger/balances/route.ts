import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LedgerEntry from '@/models/LedgerEntry';
import Customer from '@/models/Customer';
import Outsider from '@/models/Outsider';
import { getRequestSession } from '@/lib/auth';
import { mergePartyBalances, totalsOf, type LedgerGroup } from '@/lib/ledgerBalances';

/**
 * GET /api/ledger/balances
 * All-parties ledger: total debit, credit, balance and last payment per party.
 * Aggregated in MongoDB (one pass over the ledger), then parties whose names differ only
 * by spacing are merged and matched to registered customers / outsiders.
 */
export async function GET(request: NextRequest) {
    const session = await getRequestSession(request);
    if (!session) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();

        const [groups, customers, outsiders] = await Promise.all([
            LedgerEntry.aggregate<LedgerGroup & { _id: string }>([
                {
                    $group: {
                        _id: { $toUpper: { $trim: { input: '$partyName' } } },
                        names: { $addToSet: '$partyName' },
                        partyTypes: { $addToSet: '$partyType' },
                        totalDebit: { $sum: { $cond: [{ $eq: ['$entryType', 'Debit'] }, '$amount', 0] } },
                        totalCredit: { $sum: { $cond: [{ $eq: ['$entryType', 'Credit'] }, '$amount', 0] } },
                        entryCount: { $sum: 1 },
                        // Latest cash received / paid: $max compares {date, createdAt, amount} field by field
                        lastPayment: {
                            $max: {
                                $cond: [
                                    { $in: ['$sourceType', ['Receipt', 'Payment']] },
                                    { date: '$date', createdAt: '$createdAt', amount: '$amount' },
                                    null,
                                ],
                            },
                        },
                    },
                },
            ]),
            Customer.find({}, { customerName: 1 }).lean(),
            Outsider.find({}, { outsiderName: 1 }).lean(),
        ]);

        const rows = mergePartyBalances(
            groups,
            customers.map((c) => c.customerName ?? ''),
            outsiders.map((o) => o.outsiderName ?? '')
        );

        return NextResponse.json({ success: true, data: { rows, totals: totalsOf(rows) } });
    } catch (error) {
        console.error('[Ledger Balances] Failed:', error);
        return NextResponse.json({ success: false, error: 'Failed to load party balances' }, { status: 500 });
    }
}
