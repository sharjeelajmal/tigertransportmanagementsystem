"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, Receipt, CreditCard, Scale } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GeneralStatsData {
    totalCashIn: number;
    totalCashOut: number;
    netBalance: number;
    totalPayables: number;
}

interface PartyStatsData {
    totalDebit: number;
    totalCredit: number;
    netBalance: number;
}

type LedgerStatsProps =
    | { mode: "general"; data: GeneralStatsData }
    | { mode: "party"; data: PartyStatsData };

// ─── Sub-component ────────────────────────────────────────────────────────────

interface StatCard {
    label: string;
    value: number;
    subLabel?: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    gradient: string;
}

function StatCardItem({ card, index }: { card: StatCard; index: number }) {
    return (
        <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -3 }}
            className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 relative overflow-hidden group cursor-default"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
        >
            {/* Top color bar */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: card.gradient }} />

            <div className="flex items-start justify-between mt-1">
                <div className="min-w-0">
                    <p className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
                        {card.label}
                    </p>
                    <p className="text-xl md:text-2xl font-black text-gray-900 mt-1 leading-none">
                        {Math.abs(card.value).toLocaleString()}
                    </p>
                    <p className="text-[10px] md:text-xs mt-1 font-semibold" style={{ color: card.color }}>
                        {card.subLabel || "PKR"}
                    </p>
                </div>
                <div
                    className="w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    style={{ background: card.bg }}
                >
                    <card.icon className="w-4 h-4 md:w-5 md:h-5" style={{ color: card.color }} />
                </div>
            </div>
        </motion.div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LedgerStats(props: LedgerStatsProps) {
    let cards: StatCard[] = [];

    if (props.mode === "party") {
        const { data } = props;
        const isReceivable = data.netBalance >= 0;

        cards = [
            {
                label: "Total Debit",
                value: data.totalDebit,
                subLabel: "PKR — Amount Owed",
                icon: TrendingDown,
                color: "var(--primary)",
                bg: "rgba(181,1,4,0.08)",
                gradient: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
            },
            {
                label: "Total Credit",
                value: data.totalCredit,
                subLabel: "PKR — Amount Received",
                icon: TrendingUp,
                color: "#10B981",
                bg: "rgba(16,185,129,0.08)",
                gradient: "linear-gradient(135deg, #10B981, #059669)",
            },
            {
                label: isReceivable ? "Net Receivable" : "Net Payable",
                value: data.netBalance,
                subLabel: isReceivable ? "PKR — Party Owes Us" : "PKR — We Owe Party",
                icon: Scale,
                color: isReceivable ? "#4F46E5" : "#F59E0B",
                bg: isReceivable ? "rgba(79,70,229,0.08)" : "rgba(245,158,11,0.08)",
                gradient: isReceivable
                    ? "linear-gradient(135deg, #4F46E5, #4338CA)"
                    : "linear-gradient(135deg, #F59E0B, #D97706)",
            },
        ];
    } else {
        const { data } = props;

        cards = [
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
                bg: "rgba(181,1,4,0.08)",
                gradient: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
            },
            {
                label: "Net Balance",
                value: data.netBalance,
                icon: Wallet,
                color: data.netBalance >= 0 ? "#10B981" : "var(--primary)",
                bg: data.netBalance >= 0 ? "rgba(16,185,129,0.08)" : "rgba(181,1,4,0.08)",
                gradient:
                    data.netBalance >= 0
                        ? "linear-gradient(135deg, #10B981, #059669)"
                        : "linear-gradient(135deg, var(--primary), var(--primary-dark))",
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
    }

    return (
        <div className={`grid gap-3 md:gap-4 ${props.mode === "party" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"}`}>
            {cards.map((card, i) => (
                <StatCardItem key={card.label} card={card} index={i} />
            ))}
        </div>
    );
}
