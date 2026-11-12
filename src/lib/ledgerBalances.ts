/**
 * All-parties ledger ("all over ledger"): debit, credit and balance per party.
 * Pure functions only — shared by the API route and the UI.
 *
 * Sign convention (same as the party ledger): balance = debit − credit
 *   balance > 0 → party owes us (lena hai)     balance < 0 → we owe the party (dena hai)
 */
import { normalizePartyName } from './partySummary';

export type LedgerRole = 'Customer' | 'Outsider' | 'Both';

/** One DB group (entries grouped by trimmed + upper-cased party name). */
export interface LedgerGroup {
    names: string[];            // spellings found in the ledger for this party
    partyTypes: string[];       // partyType values found on the entries
    totalDebit: number;
    totalCredit: number;
    entryCount: number;
    lastPayment: { date: Date | string; amount: number } | null;
}

export interface PartyBalanceRow {
    partyName: string;
    partyType: LedgerRole;
    registered: boolean;        // exists as a customer and/or outsider
    totalDebit: number;
    totalCredit: number;
    balance: number;
    entryCount: number;
    lastPayment: { date: string; amount: number } | null;
}

export interface BalanceTotals {
    totalDebit: number;
    totalCredit: number;
    netBalance: number;
    receivable: number;   // sum of positive balances
    payable: number;      // sum of negative balances, as a positive number
    parties: number;
}

/** Balances smaller than half a paisa are treated as settled (float noise). */
export const isZeroBalance = (balance: number): boolean => Math.abs(balance) < 0.005;

const toRole = (types: Iterable<string>): LedgerRole => {
    const set = new Set(types);
    if (set.has('Both') || (set.has('Customer') && set.has('Outsider'))) return 'Both';
    return set.has('Outsider') ? 'Outsider' : 'Customer';
};

const laterPayment = (a: LedgerGroup['lastPayment'], b: LedgerGroup['lastPayment']) => {
    if (!a) return b;
    if (!b) return a;
    return new Date(b.date).getTime() > new Date(a.date).getTime() ? b : a;
};

/**
 * Merges DB groups that are the same party (names differing only by inner spaces / case)
 * and attaches the registered name and role from customers / outsiders.
 * Rows are sorted by party name.
 */
export function mergePartyBalances(
    groups: LedgerGroup[],
    customerNames: string[],
    outsiderNames: string[]
): PartyBalanceRow[] {
    const registered = new Map<string, { name: string; roles: Set<string> }>();
    const register = (name: string, role: 'Customer' | 'Outsider') => {
        const key = normalizePartyName(name);
        if (!key) return;
        const entry = registered.get(key) ?? { name: name.trim(), roles: new Set<string>() };
        entry.roles.add(role);
        registered.set(key, entry);
    };
    customerNames.forEach((n) => register(n, 'Customer'));
    outsiderNames.forEach((n) => register(n, 'Outsider'));

    const merged = new Map<string, LedgerGroup>();
    for (const g of groups) {
        const key = normalizePartyName(g.names[0]);
        if (!key) continue;
        const prev = merged.get(key);
        merged.set(key, prev
            ? {
                names: [...prev.names, ...g.names],
                partyTypes: [...prev.partyTypes, ...g.partyTypes],
                totalDebit: prev.totalDebit + g.totalDebit,
                totalCredit: prev.totalCredit + g.totalCredit,
                entryCount: prev.entryCount + g.entryCount,
                lastPayment: laterPayment(prev.lastPayment, g.lastPayment),
            }
            : g);
    }

    const rows: PartyBalanceRow[] = [];
    for (const [key, g] of merged) {
        const reg = registered.get(key);
        const totalDebit = Number(g.totalDebit) || 0;
        const totalCredit = Number(g.totalCredit) || 0;
        rows.push({
            partyName: reg?.name ?? g.names[0].trim().replace(/\s+/g, ' '),
            partyType: reg ? toRole(reg.roles) : toRole(g.partyTypes),
            registered: !!reg,
            totalDebit,
            totalCredit,
            balance: totalDebit - totalCredit,
            entryCount: g.entryCount,
            lastPayment: g.lastPayment
                ? { date: new Date(g.lastPayment.date).toISOString(), amount: Number(g.lastPayment.amount) || 0 }
                : null,
        });
    }
    return rows.sort((a, b) => a.partyName.localeCompare(b.partyName));
}

/** Search + "hide zero balances" filter used by the all-parties list. */
export function filterPartyBalances(rows: PartyBalanceRow[], search: string, hideZero: boolean): PartyBalanceRow[] {
    const q = normalizePartyName(search);
    return rows.filter((r) => (!hideZero || !isZeroBalance(r.balance)) && (!q || normalizePartyName(r.partyName).includes(q)));
}

export function totalsOf(rows: PartyBalanceRow[]): BalanceTotals {
    const t: BalanceTotals = { totalDebit: 0, totalCredit: 0, netBalance: 0, receivable: 0, payable: 0, parties: rows.length };
    for (const r of rows) {
        t.totalDebit += r.totalDebit;
        t.totalCredit += r.totalCredit;
        t.netBalance += r.balance;
        if (r.balance > 0) t.receivable += r.balance;
        else t.payable += -r.balance;
    }
    return t;
}
