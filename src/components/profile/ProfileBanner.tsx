"use client";

import { motion } from "framer-motion";
import { Shield, Mail, Calendar } from "lucide-react";

interface ProfileBannerProps {
    username: string;
    role: string;
    displayRole: string;
}

export default function ProfileBanner({ username, role, displayRole }: ProfileBannerProps) {
    const firstLetter = username.charAt(0).toUpperCase();
    const joinDate = "February 2026";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl overflow-hidden border border-gray-100"
            style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.08)" }}
        >
            {/* Gradient Banner */}
            <div
                className="h-36 md:h-44 relative"
                style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 60%, #1a0001 100%)" }}
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                <div className="absolute bottom-0 right-10 w-20 h-20 bg-white/5 rounded-full translate-y-1/3" />
            </div>

            {/* Profile Info */}
            <div className="bg-white px-5 md:px-8 pb-6 pt-0 relative">
                {/* Avatar */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-white text-3xl md:text-4xl font-black border-4 border-white -mt-12 md:-mt-14 relative z-10"
                    style={{
                        background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                        boxShadow: "0 8px 30px rgba(var(--primary-rgb, 181,1,4),0.4)"
                    }}
                >
                    {firstLetter}
                </motion.div>

                <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">{username}</h2>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span
                                className="text-xs font-bold px-3 py-1 rounded-full"
                                style={{ background: "rgba(var(--primary-rgb, 181,1,4),0.08)", color: "var(--primary)" }}
                            >
                                <Shield size={12} className="inline mr-1 -mt-0.5" />
                                {displayRole}
                            </span>
                            <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                <Mail size={12} /> {username.toLowerCase()}@tiger-transport.com
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <Calendar size={13} />
                        Member since {joinDate}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
