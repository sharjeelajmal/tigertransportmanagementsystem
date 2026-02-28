"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface Props {
    cashIn: number;
    totalExpenses: number;
    totalPayroll: number;
    isLoading: boolean;
}

export default function DashboardFinancial({ cashIn, totalExpenses, totalPayroll, isLoading }: Props) {
    const totalOut = totalExpenses + totalPayroll;
    const maxVal = Math.max(cashIn, totalOut, 1);

    const bars = [
        { label: "Cash In (Outsiders)", value: cashIn, color: "#10B981", icon: TrendingUp },
        { label: "Expenses", value: totalExpenses, color: "var(--primary)", icon: TrendingDown },
        { label: "Payroll", value: totalPayroll, color: "#4F46E5", icon: Wallet },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
        >
            <div className="px-4 md:px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Financial Overview</h2>
                <p className="text-[10px] text-gray-400 mt-0.5">Current month comparison</p>
            </div>

            <div className="p-4 md:p-6 space-y-5">
                {isLoading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse space-y-2">
                            <div className="h-3 bg-gray-100 rounded w-1/3" />
                            <div className="h-5 bg-gray-100 rounded-full w-full" />
                        </div>
                    ))
                ) : (
                    bars.map((bar, i) => {
                        const percent = maxVal > 0 ? (bar.value / maxVal) * 100 : 0;
                        return (
                            <motion.div key={bar.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <bar.icon size={13} style={{ color: bar.color }} />
                                        <span className="text-xs font-bold text-gray-600">{bar.label}</span>
                                    </div>
                                    <span className="text-xs font-black text-gray-900">PKR {bar.value.toLocaleString()}</span>
                                </div>
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.max(percent, 2)}%` }}
                                        transition={{ delay: 0.6 + i * 0.15, duration: 0.8, ease: "easeOut" }}
                                        className="h-full rounded-full"
                                        style={{ background: bar.color }}
                                    />
                                </div>
                            </motion.div>
                        );
                    })
                )}

                {/* Net Summary */}
                {!isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                        className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net Balance</span>
                        <span className={`text-sm font-black ${cashIn - totalOut >= 0 ? "text-emerald-600" : "text-[var(--primary)]"}`}>
                            PKR {(cashIn - totalOut).toLocaleString()}
                        </span>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
