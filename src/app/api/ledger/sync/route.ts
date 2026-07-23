import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import OutsiderAllocation from '@/models/OutsiderAllocation';
import LedgerEntry from '@/models/LedgerEntry';
import Outsider from '@/models/Outsider';
import { invoiceLedgerMeta, NARRATION, parseLedgerDate } from '@/lib/ledgerRules';

/**
 * GET /api/ledger/sync
 *
 * Upserts ledger rows to match Excel pattern:
 * - TT (inbound/outbound invoices) → Debit + ADD BILL
 * - OT (allocation invoices) → Credit + ADD OUTSIDE BILL
 * - Outsider allocations → Credit + ADD OUTSIDE BILL
 *
 * Safe to call multiple times — updates existing rows by sourceType+sourceId.
 */
export async function GET(_req: NextRequest) {
    try {
        await dbConnect();
        console.log('Forcing model to load in live server:', Outsider.modelName);

        let invoicesSynced = 0;
        let invoicesUpdated = 0;
        let invoicesSkipped = 0;
        let allocationsSynced = 0;
        let allocationsUpdated = 0;
        let allocationsSkipped = 0;
        const errors: string[] = [];

        // 1. SYNC INVOICES
        const invoices = await Invoice.find({ totalAmount: { $gt: 0 } }).lean() as any[];

        for (const inv of invoices) {
            try {
                const invType: string = (inv.type || '').toLowerCase();
                const ledger = invoiceLedgerMeta(invType);
                const partyName: string = (
                    invType === 'allocation' ? (inv.partyName || '') : (inv.clientName || '')
                ).trim();

                if (!partyName) {
                    invoicesSkipped++;
                    continue;
                }

                const entryDate = parseLedgerDate(inv.billingDate || inv.invoiceDate || inv.createdAt);
                const docNo = inv.invoiceNo || `INV-${String(inv._id).slice(-6).toUpperCase()}`;
                const payload = {
                    partyName,
                    partyType: ledger.partyType,
                    entryType: ledger.entryType,
                    date: entryDate,
                    docNo,
                    narration: ledger.narration,
                    amount: Math.max(0, Number(inv.totalAmount) || 0),
                    sourceType: 'Invoice' as const,
                    sourceId: String(inv._id),
                };

                const existing = await LedgerEntry.findOne({
                    sourceType: 'Invoice',
                    sourceId: String(inv._id),
                });

                if (existing) {
                    await LedgerEntry.updateOne({ _id: existing._id }, { $set: payload });
                    invoicesUpdated++;
                } else {
                    await LedgerEntry.create(payload);
                    invoicesSynced++;
                }
            } catch (err: any) {
                errors.push(`Invoice ${inv._id}: ${err.message}`);
            }
        }

        // 2. SYNC OUTSIDER ALLOCATIONS → Credit + ADD OUTSIDE BILL
        const allocations = await OutsiderAllocation
            .find({ totalAmount: { $gt: 0 } })
            .populate('outsider', 'outsiderName')
            .lean() as any[];

        for (const alloc of allocations) {
            try {
                const outsiderName: string = (alloc.outsider?.outsiderName || '').trim();
                if (!outsiderName) {
                    allocationsSkipped++;
                    continue;
                }

                const entryDate = parseLedgerDate(alloc.allocationDate || alloc.tripDate || alloc.createdAt);
                const docNo: string =
                    alloc.allocationNo ||
                    `ALLOC-${String(alloc._id).slice(-6).toUpperCase()}`;

                const payload = {
                    partyName: outsiderName,
                    partyType: 'Outsider' as const,
                    entryType: 'Credit' as const,
                    date: entryDate,
                    docNo,
                    narration: NARRATION.ADD_OUTSIDE_BILL,
                    amount: Math.max(0, Number(alloc.totalAmount) || 0),
                    sourceType: 'Allocation' as const,
                    sourceId: String(alloc._id),
                };

                const existing = await LedgerEntry.findOne({
                    sourceType: 'Allocation',
                    sourceId: String(alloc._id),
                });

                if (existing) {
                    await LedgerEntry.updateOne({ _id: existing._id }, { $set: payload });
                    allocationsUpdated++;
                } else {
                    await LedgerEntry.create(payload);
                    allocationsSynced++;
                }
            } catch (err: any) {
                errors.push(`Allocation ${alloc._id}: ${err.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Ledger sync completed (TT Debit / OT Credit pattern applied).',
            summary: {
                invoices: {
                    totalFound: invoices.length,
                    created: invoicesSynced,
                    updated: invoicesUpdated,
                    skipped: invoicesSkipped,
                },
                allocations: {
                    totalFound: allocations.length,
                    created: allocationsSynced,
                    updated: allocationsUpdated,
                    skipped: allocationsSkipped,
                },
                errors: errors.length > 0 ? errors : 'None',
            },
        });
    } catch (error: any) {
        console.error('[Ledger Sync] Fatal error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Sync failed' },
            { status: 500 }
        );
    }
}
