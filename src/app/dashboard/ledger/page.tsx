"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import CustomDatePicker from "@/components/CustomDatePicker";
import CustomDropdown from "@/components/CustomDropdown";
import LedgerStats from "@/components/ledger/LedgerStats";
import LedgerTransactions from "@/components/ledger/LedgerTransactions";

interface LedgerData {
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

export default function LedgerPage() {
    const router = useRouter();
    const [data, setData] = useState<LedgerData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");

    useEffect(() => {
        fetchLedger();
    }, [startDate, endDate]);

    const fetchLedger = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (startDate) params.set("startDate", startDate);
            if (endDate) params.set("endDate", endDate);
            const res = await fetch(`/api/ledger?${params.toString()}`);
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch {
            console.error("Failed to fetch ledger");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTransactions = data?.transactions?.filter((t: any) =>
        typeFilter === "All" || t.type === typeFilter
    ) || [];

    const formatDateLabel = (d: string) => {
        if (!d) return "";
        return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    };

    return (
        <div className="space-y-5 max-w-7xl mx-auto">
            {/* Page Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()}
                        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Ledger & Reports</h1>
                        <p className="text-gray-400 text-xs md:text-sm mt-0.5">Financial overview &bull; Real-time analytics</p>
                    </div>
                </div>
            </motion.div>

            {/* ── Date & Type Filters ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                <p className="text-xs font-black text-gray-900 uppercase tracking-wider mb-3">Filters</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div>
                        <CustomDatePicker label="From Date" value={startDate}
                            onChange={(date) => {
                                const yyyy = date.getFullYear();
                                const mm = String(date.getMonth() + 1).padStart(2, "0");
                                const dd = String(date.getDate()).padStart(2, "0");
                                setStartDate(`${yyyy}-${mm}-${dd}`);
                            }} />
                    </div>
                    <div>
                        <CustomDatePicker label="To Date" value={endDate}
                            onChange={(date) => {
                                const yyyy = date.getFullYear();
                                const mm = String(date.getMonth() + 1).padStart(2, "0");
                                const dd = String(date.getDate()).padStart(2, "0");
                                setEndDate(`${yyyy}-${mm}-${dd}`);
                            }} />
                    </div>
                    <CustomDropdown label="Transaction Type" options={typeOptions} value={typeFilter} onChange={setTypeFilter} />
                </div>
                {(startDate || endDate) && (
                    <div className="flex items-center gap-3 mt-3">
                        <p className="text-xs text-gray-400">
                            {startDate && <>From <span className="font-bold text-gray-600">{formatDateLabel(startDate)}</span></>}
                            {startDate && endDate && <> — </>}
                            {endDate && <>To <span className="font-bold text-gray-600">{formatDateLabel(endDate)}</span></>}
                        </p>
                        <button onClick={() => { setStartDate(""); setEndDate(""); }}
                            className="text-[10px] font-bold text-[var(--primary)] hover:underline cursor-pointer">
                            Clear Dates
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20"><Loader /></div>
            ) : data && (
                <>
                    {/* Stats Cards */}
                    <LedgerStats data={data} />

                    {/* ── Cash Flow Breakdown ── */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                        <p className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4">Cash Flow Breakdown</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <CashFlowItem label="Outsider Income" amount={data.totalCashIn} color="#10B981" />
                            <CashFlowItem label="Payroll Paid" amount={data.totalPayrollOut} color="#4F46E5" />
                            <CashFlowItem label="Expenses Paid" amount={data.totalExpenseOut} color="var(--primary)" />
                            <CashFlowItem label="Pending Payables" amount={data.totalPayables} color="#F59E0B" />
                        </div>
                    </motion.div>

                    {/* Transactions */}
                    <LedgerTransactions transactions={filteredTransactions} />
                </>
            )}
        </div>
    );
}

function CashFlowItem({ label, amount, color }: { label: string; amount: number; color: string }) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl p-4 border border-gray-100" style={{ background: `${color}08` }}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
            <p className="text-lg md:text-xl font-black mt-1" style={{ color }}>{amount.toLocaleString()}/-</p>
        </motion.div>
    );
}
