import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import Customer from '@/models/Customer';
import Outsider from '@/models/Outsider';
import { getRequestSession } from '@/lib/auth';
import { invoiceBillDate, invoicePartyName } from '@/lib/ledgerRules';
import { summarizeBillsByParty, type PartyRef } from '@/lib/partySummary';

const YMD = /^\d{4}-\d{2}-\d{2}$/;

/** Registered customers / outsiders reduced to what codes and name matching need. */
async function loadParties(isOutsider: boolean): Promise<PartyRef[]> {
    if (isOutsider) {
        const docs = await Outsider.find({}, { outsiderName: 1, createdAt: 1 }).lean();
        return docs.map((p) => ({ _id: String(p._id), name: p.outsiderName ?? '', createdAt: p.createdAt }));
    }
    const docs = await Customer.find({}, { customerName: 1, createdAt: 1 }).lean();
    return docs.map((p) => ({ _id: String(p._id), name: p.customerName ?? '', createdAt: p.createdAt }));
}

/**
 * GET /api/invoices/summary?type=customer|outsider&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 *
 * Party-wise bills summary for a period: number of bills and total amount per party.
 * - customer → TT bills (inbound / outbound), grouped by client name
 * - outsider → OT bills (allocation), grouped by party name
 * Bills are placed by their bill date and party exactly as the ledger does,
 * so this summary, the party ledger and the per-party bills report always agree.
 */
export async function GET(request: NextRequest) {
    const session = await getRequestSession(request);
    if (!session) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || '').toLowerCase();
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    if (type !== 'customer' && type !== 'outsider') {
        return NextResponse.json({ success: false, error: 'type must be "customer" or "outsider"' }, { status: 400 });
    }
    if (!YMD.test(startDate) || !YMD.test(endDate)) {
        return NextResponse.json({ success: false, error: 'startDate and endDate are required (YYYY-MM-DD)' }, { status: 400 });
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59.999`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
        return NextResponse.json({ success: false, error: 'Invalid date range' }, { status: 400 });
    }

    try {
        await dbConnect();
        const isOutsider = type === 'outsider';

        // Bill dates are stored as DD/MM/YYYY text, so the range is applied after loading.
        // Only the fields the summary needs are fetched.
        const [invoices, parties] = await Promise.all([
            Invoice.find(
                { type: isOutsider ? 'allocation' : { $in: ['inbound', 'outbound'] } },
                { type: 1, clientName: 1, partyName: 1, billingDate: 1, invoiceDate: 1, createdAt: 1, totalAmount: 1 }
            ).lean(),
            loadParties(isOutsider),
        ]);

        const bills = (invoices as Record<string, unknown>[])
            .filter((inv) => {
                const d = invoiceBillDate(inv);
                return d >= start && d <= end;
            })
            .map((inv) => ({ partyName: invoicePartyName(inv), totalAmount: Number(inv.totalAmount) || 0 }));

        const summary = summarizeBillsByParty(bills, parties);
        return NextResponse.json({ success: true, data: { type, startDate, endDate, ...summary } });
    } catch (error) {
        console.error('[Invoice Summary] Failed:', error);
        return NextResponse.json({ success: false, error: 'Failed to build bills summary' }, { status: 500 });
    }
}
