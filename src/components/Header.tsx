"use client";

import { Bell, Search, Menu, ChevronDown, Clock, AlertCircle, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Reminder {
    _id: string;
    details: string;
    reminderDate: string;
    reminderTime: string;
    isCompleted: boolean;
}

export default function Header() {
    const { setMobileOpen } = useSidebar();
    const { role, username, logout } = useAuth();
    const router = useRouter();
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const displayName = username || (role === "admin" ? "Admin" : "Manager");
    const displayRole = role === "admin" ? "Super Admin" : "Manager";
    const firstLetter = displayName.charAt(0).toUpperCase();

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/reminders?filter=approaching");
            const data = await res.json();
            if (data.success) setReminders(data.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const getDaysLeft = (dateStr: string) => {
        const reminderDate = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        reminderDate.setHours(0, 0, 0, 0);
        const diffTime = reminderDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Tomorrow";
        if (diffDays < 0) return "Overdue";
        return `${diffDays} days left`;
    };

    const handleLogout = async () => {
        setShowProfileMenu(false);
        await logout();
    };

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="h-16 px-4 md:px-6 bg-white border-b border-gray-100 sticky top-0 z-30 flex items-center justify-between"
            style={{ boxShadow: "0 1px 20px rgba(0,0,0,0.06)" }}
        >
            {/* Left */}
            <div className="flex items-center gap-3">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMobileOpen(true)}
                    className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all cursor-pointer"
                >
                    <Menu size={20} />
                </motion.button>
                <div className="relative hidden md:block">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="pl-10 pr-4 py-2.5 w-72 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
                    />
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <NotificationBell
                    reminders={reminders}
                    showNotifications={showNotifications}
                    setShowNotifications={setShowNotifications}
                    dropdownRef={dropdownRef}
                    getDaysLeft={getDaysLeft}
                />

                <div className="w-px h-6 bg-gray-200" />

                {/* User Profile */}
                <div className="relative" ref={profileRef}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200 cursor-pointer"
                    >
                        <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                            style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                        >
                            {firstLetter}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-semibold text-gray-800 leading-none">{displayName}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{displayRole}</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                    </motion.button>

                    <AnimatePresence>
                        {showProfileMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden"
                            >
                                <div className="p-3 border-b border-gray-100">
                                    <p className="text-sm font-bold text-gray-800">{displayName}</p>
                                    <p className="text-xs text-gray-400">{displayRole}</p>
                                </div>
                                <div className="p-1.5">
                                    <button
                                        onClick={() => { setShowProfileMenu(false); router.push("/dashboard/profile"); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors cursor-pointer"
                                    >
                                        <User size={16} />
                                        View Profile
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.header>
    );
}

/* ── Notification Bell Sub-component ── */
function NotificationBell({ reminders, showNotifications, setShowNotifications, dropdownRef, getDaysLeft }: {
    reminders: Reminder[]; showNotifications: boolean; setShowNotifications: (v: boolean) => void;
    dropdownRef: React.RefObject<HTMLDivElement | null>; getDaysLeft: (d: string) => string;
}) {
    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 transition-all border border-gray-200 cursor-pointer"
            >
                <Bell className="w-4 h-4" />
                {reminders.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1" style={{ background: "var(--primary)", boxShadow: "0 2px 6px rgba(var(--primary-rgb, 181,1,4),0.4)" }}>
                        {reminders.length}
                    </span>
                )}
            </motion.button>
            <AnimatePresence>
                {showNotifications && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-[320px] bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Reminders</h3>
                            <span className="px-2 py-0.5 bg-[var(--primary)] text-white text-[10px] font-black rounded-lg">{reminders.length} New</span>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto">
                            {reminders.length === 0 ? (
                                <div className="p-8 text-center opacity-30">
                                    <Bell className="mx-auto mb-2" size={32} />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No approaching reminders</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {reminders.map((r) => (
                                        <Link key={r._id} href="/dashboard/reminders" onClick={() => setShowNotifications(false)} className="block p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 text-[var(--primary)]"><AlertCircle size={16} /></div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-bold text-gray-800 line-clamp-2 leading-tight mb-1">{r.details}</p>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400"><Clock size={10} />{r.reminderTime}</div>
                                                        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-amber-50 text-amber-500 rounded-md">{getDaysLeft(r.reminderDate)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Link href="/dashboard/reminders" onClick={() => setShowNotifications(false)}
                            className="block py-3 text-center text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 hover:text-[var(--primary)] transition-colors border-t border-gray-100">
                            View All Reminders
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
