"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Pagination from "@/components/Pagination";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LedgerRow {
    _id: string;
    date: string;
    docNo: string;
    narration: string;
    entryType: "Debit" | "Credit";
    debit: number;
    credit: number;
    balance: number; // pre-computed running balance from API
}

interface GeneralTransaction {
    _id: string;
    type: string;
    description: string;
    amount: number;
    date: string;
    status: string;
}

type LedgerTransactionsProps =
    | { mode: "party"; entries: LedgerRow[] }
    | { mode: "general"; transactions: GeneralTransaction[] };

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 15;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => (n > 0 ? n.toLocaleString() : "—");

const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

const typeBadgeGeneral = (type: string) => {
    const map: Record<string, { bg: string; color: string }> = {
        Expense: { bg: "rgba(181,1,4,0.08)", color: "var(--primary)" },
        Payroll: { bg: "rgba(79,70,229,0.10)", color: "#4F46E5" },
        "Outsider Payment": { bg: "rgba(16,185,129,0.10)", color: "#10B981" },
    };
    return map[type] || { bg: "rgba(107,114,128,0.10)", color: "#6B7280" };
};

const statusColor = (status: string) => {
    if (status === "Paid") return "bg-emerald-50 text-emerald-600";
    if (status === "Unpaid") return "bg-red-50 text-red-500";
    return "bg-amber-50 text-amber-600";
};

// ─── Party Ledger Table ───────────────────────────────────────────────────────

