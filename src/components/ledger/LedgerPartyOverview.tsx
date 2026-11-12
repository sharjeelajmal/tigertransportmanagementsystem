"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, BookOpen, Users, RefreshCw } from "lucide-react";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";
import { formatLedgerDate } from "@/lib/ledgerRules";
import {
    filterPartyBalances,
    isZeroBalance,
    totalsOf,
    type PartyBalanceRow,
} from "@/lib/ledgerBalances";

interface LedgerPartyOverviewProps {
    /** Opens the selected party's ledger. */
    onShowLedger: (row: PartyBalanceRow) => void;
    /** Change it to reload balances (e.g. after an entry was added elsewhere). */
    refreshKey?: number;
}

const PAGE_SIZE = 25;

const money = (n: number) => Math.round(n).toLocaleString("en-US");

/** balance > 0 → party owes us (Lena); < 0 → we owe the party (Dena). */
function BalanceCell({ balance }: { balance: number }) {
    if (isZeroBalance(balance)) {
        return <span className="text-sm font-bold text-gray-400">0 <span className="text-[10px] font-semibold">Settled</span></span>;
    }
    const receivable = balance > 0;
    return (
        <span className="text-sm font-black whitespace-nowrap" style={{ color: receivable ? "#4F46E5" : "#D97706" }}>
            {receivable ? "" : "-"}{money(Math.abs(balance))}
            <span className="text-[10px] font-semibold ml-1 opacity-80">{receivable ? "Lena" : "Dena"}</span>
        </span>
    );
}

const roleBadge: Record<PartyBalanceRow["partyType"], { label: string; bg: string; color: string }> = {
    Customer: { label: "Customer", bg: "rgba(37,99,235,0.08)", color: "#2563EB" },
    Outsider: { label: "Outsider", bg: "rgba(124,58,237,0.08)", color: "#7C3AED" },
    Both: { label: "Customer + Outsider", bg: "rgba(79,70,229,0.08)", color: "#4F46E5" },
};

