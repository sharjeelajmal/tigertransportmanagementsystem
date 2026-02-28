"use client";

import { motion } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function ProfileSecurity() {
    const [currentPass, setCurrentPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPass !== confirmPass) {
            alert("Passwords do not match!");
            return;
        }
        alert("Password change feature coming soon!");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
        >
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: "linear-gradient(90deg, var(--primary), var(--primary-light))" }} />

            <div className="px-5 md:px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(var(--primary-rgb, 181,1,4),0.08)" }}>
                    <Lock size={16} style={{ color: "var(--primary)" }} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-900">Security</h3>
                    <p className="text-xs text-gray-400">Change your password</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4">
                <PasswordField label="Current Password" value={currentPass} onChange={setCurrentPass} show={showCurrent} toggleShow={() => setShowCurrent(!showCurrent)} />
                <PasswordField label="New Password" value={newPass} onChange={setNewPass} show={showNew} toggleShow={() => setShowNew(!showNew)} />
                <PasswordField label="Confirm Password" value={confirmPass} onChange={setConfirmPass} show={showConfirm} toggleShow={() => setShowConfirm(!showConfirm)} />

                <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(var(--primary-rgb, 181,1,4),0.35)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-2.5 rounded-xl text-white text-sm font-bold cursor-pointer"
                    style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                >
                    Update Password
                </motion.button>
            </form>
        </motion.div>
    );
}

function PasswordField({ label, value, onChange, show, toggleShow }: {
    label: string; value: string; onChange: (v: string) => void; show: boolean; toggleShow: () => void;
}) {
    return (
        <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">{label}</label>
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all pr-10"
                    placeholder={`Enter ${label.toLowerCase()}`}
                />
                <button type="button" onClick={toggleShow} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </div>
    );
}
