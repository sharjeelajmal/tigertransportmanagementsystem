"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, AlertTriangle } from "lucide-react";

interface StatsProps {
    data: {
        totalCashIn: number;
        totalCashOut: number;
        netBalance: number;
        totalPayables: number;
    };
}

export default function LedgerStats({ data }: StatsProps) {
    const cards = [
        {
            label: "Total Cash In",
            value: data.totalCashIn,
            icon: TrendingUp,
            color: "#10B981",
            bg: "rgba(16,185,129,0.08)",
            gradient: "linear-gradient(135deg, #10B981, #059669)",
        },
        {
            label: "Total Cash Out",
            value: data.totalCashOut,
            icon: TrendingDown,
            color: "var(--primary)",
            bg: "rgba(var(--primary-rgb, 181,1,4),0.08)",
            gradient: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
        },
        {
            label: "Net Balance",
            value: data.netBalance,
            icon: Wallet,
            color: data.netBalance >= 0 ? "#10B981" : "var(--primary)",
            bg: data.netBalance >= 0 ? "rgba(16,185,129,0.08)" : "rgba(var(--primary-rgb, 181,1,4),0.08)",
            gradient: data.netBalance >= 0 ? "linear-gradient(135deg, #10B981, #059669)" : "linear-gradient(135deg, var(--primary), var(--primary-dark))",
        },
        {
            label: "Total Payables",
            value: data.totalPayables,
            icon: AlertTriangle,
            color: "#F59E0B",
            bg: "rgba(245,158,11,0.08)",
            gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {cards.map((card, i) => (
                <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -3 }}
                    className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 relative overflow-hidden group cursor-pointer"
                    style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
                >
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: card.gradient }} />
                    <div className="flex items-start justify-between mt-1">
                        <div className="min-w-0">
                            <p className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
                                {card.label}
                            </p>
                            <p className="text-xl md:text-2xl font-black text-gray-900 mt-1 leading-none">
                                {card.value.toLocaleString()}
                            </p>
                            <p className="text-[10px] md:text-xs mt-1 font-semibold" style={{ color: card.color }}>PKR</p>
                        </div>
                        <div
                            className="w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                            style={{ background: card.bg }}
                        >
                            <card.icon className="w-4 h-4 md:w-5 md:h-5" style={{ color: card.color }} />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
