"use client";

import { motion } from "framer-motion";
import { Users, Truck, Receipt, AlertTriangle } from "lucide-react";
import Loader from "@/components/Loader";

interface Props {
    totalStaff: number;
    presentToday: number;
    activeVehicles: number;
    totalVehicles: number;
    totalExpenses: number;
    totalPayables: number;
    isLoading: boolean;
}

export default function DashboardStats({ totalStaff, presentToday, activeVehicles, totalVehicles, totalExpenses, totalPayables, isLoading }: Props) {
    const cards = [
        {
            label: "Total Staff",
            value: totalStaff,
            sub: `${presentToday} present today`,
            icon: Users,
            gradient: "linear-gradient(135deg, #4F46E5, #6366F1)",
            iconBg: "rgba(79,70,229,0.1)",
            iconColor: "#4F46E5",
        },
        {
            label: "Active Vehicles",
            value: activeVehicles,
            sub: `${totalVehicles} total fleet`,
            icon: Truck,
            gradient: "linear-gradient(135deg, #0891B2, #06B6D4)",
            iconBg: "rgba(8,145,178,0.1)",
            iconColor: "#0891B2",
        },
        {
            label: "Monthly Expenses",
            value: `${totalExpenses.toLocaleString()}`,
            sub: "Current month total",
            icon: Receipt,
            gradient: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
            iconBg: "rgba(var(--primary-rgb, 181,1,4),0.08)",
            iconColor: "var(--primary)",
            prefix: "PKR ",
        },
        {
            label: "Total Payables",
            value: `${totalPayables.toLocaleString()}`,
            sub: "Outstanding payments",
            icon: AlertTriangle,
            gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
            iconBg: "rgba(245,158,11,0.1)",
            iconColor: "#F59E0B",
            prefix: "PKR ",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {cards.map((card, i) => (
                <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
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
                                {isLoading ? <Loader size="sm" /> : <>{card.prefix || ""}{card.value}</>}
                            </p>
                            <p className="text-[10px] md:text-xs text-gray-400 mt-1.5 font-medium">{card.sub}</p>
                        </div>
                        <div
                            className="w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                            style={{ background: card.iconBg }}
                        >
                            <card.icon className="w-4 h-4 md:w-5 md:h-5" style={{ color: card.iconColor }} />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
