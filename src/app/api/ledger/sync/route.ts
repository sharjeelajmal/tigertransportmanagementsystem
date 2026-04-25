import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import OutsiderAllocation from '@/models/OutsiderAllocation';
import LedgerEntry from '@/models/LedgerEntry';
import Outsider from '@/models/Outsider';
// ─── Helper: parse YYYY-MM-DD or ISO string to local-midnight Date ────────────
function toLocalDate(dateVal: any): Date {
    if (!dateVal) return new Date();
    if (dateVal instanceof Date) return dateVal;
    const str: string = String(dateVal);
    // ISO datetime strings (e.g. "2025-03-06T18:30:00.000Z") → keep as-is
    // Plain date strings (e.g. "2025-03-06") → force local midnight
    const plain = str.split('T')[0]; // "2025-03-06"
    return str.includes('T') ? new Date(str) : new Date(`${plain}T00:00:00`);
}

// ─── Helper: build narration from billingDate string ─────────────────────────
function buildInvoiceNarration(billingDate: string | undefined): string {
    if (!billingDate) return 'Invoice Amount';
    const parts = billingDate.split('-');
    if (parts.length < 2) return 'Invoice Amount';
    const monthName = new Date(Number(parts[0]), parseInt(parts[1], 10) - 1, 1).toLocaleString(
        'en-US',
        { month: 'long' }
    );
    return `${monthName} ${parts[0]} Bills Amount`;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/ledger/sync
//
// One-time migration endpoint. Call this ONCE from the browser or Postman:
//   GET http://localhost:3000/api/ledger/sync
//
// It will:
//   1. Sync all Invoices → Debit entries
//   2. Sync all OutsiderAllocations → Credit entries
//
// Each record is UPSERTED by sourceId so this is safe to call multiple times —
// it will NOT create duplicates.
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        let invoicesSynced = 0;
        let invoicesSkipped = 0;
        let allocationsSynced = 0;
        let allocationsSkipped = 0;
        const errors: string[] = [];

        // ════════════════════════════════════════════════════════════════════
        // 1. SYNC ALL INVOICES → DEBIT
        // ════════════════════════════════════════════════════════════════════
        const invoices = await Invoice.find({ totalAmount: { $gt: 0 } }).lean() as any[];

        for (const inv of invoices) {
            try {
                const invType: string = (inv.type || '').toLowerCase();

                // Determine party name based on invoice type
                const partyName: string = (
                    invType === 'allocation'
                        ? (inv.partyName || '')
                        : (inv.clientName || '')
                ).trim();

                if (!partyName) {
                    invoicesSkipped++;
                    continue;
                }

                // Upsert: only create if no LedgerEntry with this sourceId + sourceType exists
                const existing = await LedgerEntry.findOne({
                    sourceType: 'Invoice',
                    sourceId: String(inv._id),
                });

                if (existing) {
                    invoicesSkipped++;
                    continue;
                }

                const billingDateStr: string = inv.billingDate || '';
                let entryDate = new Date();
                const rawDate = inv.billingDate || inv.createdAt;
                if (rawDate) {
                    const parsed = new Date(rawDate);
                    if (!isNaN(parsed.getTime())) entryDate = parsed;
                }

                await LedgerEntry.create({
                    partyName,
                    partyType: invType === 'allocation' ? 'Outsider' : 'Customer',
                    entryType: 'Debit',
                    date: entryDate,
                    docNo: inv.invoiceNo || `INV-${String(inv._id).slice(-6).toUpperCase()}`,
                    narration: buildInvoiceNarration(billingDateStr),
                    amount: Math.max(0, Number(inv.totalAmount) || 0),
                    sourceType: 'Invoice',
                    sourceId: String(inv._id),
                });

                invoicesSynced++;
            } catch (err: any) {
                errors.push(`Invoice ${inv._id}: ${err.message}`);
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // 2. SYNC ALL OUTSIDER ALLOCATIONS → CREDIT
        // ════════════════════════════════════════════════════════════════════
        const allocations = await OutsiderAllocation
            .find({ totalAmount: { $gt: 0 } })
            .populate('outsider', 'outsiderName')
            .lean() as any[];

        for (const alloc of allocations) {
            try {
                // Get outsider name from the populated field
                const outsiderName: string = (
                    alloc.outsider?.outsiderName || ''
                ).trim();

                if (!outsiderName) {
                    allocationsSkipped++;
                    continue;
                }

                // Upsert: only create if no LedgerEntry with this sourceId + sourceType exists
                const existing = await LedgerEntry.findOne({
                    sourceType: 'Allocation',
                    sourceId: String(alloc._id),
                });

                if (existing) {
                    allocationsSkipped++;
                    continue;
                }

                // Determine date (allocationDate or tripDate or createdAt)
                let entryDate = new Date();
                const rawDate = alloc.allocationDate || alloc.tripDate || alloc.createdAt;
                if (rawDate) {
                    const parsed = new Date(rawDate);
                    if (!isNaN(parsed.getTime())) entryDate = parsed;
                }

                // Build doc number
                const docNo: string =
                    alloc.allocationNo ||
                    `ALLOC-${String(alloc._id).slice(-6).toUpperCase()}`;

                // Build narration from first vehicle or labor info
                const vehicleNo: string = alloc.vehicles?.[0]?.vehicleNo || 'N/A';
                const narration = `Truck No: ${vehicleNo} — Outsider Allocation`;

                await LedgerEntry.create({
                    partyName: outsiderName,
                    partyType: 'Outsider',
                    entryType: 'Credit',    // payable to outsider → Credit
                    date: entryDate,
                    docNo,
                    narration,
                    amount: Math.max(0, Number(alloc.totalAmount) || 0),
                    sourceType: 'Allocation',
                    sourceId: String(alloc._id),
                });

                allocationsSynced++;
            } catch (err: any) {
                errors.push(`Allocation ${alloc._id}: ${err.message}`);
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // 3. RETURN RESULTS
        // ════════════════════════════════════════════════════════════════════
        return NextResponse.json({
            success: true,
            message: 'Ledger sync completed.',
            summary: {
                invoices: {
                    totalFound: invoices.length,
                    synced: invoicesSynced,
                    skipped: invoicesSkipped,
                },
                allocations: {
                    totalFound: allocations.length,
                    synced: allocationsSynced,
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
