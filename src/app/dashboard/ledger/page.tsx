"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, PlusCircle, Users, BookOpen, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import CustomDatePicker from "@/components/CustomDatePicker";
import CustomDropdown from "@/components/CustomDropdown";
import LedgerStats from "@/components/ledger/LedgerStats";
import LedgerTransactions from "@/components/ledger/LedgerTransactions";
import AddLedgerEntryModal from "@/components/ledger/AddLedgerEntryModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PartyOption {
    value: string;     // The party name (used as the lookup key)
    label: string;
    type: "Customer" | "Outsider" | "Both";
}

interface PartyLedgerData {
    partyName: string;
    entries: {
        _id: string;
        date: string;
        docNo: string;
        narration: string;
        entryType: "Debit" | "Credit";
        debit: number;
        credit: number;
        balance: number;
    }[];
    totalDebit: number;
    totalCredit: number;
    netBalance: number;
}

interface GeneralLedgerData {
    totalCashIn: number;
    totalCashOut: number;
    totalPayrollOut: number;
    totalExpenseOut: number;
    netBalance: number;
    totalPayables: number;
    transactions: any[];
}

const typeOptions = [
    { value: "All", label: "All Types" },
    { value: "Expense", label: "Expense" },
    { value: "Payroll", label: "Payroll" },
    { value: "Outsider Payment", label: "Outsider Payment" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateLabel(d: string): string {
    if (!d) return "";
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LedgerPage() {
    const router = useRouter();

    // ── Party Selector ──────────────────────────────────────────────────────
    const [partyOptions, setPartyOptions] = useState<PartyOption[]>([]);
    const [partyOptionsLoading, setPartyOptionsLoading] = useState(true);
    const [selectedParty, setSelectedParty] = useState<PartyOption | null>(null);

    // ── Filters ─────────────────────────────────────────────────────────────
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [typeFilter, setTypeFilter] = useState("All"); // only for general mode

    // ── Data ────────────────────────────────────────────────────────────────
    const [partyData, setPartyData] = useState<PartyLedgerData | null>(null);
    const [generalData, setGeneralData] = useState<GeneralLedgerData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // ── Modal ───────────────────────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ════════════════════════════════════════════════════════════════════════
    // Load party options (Customers + Outsiders, de-duplicated by name)
    // ════════════════════════════════════════════════════════════════════════
    useEffect(() => {
        const loadParties = async () => {
            setPartyOptionsLoading(true);
            try {
                const [custRes, outRes] = await Promise.all([
                    fetch("/api/customers"),
                    fetch("/api/outsiders"),
                ]);
                const custJson = await custRes.json();
                const outJson = await outRes.json();

                const nameMap = new Map<string, PartyOption>();

                (custJson.data || []).forEach((c: any) => {
                    const name: string = (c.customerName || "").trim();
                    if (!name) return;
                    nameMap.set(name.toLowerCase(), {
                        value: name,
                        label: name,
                        type: "Customer",
                    });
                });

                (outJson.data || []).forEach((o: any) => {
                    const name: string = (o.outsiderName || "").trim();
                    if (!name) return;
                    const key = name.toLowerCase();
                    if (nameMap.has(key)) {
                        // Dual-role party
                        nameMap.set(key, {
                            value: name,
                            label: `${name} ★`,
                            type: "Both",
                        });
                    } else {
                        nameMap.set(key, {
                            value: name,
                            label: name,
                            type: "Outsider",
                        });
                    }
                });

                const sorted = Array.from(nameMap.values()).sort((a, b) =>
                    a.value.localeCompare(b.value)
                );

                setPartyOptions(sorted);
            } catch (err) {
                console.error("Failed to load parties:", err);
            } finally {
                setPartyOptionsLoading(false);
            }
        };
        loadParties();
    }, []);

    // ════════════════════════════════════════════════════════════════════════
    // Fetch ledger data whenever filters or party change
    // ════════════════════════════════════════════════════════════════════════
    const fetchLedger = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedParty) params.set("partyName", selectedParty.value);
            if (startDate) params.set("startDate", startDate);
            if (endDate) params.set("endDate", endDate);

            const res = await fetch(`/api/ledger?${params.toString()}`);
            const json = await res.json();

            if (!json.success) throw new Error(json.error);

            if (json.mode === "party") {
                setPartyData(json.data as PartyLedgerData);
                setGeneralData(null);
            } else {
                setGeneralData(json.data as GeneralLedgerData);
                setPartyData(null);
            }
        } catch (err) {
            console.error("Failed to fetch ledger:", err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedParty, startDate, endDate]);

    useEffect(() => {
        fetchLedger();
    }, [fetchLedger]);

    // ── Derived filtered general transactions ────────────────────────────────
    const filteredTransactions =
        generalData?.transactions?.filter(
            (t: any) => typeFilter === "All" || t.type === typeFilter
        ) || [];

    // ────────────────────────────────────────────────────────────────────────
    // Build dropdown options with party type badge in label
    // ────────────────────────────────────────────────────────────────────────
    const dropdownOptions = partyOptions.map((p) => ({
        value: p.value,
        label:
            p.type === "Both"
                ? `${p.value}  [Customer + Outsider]`
                : p.type === "Outsider"
                ? `${p.value}  [Outsider]`
                : `${p.value}  [Customer]`,
    }));

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="space-y-5 max-w-7xl mx-auto">
            {/* ── Page Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3 flex-wrap"
            >
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                            Ledger &amp; Reports
                        </h1>
                        <p className="text-gray-400 text-xs md:text-sm mt-0.5">
                            {selectedParty
                                ? `Viewing ledger for: `
                                : "General financial overview • Real-time analytics"}
                            {selectedParty && (
                                <span className="font-bold text-gray-700">{selectedParty.value}</span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Add Entry button — only in party mode */}
                {selectedParty && (
                    <motion.button
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-white cursor-pointer transition-all hover:opacity-90 active:scale-95"
                        style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                    >
                        <PlusCircle size={16} />
                        Add Receipt / Payment
                    </motion.button>
                )}
            </motion.div>

            {/* ── Party Selector + Filters ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 space-y-4"
                style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
            >
                {/* Section Label */}
                <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-gray-400" />
                    <p className="text-xs font-black text-gray-900 uppercase tracking-wider">
                        Select Party &amp; Filters
                    </p>
                </div>

                {/* Row 1: Party dropdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <CustomDropdown
                            label="Party (Customer / Outsider)"
                            options={[{ value: "", label: "— General Overview —" }, ...dropdownOptions]}
                            value={selectedParty?.value || ""}
                            onChange={(val) => {
                                if (!val) {
                                    setSelectedParty(null);
                                } else {
                                    const found = partyOptions.find((p) => p.value === val);
                                    setSelectedParty(found || null);
                                }
                                setStartDate("");
                                setEndDate("");
                            }}
                            placeholder="Search or select a party…"
                            searchable
                            isLoading={partyOptionsLoading}
                        />
                        {/* Dual-role badge */}
                        {selectedParty?.type === "Both" && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-[10px] mt-1.5 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                                style={{ background: "rgba(79,70,229,0.08)", color: "#4F46E5" }}
                            >
                                <Users size={10} />
                                Dual-role party — Combined ledger shown
                            </motion.p>
                        )}
                    </div>

                    {/* Type filter — only in general mode */}
                    {!selectedParty && (
                        <CustomDropdown
                            label="Transaction Type"
                            options={typeOptions}
                            value={typeFilter}
                            onChange={setTypeFilter}
                        />
                    )}
                </div>

                {/* Row 2: Date filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CustomDatePicker
                        label="From Date"
                        value={startDate}
                        onChange={(d) => setStartDate(toDateStr(d))}
                    />
                    <CustomDatePicker
                        label="To Date"
                        value={endDate}
                        onChange={(d) => setEndDate(toDateStr(d))}
                    />
                </div>

                {/* Active date range label */}
                {(startDate || endDate) && (
                    <div className="flex items-center gap-3">
                        <p className="text-xs text-gray-400">
                            {startDate && (
                                <>
                                    From <span className="font-bold text-gray-600">{formatDateLabel(startDate)}</span>
                                </>
                            )}
                            {startDate && endDate && <> &mdash; </>}
                            {endDate && (
                                <>
                                    To <span className="font-bold text-gray-600">{formatDateLabel(endDate)}</span>
                                </>
                            )}
                        </p>
                        <button
                            onClick={() => { setStartDate(""); setEndDate(""); }}
                            className="flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:underline"
                            style={{ color: "var(--primary)" }}
                        >
                            <X size={10} /> Clear
                        </button>
                    </div>
                )}
            </motion.div>

            {/* ── Loading ── */}
            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader />
                </div>
            ) : (
                <>
                    {/* ══ PARTY MODE ══════════════════════════════════════════════════ */}
                    {partyData && (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={partyData.partyName}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                className="space-y-5"
                            >
                                {/* Stats */}
                                <LedgerStats
                                    mode="party"
                                    data={{
                                        totalDebit: partyData.totalDebit,
                                        totalCredit: partyData.totalCredit,
                                        netBalance: partyData.netBalance,
                                    }}
                                />

                                {/* Empty state */}
                                {partyData.entries.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white rounded-2xl border border-gray-100 p-12 text-center"
                                        style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
                                    >
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                            style={{ background: "rgba(181,1,4,0.06)" }}
                                        >
                                            <BookOpen size={24} style={{ color: "var(--primary)" }} />
                                        </div>
                                        <p className="text-sm font-black text-gray-700">No transactions yet</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            No ledger entries found for <span className="font-bold">{partyData.partyName}</span>
                                            {(startDate || endDate) && " in the selected date range"}.
                                        </p>
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="mt-4 px-5 py-2.5 rounded-xl text-sm font-black text-white cursor-pointer hover:opacity-90 transition-all"
                                            style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                                        >
                                            Add First Entry
                                        </button>
                                    </motion.div>
                                ) : (
                                    <LedgerTransactions mode="party" entries={partyData.entries} />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {/* ══ GENERAL MODE ════════════════════════════════════════════════ */}
                    {generalData && (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key="general"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                className="space-y-5"
                            >
                                {/* Stats */}
                                <LedgerStats
                                    mode="general"
                                    data={{
                                        totalCashIn: generalData.totalCashIn,
                                        totalCashOut: generalData.totalCashOut,
                                        netBalance: generalData.netBalance,
                                        totalPayables: generalData.totalPayables,
                                    }}
                                />

                                {/* Cash Flow Breakdown */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6"
                                    style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
                                >
                                    <p className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4">
                                        Cash Flow Breakdown
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <CashFlowItem label="Customer Income" amount={generalData.totalCashIn} color="#10B981" />
                                        <CashFlowItem label="Payroll Paid" amount={generalData.totalPayrollOut} color="#4F46E5" />
                                        <CashFlowItem label="Expenses Paid" amount={generalData.totalExpenseOut} color="var(--primary)" />
                                        <CashFlowItem label="Pending Payables" amount={generalData.totalPayables} color="#F59E0B" />
                                    </div>
                                </motion.div>

                                {/* Transactions */}
                                <LedgerTransactions
                                    mode="general"
                                    transactions={filteredTransactions}
                                />
                            </motion.div>
                        </AnimatePresence>
                    )}
                </>
            )}

            {/* ── Add Entry Modal ── */}
            {selectedParty && (
                <AddLedgerEntryModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchLedger}
                    partyName={selectedParty.value}
                    partyType={selectedParty.type}
                />
            )}
        </div>
    );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function CashFlowItem({ label, amount, color }: { label: string; amount: number; color: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl p-4 border border-gray-100"
            style={{ background: `${color}08` }}
        >
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
            <p className="text-lg md:text-xl font-black mt-1" style={{ color }}>
                {amount.toLocaleString()}/-
            </p>
        </motion.div>
    );
}
