"use client";

import { motion } from "framer-motion";
import { Activity, Shield, Clock, CheckCircle2, Key, Users } from "lucide-react";

interface ProfileActivityProps {
    role: string;
}

export default function ProfileActivity({ role }: ProfileActivityProps) {
    const isAdmin = role === "admin";

    const stats = [
        { label: "Account Status", value: "Active", icon: CheckCircle2, color: "#10B981" },
        { label: "Active Since", value: "Feb 2026", icon: Clock, color: "var(--primary)" },
        { label: "Role Type", value: isAdmin ? "Full Access" : "Limited Access", icon: Key, color: "#7C3AED" },
        { label: "Team Size", value: isAdmin ? "All Staff" : "Assigned", icon: Users, color: "#0891B2" },
    ];

    const permissions = isAdmin
        ? ["Staff Management", "Payroll Processing", "Vehicle Management", "Expense Tracking", "Outsider Allocations", "Reminders", "System Settings"]
        : ["View Staff", "View Payroll", "View Vehicles", "View Expenses", "View Allocations", "View Reminders"];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
        >
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: "linear-gradient(90deg, var(--primary), var(--primary-light))" }} />

            <div className="px-5 md:px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(var(--primary-rgb, 181,1,4),0.08)" }}>
                    <Activity size={16} style={{ color: "var(--primary)" }} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-900">Activity Overview</h3>
                    <p className="text-xs text-gray-400">Account details & permissions</p>
                </div>
            </div>

            <div className="p-5 md:p-6 space-y-5">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {stats.map((s, i) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + i * 0.08 }}
                            className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                        >
                            <s.icon size={16} style={{ color: s.color }} />
                            <p className="text-lg font-black text-gray-900 mt-1.5 leading-none">{s.value}</p>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">{s.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Permissions */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Shield size={14} style={{ color: "var(--primary)" }} />
                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Role Permissions</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {permissions.map((p, i) => (
                            <motion.span
                                key={p}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.04 }}
                                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 border border-gray-100"
                            >
                                {p}
                            </motion.span>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
