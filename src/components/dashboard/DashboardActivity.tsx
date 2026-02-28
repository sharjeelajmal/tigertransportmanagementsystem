"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

interface Props {
    allocations: any[];
    isLoading: boolean;
}

const statusPill = (s: string) => {
    if (s === "Paid") return "bg-emerald-50 text-emerald-600";
    if (s === "Partial Paid") return "bg-sky-50 text-sky-600";
    return "bg-red-50 text-red-500";
};

export default function DashboardActivity({ allocations, isLoading }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
        >
            <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Activity size={15} style={{ color: "var(--primary)" }} />
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Recent Activity</h2>
                <span className="ml-auto text-xs text-gray-400 font-medium">Latest 5</span>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            {["Date", "Type", "Name", "Amount", "Status"].map(h => (
                                <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse border-b border-gray-50">
                                    <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-full" /></td>
                                </tr>
                            ))
                        ) : allocations.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">No recent activity</td></tr>
                        ) : (
                            allocations.map((a, i) => (
                                <motion.tr key={a._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.05 }}
                                    className="border-b border-gray-50 hover:bg-[#FFF8F8] transition-colors">
                                    <td className="px-6 py-3.5"><span className="text-sm text-gray-500">{new Date(a.createdAt).toLocaleDateString('en-GB')}</span></td>
                                    <td className="px-6 py-3.5">
                                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(var(--primary-rgb, 181,1,4),0.08)", color: "var(--primary)" }}>
                                            Allocation
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5"><span className="text-sm font-bold text-gray-800">{a.customerName || a.outsiderName}</span></td>
                                    <td className="px-6 py-3.5"><span className="text-sm font-black text-gray-900">PKR {a.totalAmount?.toLocaleString()}</span></td>
                                    <td className="px-6 py-3.5"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusPill(a.paymentStatus)}`}>{a.paymentStatus}</span></td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-50">
                {isLoading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="px-4 py-4 animate-pulse space-y-2">
                            <div className="h-4 bg-gray-100 rounded w-2/3" />
                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                        </div>
                    ))
                ) : allocations.length === 0 ? (
                    <div className="px-4 py-12 text-center text-sm text-gray-400">No recent activity</div>
                ) : (
                    allocations.map((a, i) => (
                        <motion.div key={a._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
                            className="px-4 py-3.5 space-y-1.5">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-gray-800 truncate">{a.customerName || a.outsiderName}</p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusPill(a.paymentStatus)}`}>{a.paymentStatus}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString('en-GB')}</span>
                                <span className="text-sm font-black text-gray-900">PKR {a.totalAmount?.toLocaleString()}</span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
}
