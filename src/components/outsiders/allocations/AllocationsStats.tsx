'use client';

import { motion } from 'framer-motion';
import { LayoutDashboard, Truck, HardHat, Database } from 'lucide-react';
import Loader from '@/components/Loader';

interface AllocationsStatsProps {
    stats: {
        totalAllocations: number;
        totalAmount: number;
        paidAmount: number;
        remainingAmount: number;
    };
    isLoading: boolean;
}

export default function AllocationsStats({ stats, isLoading }: AllocationsStatsProps) {
    const statsCards = [
        { label: "Total Allocations", value: String(stats.totalAllocations).padStart(2, '0'), icon: LayoutDashboard, sub: "All time" },
        { label: "Total Amount", value: `${stats.totalAmount.toLocaleString()}/-`, icon: Database, sub: "Gross" },
        { label: "Paid Amount", value: `${stats.paidAmount.toLocaleString()}/-`, icon: Database, sub: "Received" },
        { label: "Remaining Amount", value: `${stats.remainingAmount.toLocaleString()}/-`, icon: Database, sub: "Pending" },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {statsCards.map((card, i) => (
                <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -3 }}
                    className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 relative overflow-hidden group cursor-pointer"
                    style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
                >
                    <div
                        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                        style={{ background: "linear-gradient(90deg, var(--primary), var(--primary-light))" }}
                    />
                    <div className="flex items-start justify-between mt-1">
                        <div className="min-w-0">
                            <p className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
                                {card.label}
                            </p>
                            <p className="text-2xl md:text-3xl font-black text-gray-900 mt-1 leading-none">
                                {isLoading ? <Loader size="sm" /> : card.value}
                            </p>
                            <p className="text-[10px] md:text-xs text-gray-400 mt-1">{card.sub}</p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
