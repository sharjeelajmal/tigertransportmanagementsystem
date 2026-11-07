/**
 * Party-wise bills summary ("List of Sales Invoices Summary").
 * Pure functions only — shared by the API route and the UI, no DB / React imports.
 */

export type PartyKind = 'Customer' | 'Outsider';

/** A registered party (customer or outsider) as needed for codes and name matching. */
export interface PartyRef {
    _id: string;
    name: string;
    createdAt?: string | Date;
}

/** A bill that already passed the date filter, reduced to what the summary needs. */
export interface BillRef {
    partyName: string;
    totalAmount: number;
}

export interface PartyBillsRow {
    /** Registration serial of the party (1 = first registered); null when the name is not registered. */
    code: number | null;
    partyId: string | null;
    partyName: string;
    billCount: number;
    totalAmount: number;
}

export interface PartyBillsSummary {
    rows: PartyBillsRow[];
    totalBills: number;
    totalAmount: number;
}

/** Case/space-insensitive key: "Saddam  Bhai " and "SADDAM BHAI" are the same party. */
export function normalizePartyName(name: unknown): string {
    return String(name ?? '').trim().replace(/\s+/g, ' ').toUpperCase();
}

/**
 * Stable party codes: 1, 2, 3… in registration order (createdAt, then _id).
 * Adding a new party never changes existing codes.
 */
export function assignPartyCodes(parties: PartyRef[]): Map<string, number> {
    const ordered = [...parties].sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return ta - tb || String(a._id).localeCompare(String(b._id));
    });
    return new Map(ordered.map((p, i) => [String(p._id), i + 1]));
}

/**
 * Groups bills by party: number of bills + total amount per party.
 * Bills under a name that is not registered are still listed (code = null) so the
 * grand total always equals the sum of all bills in the period.
 * Rows: registered parties by code, then unregistered names alphabetically.
 */
export function summarizeBillsByParty(bills: BillRef[], parties: PartyRef[]): PartyBillsSummary {
    const codes = assignPartyCodes(parties);
    const registered = new Map<string, PartyRef>();
    for (const p of parties) {
        const key = normalizePartyName(p.name);
        if (key && !registered.has(key)) registered.set(key, p);
    }

    const rowsByKey = new Map<string, PartyBillsRow>();
    for (const bill of bills) {
        const key = normalizePartyName(bill.partyName);
        if (!key) continue;
        const amount = Number(bill.totalAmount) || 0;
        const row = rowsByKey.get(key);
        if (row) {
            row.billCount += 1;
            row.totalAmount += amount;
            continue;
        }
        const party = registered.get(key);
        rowsByKey.set(key, {
            code: party ? codes.get(String(party._id)) ?? null : null,
            partyId: party ? String(party._id) : null,
            partyName: (party?.name ?? bill.partyName).trim(),
            billCount: 1,
            totalAmount: amount,
        });
    }

    const rows = [...rowsByKey.values()].sort((a, b) => {
        if (a.code !== null && b.code !== null) return a.code - b.code;
        if (a.code !== null) return -1;
        if (b.code !== null) return 1;
        return a.partyName.localeCompare(b.partyName);
    });

    return {
        rows,
        totalBills: rows.reduce((s, r) => s + r.billCount, 0),
        totalAmount: rows.reduce((s, r) => s + r.totalAmount, 0),
    };
}
