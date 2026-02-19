"use client";

import { motion, type Variants } from "framer-motion";
import {
    TrendingUp,
    TrendingDown,
    Truck,
    Users,
    DollarSign,
    Activity,
    ArrowUpRight,
    MoreHorizontal,
    MapPin,
    Clock,
} from "lucide-react";

const stats = [
    {
        title: "Total Revenue",
        value: "Rs. 2,45,000",
        change: "+12.5%",
        up: true,
        icon: DollarSign,
        color: "#B50104",
        bg: "rgba(181,1,4,0.08)",
    },
    {
        title: "Active Vehicles",
        value: "48",
        change: "+3 today",
        up: true,
        icon: Truck,
        color: "#0D9488",
        bg: "rgba(13,148,136,0.08)",
    },
    {
        title: "Total Drivers",
        value: "124",
        change: "-2 this week",
        up: false,
        icon: Users,
        color: "#7C3AED",
        bg: "rgba(124,58,237,0.08)",
    },
    {
        title: "Trips Today",
        value: "89",
        change: "+8.2%",
        up: true,
        icon: Activity,
        color: "#D97706",
        bg: "rgba(217,119,6,0.08)",
    },
];

const recentTrips = [
    { id: "TRP-001", driver: "Ali Hassan", route: "Karachi → Lahore", status: "Active", time: "2h ago" },
    { id: "TRP-002", driver: "Usman Khan", route: "Lahore → Islamabad", status: "Completed", time: "4h ago" },
    { id: "TRP-003", driver: "Bilal Ahmed", route: "Islamabad → Peshawar", status: "Active", time: "1h ago" },
    { id: "TRP-004", driver: "Tariq Mehmood", route: "Faisalabad → Multan", status: "Delayed", time: "6h ago" },
    { id: "TRP-005", driver: "Zubair Shah", route: "Quetta → Karachi", status: "Completed", time: "8h ago" },
];

const statusColors: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Completed: "bg-blue-50 text-blue-600 border-blue-200",
    Delayed: "bg-red-50 text-[#B50104] border-red-200",
};

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function DashboardPage() {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 max-w-7xl mx-auto"
        >
            {/* Page Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-[#0D0D0D] tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Welcome back, Admin 👋</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
                    style={{ background: "linear-gradient(135deg, #B50104, #8B0003)", boxShadow: "0 4px 15px rgba(181,1,4,0.3)" }}
                >
                    <Truck size={16} />
                    Add Vehicle
                </motion.button>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.title}
                        variants={itemVariants}
                        whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.1)" }}
                        className="bg-white rounded-2xl p-5 border border-gray-100 cursor-pointer transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.title}</p>
                                <p className="text-2xl font-black text-[#0D0D0D] mt-1.5">{stat.value}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    {stat.up ? (
                                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                    ) : (
                                        <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                                    )}
                                    <span className={`text-xs font-semibold ${stat.up ? "text-emerald-500" : "text-red-500"}`}>
                                        {stat.change}
                                    </span>
                                </div>
                            </div>
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                style={{ background: stat.bg }}
                            >
                                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* Recent Trips Table */}
                <motion.div
                    variants={itemVariants}
                    className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden"
                >
                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        <div>
                            <h3 className="font-bold text-[#0D0D0D]">Recent Trips</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Latest transport activities</p>
                        </div>
                        <button className="text-xs font-semibold text-[#B50104] flex items-center gap-1 hover:gap-2 transition-all">
                            View All <ArrowUpRight size={14} />
                        </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recentTrips.map((trip, i) => (
                            <motion.div
                                key={trip.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.07 }}
                                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/70 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                    style={{ background: "linear-gradient(135deg, #B50104, #8B0003)" }}>
                                    {trip.driver.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#0D0D0D] truncate">{trip.driver}</p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                        <p className="text-xs text-gray-400 truncate">{trip.route}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${statusColors[trip.status]}`}>
                                        {trip.status}
                                    </span>
                                    <div className="flex items-center gap-1 text-gray-400">
                                        <Clock className="w-3 h-3" />
                                        <span className="text-xs">{trip.time}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Quick Stats Panel */}
                <motion.div variants={itemVariants} className="space-y-4">
                    {/* Fleet Status */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-[#0D0D0D]">Fleet Status</h3>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: "On Route", count: 28, total: 48, color: "#B50104" },
                                { label: "Available", count: 14, total: 48, color: "#10B981" },
                                { label: "Maintenance", count: 6, total: 48, color: "#F59E0B" },
                            ].map((item) => (
                                <div key={item.label}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-gray-600 font-medium">{item.label}</span>
                                        <span className="font-bold text-[#0D0D0D]">{item.count}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(item.count / item.total) * 100}%` }}
                                            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                                            className="h-full rounded-full"
                                            style={{ background: item.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Revenue Card */}
                    <div className="rounded-2xl p-5 text-white relative overflow-hidden"
                        style={{ background: "linear-gradient(135deg, #B50104 0%, #8B0003 100%)" }}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                        <div className="relative z-10">
                            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Monthly Target</p>
                            <p className="text-3xl font-black mt-1">78%</p>
                            <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "78%" }}
                                    transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                                    className="h-full bg-white rounded-full"
                                />
                            </div>
                            <p className="text-white/60 text-xs mt-2">Rs. 1,91,100 of Rs. 2,45,000</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
