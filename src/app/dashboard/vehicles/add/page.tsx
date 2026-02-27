"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Truck, User, FileText, X } from "lucide-react";
import CustomDropdown from "@/components/CustomDropdown"; // Reuse existing
import CustomDatePicker from "@/components/CustomDatePicker"; // Reuse existing

const sectionVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.4 },
    }),
};

interface FormData {
    vehicleName: string;
    plateNumber: string;
    engineNumber: string;
    chassisNumber: string;
    modelYear: string;
    ownerName: string;
    routePermitExpiry: string;
    tokenTaxExpiry: string;
    insuranceExpiry: string;
    fitnessExpiry: string;
    trackerExpiry: string;
}

export default function AddVehiclePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState<FormData>({
        vehicleName: "",
        plateNumber: "",
        engineNumber: "",
        chassisNumber: "",
        modelYear: "",
        ownerName: "",
        routePermitExpiry: "",
        tokenTaxExpiry: "",
        insuranceExpiry: "",
        fitnessExpiry: "",
        trackerExpiry: "",
    });

    const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const setDate = (field: keyof FormData) => (date: Date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        setForm((prev) => ({ ...prev, [field]: `${yyyy}-${mm}-${dd}` }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch("/api/vehicles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    modelYear: Number(form.modelYear),
                }),
            });
            const data = await res.json();
            if (data.success) {
                router.push("/dashboard/vehicles");
            } else {
                alert(data.error || "Failed to save vehicle.");
            }
        } catch {
            alert("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass =
        "w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium text-gray-800 placeholder-gray-300 outline-none transition-all duration-200 focus:border-[var(--primary)] focus:shadow-[0_0_0_4px_rgba(var(--primary-rgb, 181,1,4),0.07)]";

    return (
        <div className="max-w-5xl mx-auto space-y-6">
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
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Vehicle Adding Form</h1>
                    <p className="text-gray-400 text-sm mt-0.5">Enter vehicle details to add to fleet</p>
                </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* ── Basic Vehicle Information ── */}
                <motion.div
                    custom={0}
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-2xl border border-gray-100"
                    style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}
                >
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "rgba(var(--primary-rgb, 181,1,4),0.08)" }}>
                            <Truck size={16} style={{ color: "var(--primary)" }} />
                        </div>
                        <h2 className="font-bold text-gray-800">Basic Vehicle Information</h2>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Vehicle Name <span className="text-[var(--primary)]">*</span>
                            </label>
                            <input className={inputClass} placeholder="e.g. Toyota Hilux" value={form.vehicleName} onChange={set("vehicleName")} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Vehicle Plate Number <span className="text-[var(--primary)]">*</span>
                            </label>
                            <input className={inputClass} placeholder="ABC-123" value={form.plateNumber} onChange={set("plateNumber")} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Engine Number
                            </label>
                            <input className={inputClass} placeholder="Engine No." value={form.engineNumber} onChange={set("engineNumber")} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Chassis Number
                            </label>
                            <input className={inputClass} placeholder="Chassis No." value={form.chassisNumber} onChange={set("chassisNumber")} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Model Year <span className="text-[var(--primary)]">*</span>
                            </label>
                            <input type="number" className={inputClass} placeholder="2024" value={form.modelYear} onChange={set("modelYear")} required />
                        </div>
                    </div>
                </motion.div>

                {/* ── Ownership & Assignment ── */}
                <motion.div
                    custom={1}
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-2xl border border-gray-100"
                    style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}
                >
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "rgba(var(--primary-rgb, 181,1,4),0.08)" }}>
                            <User size={16} style={{ color: "var(--primary)" }} />
                        </div>
                        <h2 className="font-bold text-gray-800">Ownership & Assignment</h2>
                    </div>

                    <div className="p-6">
                        <div className="max-w-md">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Owner Name
                            </label>
                            <input className={inputClass} placeholder="Owner Name" value={form.ownerName} onChange={set("ownerName")} />
                        </div>
                    </div>
                </motion.div>

                {/* ── Document Expiry ── */}
                <motion.div
                    custom={2}
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-2xl border border-gray-100"
                    style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}
                >
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "rgba(var(--primary-rgb, 181,1,4),0.08)" }}>
                            <FileText size={16} style={{ color: "var(--primary)" }} />
                        </div>
                        <h2 className="font-bold text-gray-800">Document Expiry</h2>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Dates using CustomDatePicker */}
                        <div>
                            <CustomDatePicker
                                label="Route Permit Expiry Date"
                                value={form.routePermitExpiry}
                                onChange={setDate("routePermitExpiry")}
                            />
                        </div>
                        <div>
                            <CustomDatePicker
                                label="Token Tax Expiry Date"
                                value={form.tokenTaxExpiry}
                                onChange={setDate("tokenTaxExpiry")}
                            />
                        </div>
                        <div>
                            <CustomDatePicker
                                label="Insurance Expiry Date"
                                value={form.insuranceExpiry}
                                onChange={setDate("insuranceExpiry")}
                            />
                        </div>
                        <div>
                            <CustomDatePicker
                                label="Fitness Expiry Date"
                                value={form.fitnessExpiry}
                                onChange={setDate("fitnessExpiry")}
                            />
                        </div>
                        <div>
                            <CustomDatePicker
                                label="Tracker Expiry Date"
                                value={form.trackerExpiry}
                                onChange={setDate("trackerExpiry")}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* ── Footer ── */}
                <motion.div
                    custom={3}
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center justify-end gap-3 pb-8"
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
                        className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                Next
                            </>
                        )}
                    </motion.button>
                </motion.div>
            </form>
        </div>
    );
}
