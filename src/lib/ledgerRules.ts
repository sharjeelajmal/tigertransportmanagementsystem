/**
 * Client ledger pattern (Excel):
 * - TT bills (inbound/outbound) → Debit + "ADD BILL"
 * - OT bills (allocation / outsider) → Credit + "ADD OUTSIDE BILL"
 * - Cash Paid → Debit + "CASH PAID"
 * - Cash Received → Credit + "CASH RECEIVED"
 * - Balance = prev + debit − credit (handled in /api/ledger)
 */

export type InvoiceLedgerType = 'inbound' | 'outbound' | 'allocation' | string;

export const NARRATION = {
    ADD_BILL: 'ADD BILL',
    ADD_OUTSIDE_BILL: 'ADD OUTSIDE BILL',
    CASH_PAID: 'CASH PAID',
    CASH_RECEIVED: 'CASH RECEIVED',
} as const;

export function isOutsiderInvoice(type: InvoiceLedgerType): boolean {
    return String(type || '').toLowerCase() === 'allocation';
}

/** TT = customer bills; OT = outsider bills */
export function invoiceNumberPrefix(type: InvoiceLedgerType): 'TT' | 'OT' {
    return isOutsiderInvoice(type) ? 'OT' : 'TT';
}

export function invoiceLedgerMeta(type: InvoiceLedgerType) {
    const outsider = isOutsiderInvoice(type);
    return {
        partyType: outsider ? ('Outsider' as const) : ('Customer' as const),
        entryType: outsider ? ('Credit' as const) : ('Debit' as const),
        narration: outsider ? NARRATION.ADD_OUTSIDE_BILL : NARRATION.ADD_BILL,
        prefix: outsider ? ('OT' as const) : ('TT' as const),
    };
}

export function cashNarration(entryType: 'Debit' | 'Credit'): string {
    return entryType === 'Credit' ? NARRATION.CASH_RECEIVED : NARRATION.CASH_PAID;
}

/** Format serial as TT0001 / OT0003 */
export function formatPrefixedInvoiceNo(prefix: 'TT' | 'OT', n: number): string {
    return `${prefix}${String(Math.max(1, n)).padStart(4, '0')}`;
}

/** Parse trailing digits from TT0001, OT0003, or plain 0001 */
export function parseInvoiceSerial(invoiceNo: string): number | null {
    const m = String(invoiceNo || '').trim().match(/^(?:TT|OT)?(\d+)$/i);
    if (!m) return null;
    const n = parseInt(m[1], 10);
    return Number.isFinite(n) ? n : null;
}

/**
 * Parse invoice/ledger dates safely.
 * Supports: Date, ISO, YYYY-MM-DD, DD/MM/YYYY (en-GB from invoice UI), DD-MM-YYYY.
 * Never returns Invalid Date — falls back to now (or optional fallback).
 */
export function parseLedgerDate(dateVal: any, fallback?: Date): Date {
    const fb = fallback && !isNaN(fallback.getTime()) ? fallback : new Date();
    if (!dateVal) return fb;
    if (dateVal instanceof Date) return isNaN(dateVal.getTime()) ? fb : dateVal;

    const str = String(dateVal).trim();
    if (!str) return fb;

    // DD/MM/YYYY or DD-MM-YYYY
    const dmy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmy) {
        const day = parseInt(dmy[1], 10);
        const month = parseInt(dmy[2], 10);
        const year = parseInt(dmy[3], 10);
        const d = new Date(year, month - 1, day, 0, 0, 0, 0);
        return isNaN(d.getTime()) ? fb : d;
    }

    // YYYY-MM-DD (plain) → local midnight
    const ymd = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymd) {
        const d = new Date(`${ymd[1]}-${ymd[2]}-${ymd[3]}T00:00:00`);
        return isNaN(d.getTime()) ? fb : d;
    }

    // ISO / other
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? fb : parsed;
}