export default function LedgerPartyOverview({ onShowLedger, refreshKey = 0 }: LedgerPartyOverviewProps) {
    const [search, setSearch] = useState("");
    const [hideZero, setHideZero] = useState(true);
    const [page, setPage] = useState(1);
    const [reloadTick, setReloadTick] = useState(0);

    // Result is tagged with the request it belongs to, so "loading" is derived (no setState in the effect body)
    const requestKey = `${refreshKey}:${reloadTick}`;
    const [result, setResult] = useState<{ key: string; rows: PartyBalanceRow[]; error: string } | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        fetch("/api/ledger/balances", { signal: controller.signal })
            .then(async (res) => {
                const json = await res.json().catch(() => null);
                if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to load party balances");
                setResult({ key: requestKey, rows: json.data.rows as PartyBalanceRow[], error: "" });
            })
            .catch((err: unknown) => {
                if (controller.signal.aborted) return;
                setResult({ key: requestKey, rows: [], error: err instanceof Error ? err.message : "Failed to load party balances" });
            });
        return () => controller.abort();
    }, [requestKey]);

    const isLoading = result?.key !== requestKey;
    const rows = useMemo(() => result?.rows ?? [], [result]);
    const error = isLoading ? "" : result?.error ?? "";

    const visible = useMemo(() => filterPartyBalances(rows, search, hideZero), [rows, search, hideZero]);
    const totals = useMemo(() => totalsOf(visible), [visible]);
    const zeroCount = useMemo(() => rows.filter((r) => isZeroBalance(r.balance)).length, [rows]);

    const changeSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };
    const toggleHideZero = () => {
        setHideZero((v) => !v);
        setPage(1);
    };

    const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
    const pageRows = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const lastPaymentText = useCallback(
        (r: PartyBalanceRow) => (r.lastPayment ? `${formatLedgerDate(r.lastPayment.date)} (${money(r.lastPayment.amount)})` : "—"),
        []
    );

    const netReceivable = totals.netBalance >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden print:border-none print:shadow-none"
            style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
        >
            {/* Header + toolbar */}
            <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3 print:hidden">
                <div className="flex items-center gap-2 mr-auto">
                    <Users size={16} className="text-[var(--primary)]" />
                    <div>
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">All Parties Ledger</h2>
                        <p className="text-[11px] text-gray-400 font-medium">Kis se lena hai, kis ko dena hai — sab parties ek jagah</p>
                    </div>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search party..."
                        value={search}
                        onChange={(e) => changeSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-[var(--primary)]"
                    />
                </div>

                <button
                    type="button"
                    role="switch"
                    aria-checked={hideZero}
                    onClick={toggleHideZero}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-gray-200 bg-white text-xs font-bold text-gray-700 hover:border-gray-300 transition-colors cursor-pointer"
                    title="Zero balance wali parties chhupayein / dikhayein"
                >
                    <span
                        className="relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors"
                        style={{ background: hideZero ? "var(--primary)" : "#D1D5DB" }}
                    >
                        <span
                            className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
                            style={{ left: hideZero ? "18px" : "2px" }}
                        />
                    </span>
                    Hide zero balances
                    {zeroCount > 0 && <span className="text-gray-400 font-semibold">({zeroCount})</span>}
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader />
                </div>
            ) : error ? (
                <div className="px-6 py-12 text-center">
                    <p className="text-sm font-bold text-red-600">{error}</p>
                    <button
                        type="button"
                        onClick={() => setReloadTick((t) => t + 1)}
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                        <RefreshCw size={13} /> Try again
                    </button>
                </div>
            ) : (
                <>
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto print:hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/60">
                                    {["Sr. #", "Party Name", "Debit (PKR)", "Credit (PKR)", "Balance (PKR)", "Last Payment", "Action"].map((h) => (
                                        <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pageRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center text-gray-400 text-sm">
                                            {rows.length === 0 ? "No ledger entries yet" : "No parties match the filters"}
                                        </td>
                                    </tr>
                                ) : (
                                    pageRows.map((r, i) => {
                                        const badge = roleBadge[r.partyType];
                                        return (
                                            <tr key={r.partyName} className="border-b border-gray-50 hover:bg-[#FFF8F8] transition-colors">
                                                <td className="px-5 py-3 text-xs text-gray-400 font-medium">
                                                    {String((page - 1) * PAGE_SIZE + i + 1).padStart(2, "0")}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <p className="text-sm font-bold text-gray-800 whitespace-nowrap">{r.partyName}</p>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>
                                                        {badge.label}
                                                    </span>
                                                    {!r.registered && (
                                                        <span className="ml-1 text-[10px] font-bold text-amber-600" title="This name is not registered as a customer or outsider">
                                                            Not registered
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3 text-sm font-bold text-gray-700">{money(r.totalDebit)}</td>
                                                <td className="px-5 py-3 text-sm font-bold text-gray-700">{money(r.totalCredit)}</td>
                                                <td className="px-5 py-3"><BalanceCell balance={r.balance} /></td>
                                                <td className="px-5 py-3 text-xs text-gray-500 font-medium whitespace-nowrap">{lastPaymentText(r)}</td>
                                                <td className="px-5 py-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => onShowLedger(r)}
                                                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-bold cursor-pointer bg-primary shadow-md whitespace-nowrap hover:opacity-90"
                                                    >
                                                        <BookOpen size={13} />
                                                        Show Ledger
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden divide-y divide-gray-50 print:hidden">
                        {pageRows.length === 0 ? (
                            <div className="px-4 py-16 text-center text-gray-400 text-sm">No parties match the filters</div>
                        ) : (
                            pageRows.map((r) => (
                                <div key={r.partyName} className="px-4 py-4 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate">{r.partyName}</p>
                                            <p className="text-[11px] text-gray-400">Last payment: {lastPaymentText(r)}</p>
                                        </div>
                                        <BalanceCell balance={r.balance} />
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Dr {money(r.totalDebit)} &bull; Cr {money(r.totalCredit)}</span>
                                        <button
                                            type="button"
                                            onClick={() => onShowLedger(r)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold cursor-pointer bg-primary"
                                        >
                                            <BookOpen size={12} /> Show Ledger
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="border-t border-gray-100 bg-white print:hidden">
                            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                        </div>
                    )}

                    {/* Totals (of the parties shown) */}
                    <div className="px-4 md:px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 print:hidden">
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-bold text-gray-600">
                            <span>Total Debit: <span className="text-gray-900">{money(totals.totalDebit)}</span></span>
                            <span>Total Credit: <span className="text-gray-900">{money(totals.totalCredit)}</span></span>
                            <span>Lena hai: <span style={{ color: "#4F46E5" }}>{money(totals.receivable)}</span></span>
                            <span>Dena hai: <span style={{ color: "#D97706" }}>{money(totals.payable)}</span></span>
                        </div>
                        <div className="text-sm font-black text-gray-900">
                            Net Balance:{" "}
                            <span style={{ color: netReceivable ? "#4F46E5" : "#D97706" }}>
                                {netReceivable ? "" : "-"}{money(Math.abs(totals.netBalance))}
                            </span>
                            <span className="ml-1 text-[11px] font-semibold text-gray-500">
                                ({netReceivable ? "Lena hai" : "Dena hai"} &bull; {totals.parties} parties)
                            </span>
                        </div>
                    </div>

                    {/* Print table (all filtered rows) */}
                    <div className="hidden print:block w-full">
                        <p className="text-sm font-black uppercase mb-2">All Parties Ledger{hideZero ? " (zero balances hidden)" : ""}</p>
                        <table className="w-full border-collapse border border-gray-900 text-xs text-gray-900">
                            <thead>
                                <tr className="bg-gray-100 uppercase font-black">
                                    {["#", "Party Name", "Debit", "Credit", "Balance", "Last Payment"].map((h) => (
                                        <th key={h} className="px-2 py-1.5 text-left border border-gray-900">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((r, i) => (
                                    <tr key={r.partyName} className="break-inside-avoid">
                                        <td className="px-2 py-1 border border-gray-900">{i + 1}</td>
                                        <td className="px-2 py-1 border border-gray-900 font-bold">{r.partyName}</td>
                                        <td className="px-2 py-1 border border-gray-900 text-right">{money(r.totalDebit)}</td>
                                        <td className="px-2 py-1 border border-gray-900 text-right">{money(r.totalCredit)}</td>
                                        <td className="px-2 py-1 border border-gray-900 text-right font-black">{money(r.balance)}</td>
                                        <td className="px-2 py-1 border border-gray-900 whitespace-nowrap">{lastPaymentText(r)}</td>
                                    </tr>
                                ))}
                                <tr className="font-black">
                                    <td className="px-2 py-1.5 border border-gray-900" colSpan={2}>Total ({totals.parties} parties)</td>
                                    <td className="px-2 py-1.5 border border-gray-900 text-right">{money(totals.totalDebit)}</td>
                                    <td className="px-2 py-1.5 border border-gray-900 text-right">{money(totals.totalCredit)}</td>
                                    <td className="px-2 py-1.5 border border-gray-900 text-right">{money(totals.netBalance)}</td>
                                    <td className="px-2 py-1.5 border border-gray-900"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </motion.div>
    );
}
