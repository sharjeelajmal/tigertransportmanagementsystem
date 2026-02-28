"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Truck, Shield, Zap, CheckCircle2, XCircle } from "lucide-react";
import Loader from "@/components/Loader";

const features = [
    { icon: Truck, title: "Fleet Management", desc: "Real-time tracking & control" },
    { icon: Shield, title: "Secure Platform", desc: "Enterprise-grade security" },
    { icon: Zap, title: "Lightning Fast", desc: "Optimized performance" },
];

interface Toast {
    type: "success" | "error";
    title: string;
    message: string;
}

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [toast, setToast] = useState<Toast | null>(null);

    const showToast = (t: Toast) => {
        setToast(t);
        setTimeout(() => setToast(null), 4000);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (res.ok) {
                showToast({
                    type: "success",
                    title: "Login Successful!",
                    message: `Welcome back, ${username}. Redirecting to dashboard...`,
                });
                setTimeout(() => router.push("/dashboard"), 1500);
            } else {
                showToast({
                    type: "error",
                    title: "Login Failed",
                    message: data.message || "Invalid username or password.",
                });
            }
        } catch {
            showToast({
                type: "error",
                title: "Connection Error",
                message: "Unable to connect. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (<>
        <div className="min-h-screen w-full flex overflow-hidden bg-[#0D0D0D]">
            {/* ─── LEFT PANEL ─── */}
            <motion.div
                initial={{ x: -80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
            >
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom right, var(--primary), var(--primary-dark), #0D0D0D)" }} />
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-[100px]"
                    style={{ background: "var(--primary)" }}
                />
                <motion.div
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white rounded-full blur-[120px]"
                />

                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                            <Truck className="w-6 h-6" style={{ color: "var(--primary)" }} />
                        </div>
                        <span className="text-white font-bold text-xl tracking-wide">TransportMS</span>
                    </motion.div>
                </div>

                <div className="relative z-10 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h1 className="text-5xl font-black text-white leading-tight">
                            Manage Your
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-red-200">
                                Fleet Smarter
                            </span>
                        </h1>
                        <p className="mt-4 text-white/60 text-lg leading-relaxed">
                            The all-in-one platform for modern transport management.
                        </p>
                    </motion.div>

                    <div className="space-y-4">
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                    <f.icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm">{f.title}</p>
                                    <p className="text-white/50 text-xs">{f.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="relative z-10 text-white/30 text-sm"
                >
                    © 2026 TransportMS. All rights reserved.
                </motion.div>
            </motion.div>

            {/* ─── RIGHT PANEL ─── */}
            <motion.div
                initial={{ x: 80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#F0F2F5]"
            >
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-3 mb-8 lg:hidden">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--primary)" }}>
                            <Truck className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[#0D0D0D] font-bold text-xl">TransportMS</span>
                    </div>

                    {/* ─── FORM CARD ─── */}
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
                        className="bg-white rounded-3xl shadow-2xl overflow-hidden"
                        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(var(--primary-rgb, 181,1,4),0.08)" }}
                    >
                        {/* Card top accent bar */}
                        <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, var(--primary), var(--primary-light), var(--primary))" }} />

                        <div className="p-8">
                            {/* Card Header */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="mb-8"
                            >
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                                    style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}>
                                    <Truck className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-black text-[#0D0D0D] tracking-tight">
                                    Sign In
                                </h2>
                                <p className="mt-1 text-gray-400 text-sm">Enter your credentials to continue</p>
                            </motion.div>

                            <form onSubmit={handleLogin} className="space-y-5">
                                {/* Email Field */}
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onFocus={() => setFocusedField("username")}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full px-4 py-3.5 rounded-xl border-2 text-[#0D0D0D] bg-[#F8F9FA] placeholder-gray-300 text-sm font-medium outline-none transition-all duration-200"
                                        style={{
                                            borderColor: focusedField === "username" ? "var(--primary)" : "#EAEAEA",
                                            boxShadow: focusedField === "username" ? "0 0 0 4px rgba(var(--primary-rgb, 181,1,4),0.07)" : "none",
                                        }}
                                        required
                                    />
                                </motion.div>

                                {/* Password Field */}
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.47 }}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Password
                                        </label>
                                        <a href="#" className="text-xs font-semibold transition-colors" style={{ color: "var(--primary)" }}>
                                            Forgot?
                                        </a>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setFocusedField("password")}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full px-4 py-3.5 pr-12 rounded-xl border-2 text-[#0D0D0D] bg-[#F8F9FA] placeholder-gray-300 text-sm font-medium outline-none transition-all duration-200"
                                            style={{
                                                borderColor: focusedField === "password" ? "var(--primary)" : "#EAEAEA",
                                                boxShadow: focusedField === "password" ? "0 0 0 4px rgba(var(--primary-rgb, 181,1,4),0.07)" : "none",
                                            }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 transition-colors cursor-pointer"
                                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = '#D1D5DB')}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </motion.div>

                                {/* Submit Button */}
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.54 }}
                                    className="pt-2"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className="relative w-full py-3.5 rounded-xl font-bold text-white text-sm overflow-hidden group"
                                        style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)", boxShadow: "0 6px 20px rgba(var(--primary-rgb, 181,1,4),0.35)" }}
                                    >
                                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                        <AnimatePresence mode="wait">
                                            {isLoading ? (
                                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                    className="flex items-center justify-center gap-3">
                                                    <Loader size="sm" className="border-white" />
                                                    <span>Signing in...</span>
                                                </motion.div>
                                            ) : (
                                                <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                    className="flex items-center justify-center gap-2">
                                                    Sign In
                                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                </motion.div>
                            </form>

                            {/* Footer */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.65 }}
                                className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center gap-2"
                            >
                                <span className="text-xs text-gray-400">© 2025 Aura Business Solution | All rights reserved</span>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>

        {/* ── Toast Notification ── */}
        <AnimatePresence>
            {toast && (
                <motion.div
                    key="toast"
                    initial={{ opacity: 0, y: -20, x: 20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: -20, x: 20 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="fixed top-5 right-5 z-[9999] flex items-start gap-3 p-4 rounded-2xl shadow-2xl max-w-sm"
                    style={{
                        background: toast.type === "success" ? "#FFFFFF" : "#FFFFFF",
                        boxShadow: toast.type === "success"
                            ? "0 8px 32px rgba(5,150,105,0.2), 0 2px 8px rgba(0,0,0,0.08)"
                            : `0 8px 32px rgba(var(--primary-rgb, 181,1,4),0.2), 0 2px 8px rgba(0,0,0,0.08)`,
                        border: toast.type === "success" ? "1.5px solid rgba(5,150,105,0.2)" : `1.5px solid rgba(var(--primary-rgb, 181,1,4),0.2)`,
                    }}
                >
                    {/* Icon */}
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                            background: toast.type === "success" ? "rgba(5,150,105,0.1)" : "rgba(var(--primary-rgb, 181,1,4),0.08)",
                        }}
                    >
                        {toast.type === "success" ? (
                            <CheckCircle2 size={18} className="text-emerald-600" />
                        ) : (
                            <XCircle size={18} style={{ color: "var(--primary)" }} />
                        )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900">{toast.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{toast.message}</p>
                    </div>

                    {/* Progress bar */}
                    <motion.div
                        className="absolute bottom-0 left-0 h-0.5 rounded-b-2xl"
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 4, ease: "linear" }}
                        style={{
                            background: toast.type === "success" ? "#059669" : "var(--primary)",
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    </>);
}
