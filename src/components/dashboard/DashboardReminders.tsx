"use client";

import { motion } from "framer-motion";
import { Bell, Clock, AlertTriangle } from "lucide-react";

interface Props {
    reminders: any[];
    isLoading: boolean;
}

export default function DashboardReminders({ reminders, isLoading }: Props) {
    const now = new Date();

    const isOverdue = (dateStr: string) => {
        const d = new Date(dateStr);
        return d < new Date(now.getFullYear(), now.getMonth(), now.getDate());
    };

    const daysLeft = (dateStr: string) => {
        const d = new Date(dateStr);
        const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return `${Math.abs(diff)}d overdue`;
        if (diff === 0) return "Due today";
        return `${diff}d left`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
        >
            <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Bell size={15} style={{ color: "var(--primary)" }} />
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Quick Alerts</h2>
            </div>

            <div className="divide-y divide-gray-50">
                {isLoading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="px-4 md:px-6 py-4 animate-pulse flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0" />
                            <div className="flex-1 space-y-2"><div className="h-4 bg-gray-100 rounded w-3/4" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>
                        </div>
                    ))
                ) : reminders.length === 0 ? (
                    <div className="px-6 py-10 text-center">
                        <p className="text-sm text-gray-400 font-medium">No upcoming reminders 🎉</p>
                    </div>
                ) : (
                    reminders.map((r, i) => {
                        const overdue = isOverdue(r.reminderDate);
                        return (
                            <motion.div
                                key={r._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.06 }}
                                className="px-4 md:px-6 py-3.5 flex items-start gap-3 transition-colors"
                                style={{ background: overdue ? "rgba(var(--primary-rgb, 181,1,4),0.03)" : "transparent" }}
                            >
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                    style={{ background: overdue ? "rgba(var(--primary-rgb, 181,1,4),0.1)" : "rgba(245,158,11,0.1)" }}>
                                    {overdue ? <AlertTriangle size={14} style={{ color: "var(--primary)" }} /> : <Clock size={14} className="text-amber-500" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 truncate">{r.details}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs text-gray-400">{new Date(r.reminderDate).toLocaleDateString('en-GB')}</p>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${overdue ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-600"}`}>
                                            {daysLeft(r.reminderDate)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
}
