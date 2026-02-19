"use client";

import { Bell, Search, Menu, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useSidebar } from "@/context/SidebarContext";

export default function Header() {
    const { setMobileOpen } = useSidebar();

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
                {/* Mobile hamburger */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMobileOpen(true)}
                    className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
                >
                    <Menu size={20} />
                </motion.button>

                {/* Search (desktop) */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="pl-10 pr-4 py-2.5 w-72 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#B50104] focus:ring-2 focus:ring-[#B50104]/10 transition-all"
                    />
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 transition-all border border-gray-200"
                >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#B50104] rounded-full ring-2 ring-white" />
                </motion.button>

                <div className="w-px h-6 bg-gray-200" />

                {/* User Profile */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
                >
                    <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: "linear-gradient(135deg, #B50104, #8B0003)" }}
                    >
                        A
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-semibold text-gray-800 leading-none">Admin</p>
                        <p className="text-xs text-gray-400 mt-0.5">Super Admin</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                </motion.button>
            </div>
        </motion.header>
    );
}
