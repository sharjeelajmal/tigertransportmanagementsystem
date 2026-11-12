/**
 * Keeps bills and ledger entries attached to a party when its name is edited.
 * Records reference parties by name, so a rename must move them to the new name.
 * Server-only (uses models).
 */
import Customer from '@/models/Customer';
import Outsider from '@/models/Outsider';
import Invoice from '@/models/Invoice';
import LedgerEntry from '@/models/LedgerEntry';
import { exactNameRegex } from '@/lib/ledgerRules';

export type PartyRole = 'Customer' | 'Outsider';

export interface RenameResult {
    invoices: number;
    ledgerEntries: number;
}

/** True when another party of the same role already uses this name (renaming would mix two parties' records). */
export async function isPartyNameTaken(role: PartyRole, name: string, exceptId: string): Promise<boolean> {
    const rx = exactNameRegex(name);
    const found = role === 'Customer'
        ? await Customer.exists({ _id: { $ne: exceptId }, customerName: rx })
        : await Outsider.exists({ _id: { $ne: exceptId }, outsiderName: rx });
    return !!found;
}

/**
 * Moves the party's invoices and ledger entries from oldName to newName.
 *
 * If the old name is not registered in the other role, everything under that name belongs
 * to this party and is moved (e.g. a customer who also has OT bills under the same name).
 * If the same name is a dual-role party (customer AND outsider), only this role's records move.
 *
 * Idempotent: running it again after a partial failure moves whatever is left.
 */
export async function cascadePartyRename(role: PartyRole, oldName: string, newName: string): Promise<RenameResult> {
    const from = String(oldName ?? '').trim();
    const to = String(newName ?? '').trim();
    if (!from || !to || from === to) return { invoices: 0, ledgerEntries: 0 };

    const rx = exactNameRegex(from);
    const otherRoleHasName = role === 'Customer'
        ? !!(await Outsider.exists({ outsiderName: rx }))
        : !!(await Customer.exists({ customerName: rx }));
    const moveTT = role === 'Customer' || !otherRoleHasName;
    const moveOT = role === 'Outsider' || !otherRoleHasName;

    let invoices = 0;
    if (moveTT) {
        const r = await Invoice.updateMany({ type: { $ne: 'allocation' }, clientName: rx }, { $set: { clientName: to } });
        invoices += r.modifiedCount;
    }
    if (moveOT) {
        // OT bills belong to partyName, falling back to clientName (same rule as the ledger)
        const r1 = await Invoice.updateMany({ type: 'allocation', partyName: rx }, { $set: { partyName: to } });
        const r2 = await Invoice.updateMany(
            { type: 'allocation', partyName: { $in: [null, ''] }, clientName: rx },
            { $set: { clientName: to } }
        );
        invoices += r1.modifiedCount + r2.modifiedCount;
    }

    const ledgerFilter = otherRoleHasName
        ? { partyName: rx, partyType: { $in: [role, 'Both'] } }
        : { partyName: rx };
    const l = await LedgerEntry.updateMany(ledgerFilter, { $set: { partyName: to } });

    return { invoices, ledgerEntries: l.modifiedCount };
}

/** Whether a submitted name differs from the stored one (including case / spacing fixes). */
export const nameChanged = (stored: unknown, submitted: unknown): boolean =>
    typeof submitted === 'string' && submitted.trim() !== '' && submitted.trim() !== String(stored ?? '').trim();
