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
} from "lucide-react";
import CustomDropdown from "@/components/CustomDropdown";

const categoryOptions = [
    { value: "Vehicle Outsider", label: "Vehicle Outsider" },
    { value: "Labor Outsider", label: "Labor Outsider" },
    { value: "Both", label: "Both" },
];

const sectionVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.4 },
    }),
};

interface FormData {
    outsiderName: string;
    category: string;
    contactNo: string;
    contactPersonName: string;
    mobileNo: string;
    emergencyContactNo: string;
    address: string;
}

export default function AddOutsiderPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState<FormData>({
        outsiderName: "",
        category: "",
        contactNo: "",
        contactPersonName: "",
        mobileNo: "",
        emergencyContactNo: "",
        address: "",
    });

    const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.category) return alert("Please select a category.");
        setIsLoading(true);
        try {
            const res = await fetch("/api/outsiders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                router.push("/dashboard/outsiders");
            } else {
                alert(data.error || "Failed to save outsider.");
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
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Add New Outsider</h1>
                    <p className="text-gray-400 text-sm mt-0.5">Fill in the details to register a new outsider</p>
                </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
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

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Outsider Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Outsider Name <span className="text-[var(--primary)]">*</span>
                            </label>
                            <input className={inputClass} placeholder="Enter name" value={form.outsiderName} onChange={set("outsiderName")} required />
                        </div>

                        {/* Category */}
                        <CustomDropdown
                            label="Category"
                            required
                            options={categoryOptions}
                            value={form.category}
                            onChange={(val) => setForm((prev) => ({ ...prev, category: val }))}
                            placeholder="Select category..."
                        />

                        {/* Contact No */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Contact No. <span className="text-[var(--primary)]">*</span>
                            </label>
                            <input className={inputClass} placeholder="03001234567" value={form.contactNo} onChange={set("contactNo")} required />
                        </div>
                    </div>
                </motion.div>

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
                            <Phone size={16} style={{ color: "var(--primary)" }} />
                        </div>
                        <h2 className="font-bold text-gray-800">Contact Details</h2>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Contact Person Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Contact Person Name
                            </label>
                            <input className={inputClass} placeholder="Contact person" value={form.contactPersonName} onChange={set("contactPersonName")} />
                        </div>

                        {/* Mobile No */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Mobile No.
                            </label>
                            <input className={inputClass} placeholder="03001234567" value={form.mobileNo} onChange={set("mobileNo")} />
                        </div>

                        {/* Emergency Contact No */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Emergency Contact No.
                            </label>
                            <input className={inputClass} placeholder="03001234567" value={form.emergencyContactNo} onChange={set("emergencyContactNo")} />
                        </div>

                        {/* Address */}
                        <div className="md:col-span-3">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Address
                            </label>
                            <input className={inputClass} placeholder="Street, City, Province" value={form.address} onChange={set("address")} />
                        </div>
                    </div>
                </motion.div>

                {/* ── Action Buttons ── */}
                <motion.div
                    custom={2}
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
                                Add
                            </>
                        )}
                    </motion.button>
                </motion.div>
            </form>
        </div>
    );
}
