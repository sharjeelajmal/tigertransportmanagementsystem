"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardReminders from "@/components/dashboard/DashboardReminders";
import DashboardActivity from "@/components/dashboard/DashboardActivity";
import DashboardFinancial from "@/components/dashboard/DashboardFinancial";
import DashboardChart from "@/components/dashboard/DashboardChart";

interface DashboardData {
    totalStaff: number;
    presentToday: number;
    activeVehicles: number;
    totalVehicles: number;
    totalExpenses: number;
    totalPayroll: number;
    totalPayables: number;
    cashIn: number;
    recentAllocations: any[];
    reminders: any[];
    expenseBreakdown: { name: string; value: number }[];
    vehicleStatusBreakdown: { name: string; value: number }[];
}

export default function DashboardPage() {
    const { username, role } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const displayName = username || (role === "admin" ? "Admin" : "Manager");

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await fetch("/api/dashboard");
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 max-w-7xl mx-auto pb-10">
            {/* Page Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-gray-400 text-xs md:text-sm mt-0.5">
                        Welcome back, {displayName} 👋
                    </p>
                </div>
                <p className="text-xs text-gray-400 font-medium hidden sm:block">
                    {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </motion.div>

            {/* Stats Cards */}
            <DashboardStats
                totalStaff={data?.totalStaff || 0}
                presentToday={data?.presentToday || 0}
                activeVehicles={data?.activeVehicles || 0}
                totalVehicles={data?.totalVehicles || 0}
                totalExpenses={data?.totalExpenses || 0}
                totalPayables={data?.totalPayables || 0}
                isLoading={isLoading}
            />

            {/* Pie Charts */}
            <DashboardChart
                expenseBreakdown={data?.expenseBreakdown || []}
                vehicleStatusBreakdown={data?.vehicleStatusBreakdown || []}
                isLoading={isLoading}
            />

            {/* Middle Section: Reminders + Financial */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <DashboardReminders reminders={data?.reminders || []} isLoading={isLoading} />
                <DashboardFinancial
                    cashIn={data?.cashIn || 0}
                    totalExpenses={data?.totalExpenses || 0}
                    totalPayroll={data?.totalPayroll || 0}
                    isLoading={isLoading}
                />
            </div>

            {/* Bottom: Recent Activity */}
            <DashboardActivity allocations={data?.recentAllocations || []} isLoading={isLoading} />
        </motion.div>
    );
}
