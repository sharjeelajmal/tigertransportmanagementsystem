"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Pagination from "@/components/Pagination";

interface Transaction {
    _id: string;
    type: string;
    description: string;
    amount: number;
    date: string;
    status: string;
}

const typeBadge = (type: string) => {
    const map: Record<string, { bg: string; color: string }> = {
        "Expense": { bg: "rgba(var(--primary-rgb, 181,1,4),0.08)", color: "var(--primary)" },
        "Payroll": { bg: "rgba(79,70,229,0.1)", color: "#4F46E5" },
        "Outsider Payment": { bg: "rgba(16,185,129,0.1)", color: "#10B981" },
    };
    return map[type] || { bg: "rgba(107,114,128,0.1)", color: "#6B7280" };
};

const statusColor = (status: string) => {
    if (status === "Paid") return "bg-emerald-50 text-emerald-600";
    if (status === "Unpaid") return "bg-red-50 text-red-500";
    return "bg-amber-50 text-amber-600";
};

const ITEMS_PER_PAGE = 10;

export default function LedgerTransactions({ transactions }: { transactions: Transaction[] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
    const paginated = transactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
        >
            <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Transaction History</h2>
                <span className="text-xs text-gray-400 font-medium">{transactions.length} entries</span>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            {["Type", "Description", "Amount", "Date", "Status"].map(h => (
                                <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-400 text-sm">No transactions found</td></tr>
                        ) : (
                            paginated.map((t, i) => {
                                const badge = typeBadge(t.type);
                                return (
                                    <motion.tr key={t._id + i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                        className="border-b border-gray-50 hover:bg-[#FFF8F8] transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: badge.bg, color: badge.color }}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4"><span className="text-sm text-gray-700 font-medium">{t.description}</span></td>
                                        <td className="px-6 py-4"><span className="text-sm font-bold text-gray-900">{t.amount.toLocaleString()}/-</span></td>
                                        <td className="px-6 py-4"><span className="text-sm text-gray-500">{new Date(t.date).toLocaleDateString('en-GB')}</span></td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor(t.status)}`}>{t.status}</span>
                                        </td>
                                    </motion.tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-50">
                {paginated.length === 0 ? (
                    <div className="px-4 py-16 text-center text-gray-400 text-sm">No transactions found</div>
                ) : (
                    paginated.map((t, i) => {
                        const badge = typeBadge(t.type);
                        return (
                            <motion.div key={t._id + i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                className="px-4 py-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>
                                        {t.type}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(t.status)}`}>{t.status}</span>
                                </div>
                                <p className="text-sm font-bold text-gray-800 truncate">{t.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-black text-gray-900">{t.amount.toLocaleString()}/-</span>
                                    <span className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString('en-GB')}</span>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="border-t border-gray-100 bg-white">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}

            {/* Footer */}
            <div className="px-4 md:px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                    Showing <span className="font-bold text-gray-600">{paginated.length}</span> of <span className="font-bold text-gray-600">{transactions.length}</span> transactions
                </p>
                <p className="text-[10px] text-gray-400">Page {currentPage} of {totalPages || 1}</p>
            </div>
        </motion.div>
    );
}