function PartyLedgerTable({ entries }: { entries: LedgerRow[] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(entries.length / ITEMS_PER_PAGE);
    const paginated = entries.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto print:hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/60">
                            {["Date", "Doc No", "Narration", "Debit (PKR)", "Credit (PKR)", "Balance (PKR)"].map((h) => (
                                <th
                                    key={h}
                                    className="px-5 py-3.5 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center text-gray-400 text-sm">
                                    No transactions found for this party
                                </td>
                            </tr>
                        ) : (
                            paginated.map((row, i) => {
                                const isDebit = row.entryType === "Debit";
                                const balPositive = row.balance >= 0;
                                return (
                                    <motion.tr
                                        key={row._id + i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.025 }}
                                        className="border-b border-gray-50 hover:bg-[#FFF8F8] transition-colors"
                                    >
                                        {/* Date */}
                                        <td className="px-5 py-3.5">
                                            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                                                {fmtDate(row.date)}
                                            </span>
                                        </td>

                                        {/* Doc No */}
                                        <td className="px-5 py-3.5">
                                            <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                                                {row.docNo}
                                            </span>
                                        </td>

                                        {/* Narration */}
                                        <td className="px-5 py-3.5">
                                            <span className="text-sm text-gray-700 font-medium">{row.narration}</span>
                                        </td>

                                        {/* Debit */}
                                        <td className="px-5 py-3.5">
                                            <span
                                                className="text-sm font-bold"
                                                style={{ color: isDebit ? "var(--primary)" : "#9CA3AF" }}
                                            >
                                                {fmt(row.debit)}
                                            </span>
                                        </td>

                                        {/* Credit */}
                                        <td className="px-5 py-3.5">
                                            <span
                                                className="text-sm font-bold"
                                                style={{ color: !isDebit ? "#10B981" : "#9CA3AF" }}
                                            >
                                                {fmt(row.credit)}
                                            </span>
                                        </td>

                                        {/* Running Balance */}
                                        <td className="px-5 py-3.5">
                                            <span
                                                className="text-sm font-black"
                                                style={{ color: balPositive ? "#4F46E5" : "#F59E0B" }}
                                            >
                                                {Math.abs(row.balance).toLocaleString()}
                                                <span className="text-[10px] font-semibold ml-0.5 opacity-70">
                                                    {balPositive ? "Dr" : "Cr"}
                                                </span>
                                            </span>
                                        </td>
                                    </motion.tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-50 print:hidden">
                {paginated.length === 0 ? (
                    <div className="px-4 py-16 text-center text-gray-400 text-sm">
                        No transactions found
                    </div>
                ) : (
                    paginated.map((row, i) => {
                        const isDebit = row.entryType === "Debit";
                        const balPositive = row.balance >= 0;
                        return (
                            <motion.div
                                key={row._id + i}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="px-4 py-4 space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                                        {row.docNo}
                                    </span>
                                    <span className="text-xs text-gray-400">{fmtDate(row.date)}</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-800">{row.narration}</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-semibold uppercase">Debit</p>
                                        <p
                                            className="text-sm font-bold"
                                            style={{ color: isDebit ? "var(--primary)" : "#D1D5DB" }}
                                        >
                                            {fmt(row.debit)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-semibold uppercase">Credit</p>
                                        <p
                                            className="text-sm font-bold"
                                            style={{ color: !isDebit ? "#10B981" : "#D1D5DB" }}
                                        >
                                            {fmt(row.credit)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-semibold uppercase">Balance</p>
                                        <p
                                            className="text-sm font-black"
                                            style={{ color: balPositive ? "#4F46E5" : "#F59E0B" }}
                                        >
                                            {Math.abs(row.balance).toLocaleString()}
                                            <span className="text-[9px] ml-0.5">{balPositive ? " Dr" : " Cr"}</span>
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="border-t border-gray-100 bg-white print:hidden">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(p) => setCurrentPage(p)}
                    />
                </div>
            )}

            {/* Footer */}
            <div className="px-4 md:px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between print:hidden">
                <p className="text-xs text-gray-400">
                    Showing{" "}
                    <span className="font-bold text-gray-600">{paginated.length}</span> of{" "}
                    <span className="font-bold text-gray-600">{entries.length}</span> entries
                </p>
                <p className="text-[10px] text-gray-400">
                    Page {currentPage} of {totalPages || 1}
                </p>
            </div>

            {/* Print Table (Full Data) */}
            <div className="hidden print:block w-full">
                <table className="w-full border-collapse border border-gray-900 text-xs text-gray-900">
                    <thead>
                        <tr className="border-b-2 border-gray-900 bg-gray-100 uppercase font-black">
                            <th className="px-2 py-1.5 text-left border border-gray-900">Date</th>
                            <th className="px-2 py-1.5 text-left border border-gray-900">Doc No</th>
                            <th className="px-2 py-1.5 text-left border border-gray-900">Narration</th>
                            <th className="px-2 py-1.5 text-left border border-gray-900">Debit</th>
                            <th className="px-2 py-1.5 text-left border border-gray-900">Credit</th>
                            <th className="px-2 py-1.5 text-left border border-gray-900">Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-2 py-4 text-center">No transactions found</td>
                            </tr>
                        ) : entries.map((row, i) => {
                            const balPositive = row.balance >= 0;
                            return (
                                <tr key={row._id + i} className="border-b border-gray-900 break-inside-avoid">
                                    <td className="px-2 py-1 border border-gray-900 whitespace-nowrap">{fmtDate(row.date)}</td>
                                    <td className="px-2 py-1 border border-gray-900 font-bold whitespace-nowrap">{row.docNo}</td>
                                    <td className="px-2 py-1 border border-gray-900">{row.narration}</td>
                                    <td className="px-2 py-1 border border-gray-900">{fmt(row.debit)}</td>
                                    <td className="px-2 py-1 border border-gray-900">{fmt(row.credit)}</td>
                                    <td className="px-2 py-1 border border-gray-900 font-black">
                                        {Math.abs(row.balance).toLocaleString()} <span className="text-[10px]">{balPositive ? "Dr" : "Cr"}</span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}

// ─── General Transaction Table ────────────────────────────────────────────────

function GeneralTransactionTable({ transactions }: { transactions: GeneralTransaction[] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
    const paginated = transactions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto print:hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/60">
                            {["Type", "Description", "Amount", "Date", "Status"].map((h) => (
                                <th
                                    key={h}
                                    className="px-6 py-3.5 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center text-gray-400 text-sm">
                                    No transactions found
                                </td>
                            </tr>
                        ) : (
                            paginated.map((t, i) => {
                                const badge = typeBadgeGeneral(t.type);
                                return (
                                    <motion.tr
                                        key={t._id + i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="border-b border-gray-50 hover:bg-[#FFF8F8] transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <span
                                                className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                                                style={{ background: badge.bg, color: badge.color }}
                                            >
                                                {t.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-700 font-medium">{t.description}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-gray-900">
                                                {t.amount.toLocaleString()}/-
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-500">{fmtDate(t.date)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor(t.status)}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                    </motion.tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-50 print:hidden">
                {paginated.length === 0 ? (
                    <div className="px-4 py-16 text-center text-gray-400 text-sm">No transactions found</div>
                ) : (
                    paginated.map((t, i) => {
                        const badge = typeBadgeGeneral(t.type);
                        return (
                            <motion.div
                                key={t._id + i}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="px-4 py-4 space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <span
                                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                        style={{ background: badge.bg, color: badge.color }}
                                    >
                                        {t.type}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(t.status)}`}>
                                        {t.status}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-gray-800 truncate">{t.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-black text-gray-900">{t.amount.toLocaleString()}/-</span>
                                    <span className="text-xs text-gray-400">{fmtDate(t.date)}</span>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="border-t border-gray-100 bg-white print:hidden">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(p) => setCurrentPage(p)}
                    />
                </div>
            )}

            {/* Footer */}
            <div className="px-4 md:px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between print:hidden">
                <p className="text-xs text-gray-400">
                    Showing <span className="font-bold text-gray-600">{paginated.length}</span> of{" "}
                    <span className="font-bold text-gray-600">{transactions.length}</span> transactions
                </p>
                <p className="text-[10px] text-gray-400">Page {currentPage} of {totalPages || 1}</p>
            </div>

            {/* Print Table (Full Data) */}
            <div className="hidden print:block w-full">
                <table className="w-full border-collapse border border-gray-900 text-xs text-gray-900">
                    <thead>
                        <tr className="border-b-2 border-gray-900 bg-gray-100 uppercase font-black">
                            <th className="px-2 py-1.5 text-left border border-gray-900">Type</th>
                            <th className="px-2 py-1.5 text-left border border-gray-900">Description</th>
                            <th className="px-2 py-1.5 text-right border border-gray-900">Amount</th>
                            <th className="px-2 py-1.5 text-right border border-gray-900">Date</th>
                            <th className="px-2 py-1.5 text-left border border-gray-900">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-2 py-4 text-center">No transactions found</td>
                            </tr>
                        ) : transactions.map((t, i) => (
                            <tr key={t._id + i} className="border-b border-gray-900 break-inside-avoid">
                                <td className="px-2 py-1 border border-gray-900 whitespace-nowrap font-bold">{t.type}</td>
                                <td className="px-2 py-1 border border-gray-900">{t.description}</td>
                                <td className="px-2 py-1 border border-gray-900 text-right font-black">{t.amount.toLocaleString()}/-</td>
                                <td className="px-2 py-1 border border-gray-900 text-right whitespace-nowrap">{fmtDate(t.date)}</td>
                                <td className="px-2 py-1 border border-gray-900 uppercase font-bold">{t.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function LedgerTransactions(props: LedgerTransactionsProps) {
    const count =
        props.mode === "party" ? props.entries.length : props.transactions.length;

    const title =
        props.mode === "party" ? "Ledger Statement" : "Transaction History";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-gray-100 print:border-none print:rounded-none overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.06)] print:shadow-none"
        >
            {/* Header */}
            <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex items-center justify-between print:hidden">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">{title}</h2>
                <span className="text-xs text-gray-400 font-medium">{count} entries</span>
            </div>

            {props.mode === "party" ? (
                <PartyLedgerTable entries={props.entries} />
            ) : (
                <GeneralTransactionTable transactions={props.transactions} />
            )}
        </motion.div>
    );
}
