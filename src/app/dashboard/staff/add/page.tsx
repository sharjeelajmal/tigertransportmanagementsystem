"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    User,
    Phone,
    MapPin,
    Briefcase,
    DollarSign,
    Upload,
    ArrowLeft,
    Save,
    X,
} from "lucide-react";
import CustomDropdown from "@/components/CustomDropdown";

const designationOptions = [
    { value: "Operation Manager", label: "Operation Manager" },
    { value: "Transport Manager", label: "Transport Manager" },
    { value: "Warehouse Supervisor", label: "Warehouse Supervisor" },
    { value: "Labor", label: "Labor" },
    { value: "Driver", label: "Driver" },
    { value: "Admin", label: "Admin" },
];

const statusOptions = [
    { value: "On Duty", label: "On Duty" },
    { value: "Off Duty", label: "Off Duty" },
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
    firstName: string;
    lastName: string;
    cnic: string;
    guarantorName: string;
    guarantorContact: string;
    mobile: string;
    emergencyContact: string;
    address: string;
    designation: string;
    status: string;
    basicSalary: string;
    photo: string;
}

export default function AddStaffPage() {
    const router = useRouter();
    const fileRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [form, setForm] = useState<FormData>({
        firstName: "",
        lastName: "",
        cnic: "",
        guarantorName: "",
        guarantorContact: "",
        mobile: "",
        emergencyContact: "",
        address: "",
        designation: "",
        status: "On Duty",
        basicSalary: "",
        photo: "",
    });

    const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const result = ev.target?.result as string;
            setPhotoPreview(result);
            setForm((prev) => ({ ...prev, photo: result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.designation) return alert("Please select a designation.");
        if (!form.status) return alert("Please select a status.");
        setIsLoading(true);
        try {
            const res = await fetch("/api/staff", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    basicSalary: Number(form.basicSalary),
                }),
            });
            const data = await res.json();
            if (data.success) {
                router.push("/dashboard/staff");
            } else {
                alert(data.error || "Failed to save staff.");
            }
        } catch {
            alert("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass =
        "w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium text-gray-800 placeholder-gray-300 outline-none transition-all duration-200 focus:border-[#B50104] focus:shadow-[0_0_0_4px_rgba(181,1,4,0.07)]";

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
                    className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#B50104] hover:text-[#B50104] transition-all"
                >
                    <ArrowLeft size={18} />
                </motion.button>
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Hiring Form</h1>
                    <p className="text-gray-400 text-sm mt-0.5">Fill in the details to add a new staff member</p>
                </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* ── Personal Information ── */}
                <motion.div
                    custom={0}
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                    style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}
                >
                    {/* Section Header */}
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "rgba(181,1,4,0.08)" }}>
                            <User size={16} style={{ color: "#B50104" }} />
                        </div>
                        <h2 className="font-bold text-gray-800">Personal Information</h2>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* First Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                First Name <span className="text-[#B50104]">*</span>
                            </label>
                            <input className={inputClass} placeholder="Muhammad" value={form.firstName} onChange={set("firstName")} required />
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Last Name <span className="text-[#B50104]">*</span>
                            </label>
                            <input className={inputClass} placeholder="Ali" value={form.lastName} onChange={set("lastName")} required />
                        </div>

                        {/* Photo Upload */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Upload Photo
                            </label>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => fileRef.current?.click()}
                                className="w-full h-[46px] rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-sm font-medium text-gray-400 hover:border-[#B50104] hover:text-[#B50104] transition-all overflow-hidden relative"
                            >
                                {photoPreview ? (
                                    <>
                                        <img src={photoPreview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">Change Photo</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={15} />
                                        Upload Photo
                                    </>
                                )}
                            </motion.button>
                        </div>

                        {/* CNIC */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                CNIC No. <span className="text-[#B50104]">*</span>
                            </label>
                            <input className={inputClass} placeholder="00000-0000000-0" value={form.cnic} onChange={set("cnic")} required />
                        </div>

                        {/* Guarantor Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Guarantor Name
                            </label>
                            <input className={inputClass} placeholder="Guarantor Name" value={form.guarantorName} onChange={set("guarantorName")} />
                        </div>

                        {/* Guarantor Contact */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Guarantor Contact No.
                            </label>
                            <input className={inputClass} placeholder="03001234567" value={form.guarantorContact} onChange={set("guarantorContact")} />
                        </div>
                    </div>
                </motion.div>

                {/* ── Contact Information ── */}
                <motion.div
                    custom={1}
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                    style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}
                >
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "rgba(181,1,4,0.08)" }}>
                            <Phone size={16} style={{ color: "#B50104" }} />
                        </div>
                        <h2 className="font-bold text-gray-800">Contact Information</h2>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Mobile No. <span className="text-[#B50104]">*</span>
                            </label>
                            <input className={inputClass} placeholder="03001234567" value={form.mobile} onChange={set("mobile")} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Emergency Contact No.
                            </label>
                            <input className={inputClass} placeholder="03001234567" value={form.emergencyContact} onChange={set("emergencyContact")} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Current Address
                            </label>
                            <input className={inputClass} placeholder="Street, City, Province" value={form.address} onChange={set("address")} />
                        </div>
                    </div>
                </motion.div>

                {/* ── Enrollment ── */}
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
                            style={{ background: "rgba(181,1,4,0.08)" }}>
                            <Briefcase size={16} style={{ color: "#B50104" }} />
                        </div>
                        <h2 className="font-bold text-gray-800">Enrollment</h2>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CustomDropdown
                            label="Designation"
                            required
                            options={designationOptions}
                            value={form.designation}
                            onChange={(val) => setForm((prev) => ({ ...prev, designation: val }))}
                            placeholder="Select designation..."
                        />
                        <CustomDropdown
                            label="Initial Status"
                            required
                            options={statusOptions}
                            value={form.status}
                            onChange={(val) => setForm((prev) => ({ ...prev, status: val }))}
                            placeholder="Select status..."
                        />
                    </div>
                </motion.div>

                {/* ── Payroll Structure ── */}
                <motion.div
                    custom={3}
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                    style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}
                >
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "rgba(181,1,4,0.08)" }}>
                            <DollarSign size={16} style={{ color: "#B50104" }} />
                        </div>
                        <h2 className="font-bold text-gray-800">Payroll Structure</h2>
                    </div>

                    <div className="p-6">
                        <div className="max-w-xs">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Basic Salary <span className="text-[#B50104]">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    className={inputClass + " pr-16"}
                                    placeholder="0"
                                    value={form.basicSalary}
                                    onChange={set("basicSalary")}
                                    required
                                    min={0}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">PKR</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── Action Buttons ── */}
                <motion.div
                    custom={4}
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
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-500 hover:border-gray-300 transition-all"
                    >
                        <X size={15} />
                        Cancel
                    </motion.button>
                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(181,1,4,0.35)" }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ background: "linear-gradient(135deg, #B50104, #8B0003)" }}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={15} />
                                Save Staff
                            </>
                        )}
                    </motion.button>
                </motion.div>
            </form>
        </div>
    );
}
