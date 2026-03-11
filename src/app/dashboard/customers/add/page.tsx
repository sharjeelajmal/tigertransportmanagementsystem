"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    UserCircle2,
    Phone,
    ArrowLeft,
    Save,
    X,
    Mail,
    MapPin,
    Users,
    MessageSquare,
} from "lucide-react";

const sectionVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.4 },
    }),
};

interface FormData {
    customerName: string;
    mobileNo: string;
    emergencyNo: string;
    address: string;
    email: string;
    refPerson: string;
    remarks: string;
}

export default function AddCustomerPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState<FormData>({
        customerName: "",
        mobileNo: "",
        emergencyNo: "",
        address: "",
        email: "",
        refPerson: "",
        remarks: "",
    });

    const set = (field: keyof FormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.customerName) return alert("Please enter Customer Name.");
        setIsLoading(true);
        try {
            const res = await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                router.push("/dashboard/customers");
            } else {
                alert(data.error || "Failed to save customer.");
            }
        } catch {
            alert("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass =
        "w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium text-gray-800 placeholder-gray-300 outline-none transition-all duration-200 focus:border-[var(--primary)] focus:shadow-[0_0_0_4px_rgba(var(--primary-rgb,181,1,4),0.07)]";

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all cursor-pointer"
                >
                    <ArrowLeft size={18} />
                </motion.button>
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Add New Customer</h1>
                    <p className="text-gray-400 text-sm mt-0.5">Register a new customer for the system</p>
                </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Basic Info */}
                <motion.div
                    custom={0}
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-2xl border border-gray-100 relative z-20"
                    style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}
                >
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "rgba(var(--primary-rgb, 181,1,4),0.08)" }}>
                            <UserCircle2 size={16} style={{ color: "var(--primary)" }} />
                        </div>
                        <h2 className="font-bold text-gray-800">Basic Information</h2>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Customer Name <span className="text-[var(--primary)]">*</span>
                            </label>
                            <input className={inputClass} placeholder="Enter full name" value={form.customerName} onChange={set("customerName")} required />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Mobile No.
                            </label>
                            <input className={inputClass} placeholder="03001234567" value={form.mobileNo} onChange={set("mobileNo")} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Emergency No.
                            </label>
                            <input className={inputClass} placeholder="03001234567" value={form.emergencyNo} onChange={set("emergencyNo")} />
                        </div>
                    </div>
                </motion.div>

                {/* Additional Details */}
                <motion.div
                    custom={1}
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-2xl border border-gray-100 relative z-10"
                    style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}
                >
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "rgba(var(--primary-rgb, 181,1,4),0.08)" }}>
                            <MapPin size={16} style={{ color: "var(--primary)" }} />
                        </div>
                        <h2 className="font-bold text-gray-800">Address & Contact</h2>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input className={`${inputClass} pl-11`} placeholder="example@email.com" value={form.email} onChange={set("email")} type="email" />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Address
                            </label>
                            <input className={inputClass} placeholder="Full address" value={form.address} onChange={set("address")} />
                        </div>
                    </div>
                </motion.div>

                {/* Reference & Remarks */}
                <motion.div
                    custom={2}
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-2xl border border-gray-100 relative z-0"
                    style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}
                >
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "rgba(var(--primary-rgb, 181,1,4),0.08)" }}>
                            <Users size={16} style={{ color: "var(--primary)" }} />
                        </div>
                        <h2 className="font-bold text-gray-800">Reference & Remarks</h2>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Reference Person
                            </label>
                            <input className={inputClass} placeholder="Referenced by" value={form.refPerson} onChange={set("refPerson")} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Remarks
                            </label>
                            <div className="relative">
                                <MessageSquare className="absolute left-4 top-4 text-gray-400" size={16} />
                                <textarea 
                                    className={`${inputClass} pl-11 min-h-[100px] py-3`} 
                                    placeholder="Any additional notes..." 
                                    value={form.remarks} 
                                    onChange={set("remarks")}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    custom={3}
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center justify-end gap-3 pb-4"
                >
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-500 hover:border-gray-300 transition-all cursor-pointer"
                    >
                        <X size={15} />
                        Cancel
                    </motion.button>
                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(var(--primary-rgb, 181,1,4),0.35)" }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={15} />
                                Save Customer
                            </>
                        )}
                    </motion.button>
                </motion.div>
            </form>
        </div>
    );
}
