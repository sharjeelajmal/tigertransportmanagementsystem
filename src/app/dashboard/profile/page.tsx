"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProfileBanner from "@/components/profile/ProfileBanner";
import ProfileSecurity from "@/components/profile/ProfileSecurity";
import ProfileActivity from "@/components/profile/ProfileActivity";

export default function ProfilePage() {
    const router = useRouter();
    const { role, username } = useAuth();

    const displayName = username || (role === "admin" ? "Admin" : "Manager");
    const displayRole = role === "admin" ? "Super Admin" : "Manager";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5 max-w-4xl mx-auto pb-10"
        >
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-all cursor-pointer"
                >
                    <ArrowLeft size={18} />
                </motion.button>
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">My Profile</h1>
                    <p className="text-gray-400 text-xs md:text-sm mt-0.5">Manage your account settings</p>
                </div>
            </motion.div>

            {/* Banner */}
            <ProfileBanner username={displayName} role={role || ""} displayRole={displayRole} />

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <ProfileSecurity />
                <ProfileActivity role={role || ""} />
            </div>
        </motion.div>
    );
}
