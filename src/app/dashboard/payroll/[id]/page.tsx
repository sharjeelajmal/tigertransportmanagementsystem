"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft } from "lucide-react";
import Loader from "@/components/Loader";
import Image from "next/image";

interface StaffDetails {
    _id: string;
    firstName: string;
    lastName: string;
    designation: string;
    photo?: string;
    basicSalary?: number;
}

export default function CreatePayrollPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [staff, setStaff] = useState<StaffDetails | null>(null);

    // Form states
    const [month, setMonth] = useState("");
    const [basicSalary, setBasicSalary] = useState(0);
    const [overtimeHours, setOvertimeHours] = useState(0);
    const [overtimeRate, setOvertimeRate] = useState(0); // per hour
    const [allowance, setAllowance] = useState(0);
    const [bonus, setBonus] = useState(0);
    const [otherEarnings, setOtherEarnings] = useState(0);

    const [absentDays, setAbsentDays] = useState(0);
    const [absentFinePerDay, setAbsentFinePerDay] = useState(0);
    const [advanceDeduction, setAdvanceDeduction] = useState(0); // Auto-filled from DB later
    const [fine, setFine] = useState(0);
    const [otherDeductions, setOtherDeductions] = useState(0);

    // Advance references (we can store IDs of pending advances to mark as deducted on success)
    const [advanceIds, setAdvanceIds] = useState<string[]>([]);

    useEffect(() => {
        // Init current month YYYY-MM
        const today = new Date();
        setMonth(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);

        fetchStaffData();
    }, [id]);

    const fetchStaffData = async () => {
        setIsLoading(true);
        try {
            // First fetch staff profile to get basic details
            const res = await fetch(`/api/staff/${id}`);
            const data = await res.json();
            if (data.success) {
                setStaff(data.data);
                setBasicSalary(data.data.basicSalary || 0);

                // Here we could also fetch existing advances to populate advanceDeduction auto-fill
            }
        } catch (error) {
            console.error("Error fetching staff payroll details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Construct the payload matching our Mongoose Model
            const payload = {
                staffId: id,
                month,
                basicSalary,
                allowance,
                bonus,
                overtimeHours,
                overtimeRate,
                otherEarnings,
                absentDays,
                absentFinePerDay,
                advanceDeduction,
                advanceIds,
                fine,
                otherDeductions,
                totalEarnings,
                totalDeductions,
                netSalary: totalEarnings - totalDeductions,
                paymentDate: new Date().toISOString(),
                status: "Paid"
            };

            const res = await fetch('/api/payroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                // Navigate back or to receipt
                router.push('/dashboard/payroll');
            } else {
                alert("Failed to save payroll record.");
            }
        } catch (error) {
            console.error(error);
            alert("Error processing payroll.");
        } finally {
            setIsSaving(false);
        }
    };

    // Derived logic
    const calcOvertimeEarning = overtimeHours * overtimeRate;
    const calcAbsentPenalty = absentDays * absentFinePerDay;
    const totalEarnings = basicSalary + calcOvertimeEarning + allowance + bonus + otherEarnings;
    const totalDeductions = calcAbsentPenalty + advanceDeduction + fine + otherDeductions;
    const finalAmount = totalEarnings - totalDeductions;

    if (isLoading || !staff) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            {/* Top Back Nav (optional, but good for UX) */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-500 hover:text-[#B50104] transition-colors"
                type="button"
            >
                <ChevronLeft size={20} />
                <span className="font-medium text-sm">Back to Payroll List</span>
            </button>

            {/* Profile Header mapped to image design */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-8 text-white relative overflow-hidden flex items-center justify-between shadow-lg"
                style={{
                    background: "linear-gradient(135deg, #9C171A 0%, #7A0A0C 100%)",
                }}
            >
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mb-10 -mr-10"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black uppercase tracking-wider mb-2">
                        {staff.firstName} {staff.lastName}
                    </h1>
                    <p className="text-white/80 font-medium tracking-wide">
                        {staff.designation}
                    </p>
                </div>
                <div className="relative z-10 flex-shrink-0">
                    <div className="w-24 h-24 rounded-xl border-4 border-white overflow-hidden shadow-2xl relative bg-white flex items-center justify-center">
                        {staff.photo ? (
                            <Image
                                src={staff.photo}
                                alt="Profile"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <span className="text-[#B50104] font-black text-3xl">
                                {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Form Section */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8"
            >
                {/* Month Selector */}
                <div className="flex items-center gap-3 pb-6 border-b border-gray-100 mb-8">
                    <h2 className="text-2xl font-black text-gray-800">Select Month</h2>
                    <div className="relative">
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 outline-none focus:border-[#B50104] transition-colors"
                        />
                        <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                <div className="space-y-10">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-1">
                            <h3 className="text-sm font-bold text-gray-900">Basic Information</h3>
                        </div>
                        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500">Basic Fixed Salary</label>
                                <input
                                    type="number"
                                    value={basicSalary || ''}
                                    onChange={(e) => setBasicSalary(Number(e.target.value))}
                                    placeholder="[Auto Filled]"
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-semibold text-gray-600 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500">Absent Days</label>
                                    <input
                                        type="number"
                                        value={absentDays || ''}
                                        onChange={(e) => setAbsentDays(Number(e.target.value))}
                                        placeholder="[Auto Filled]"
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-semibold text-gray-600 outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5 relative">
                                    <label className="text-xs font-bold text-gray-500">Absent Fine</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={absentFinePerDay || ''}
                                            onChange={(e) => setAbsentFinePerDay(Number(e.target.value))}
                                            placeholder="Auto"
                                            className="w-full pl-4 pr-16 py-3 bg-white border-2 border-gray-200 focus:border-[#B50104] rounded-xl text-sm font-bold outline-none"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                                            Per Day
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-bold text-gray-500">Overtime Rate</label>
                                <div className="relative flex items-center">
                                    <input
                                        type="range"
                                        min="0"
                                        max="5000"
                                        step="100"
                                        value={overtimeRate}
                                        onChange={(e) => setOvertimeRate(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#B50104]"
                                    />
                                    <span className="ml-4 text-xs font-bold text-gray-500 min-w-[50px]">{overtimeRate}</span>
                                    <span className="ml-1 text-[10px] font-bold text-gray-400">Per Hour</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Earnings */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-1">
                            <h3 className="text-sm font-bold text-gray-900">Earnings</h3>
                        </div>
                        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-bold text-gray-500">Basic Salary</label>
                                <input
                                    type="number"
                                    readOnly
                                    value={basicSalary || ''}
                                    placeholder="[Auto Filled]"
                                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-semibold text-gray-500 outline-none"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">PKR</span>
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-bold text-gray-500">Overtime (Hours)</label>
                                <input
                                    type="number"
                                    value={overtimeHours || ''}
                                    onChange={(e) => setOvertimeHours(Number(e.target.value))}
                                    className="w-full pl-4 pr-16 py-3 bg-white border-2 border-gray-200 focus:border-[#B50104] rounded-xl text-sm font-bold outline-none"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">Hours</span>
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-bold text-gray-500">Bonus</label>
                                <input
                                    type="number"
                                    value={bonus || ''}
                                    onChange={(e) => setBonus(Number(e.target.value))}
                                    className="w-full pl-4 pr-12 py-3 bg-white border-2 border-gray-200 focus:border-[#B50104] rounded-xl text-sm font-bold outline-none"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">PKR</span>
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-bold text-gray-500">Allowance</label>
                                <input
                                    type="number"
                                    value={allowance || ''}
                                    onChange={(e) => setAllowance(Number(e.target.value))}
                                    className="w-full pl-4 pr-12 py-3 bg-white border-2 border-gray-200 focus:border-[#B50104] rounded-xl text-sm font-bold outline-none"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">PKR</span>
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-bold text-gray-500">Others</label>
                                <input
                                    type="number"
                                    value={otherEarnings || ''}
                                    onChange={(e) => setOtherEarnings(Number(e.target.value))}
                                    className="w-full pl-4 pr-12 py-3 bg-white border-2 border-gray-200 focus:border-[#B50104] rounded-xl text-sm font-bold outline-none"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">PKR</span>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Deductions */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-1">
                            <h3 className="text-sm font-bold text-gray-900">Deductions</h3>
                        </div>
                        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-bold text-gray-500">Absent Days (Penalty)</label>
                                <input
                                    type="number"
                                    readOnly
                                    value={calcAbsentPenalty || ''}
                                    placeholder="[Auto Filled]"
                                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-semibold text-gray-500 outline-none"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">PKR</span>
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-bold text-gray-500">Advance</label>
                                <input
                                    type="number"
                                    readOnly
                                    value={advanceDeduction || ''}
                                    placeholder="[Auto Filled]"
                                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-semibold text-gray-500 outline-none"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">PKR</span>
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-bold text-gray-500">Fine</label>
                                <input
                                    type="number"
                                    value={fine || ''}
                                    onChange={(e) => setFine(Number(e.target.value))}
                                    className="w-full pl-4 pr-12 py-3 bg-white border-2 border-gray-200 focus:border-[#B50104] rounded-xl text-sm font-bold outline-none"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">PKR</span>
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-bold text-gray-500">Others</label>
                                <input
                                    type="number"
                                    value={otherDeductions || ''}
                                    onChange={(e) => setOtherDeductions(Number(e.target.value))}
                                    className="w-full pl-4 pr-12 py-3 bg-white border-2 border-gray-200 focus:border-[#B50104] rounded-xl text-sm font-bold outline-none"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">PKR</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Summary / Submit */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 px-8 py-6"
            >
                <h3 className="text-lg font-black text-gray-800 mb-6">Payroll</h3>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-6 border-b border-gray-100 border-dashed">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="flex flex-row items-center gap-2">
                            <p className="text-xs font-bold text-gray-500 mb-1">Total Earning</p>
                            <p className="text-lg font-black text-gray-400">{totalEarnings.toLocaleString()}/-</p>
                        </div>
                        <div className="flex flex-row items-center gap-2">
                            <p className="text-xs font-bold text-gray-500 mb-1">Total Deductions</p>
                            <p className="text-lg font-black text-gray-400">{totalDeductions.toLocaleString()}/-</p>
                        </div>
                    </div>
                    <div className="text-right w-full md:w-auto flex items-center justify-between md:justify-end gap-6">
                        <p className="text-xs font-bold text-gray-500">Net Salary</p>
                        <p className="text-3xl font-black text-[#B50104]">{finalAmount.toLocaleString()}/-</p>
                    </div>
                </div>

                <div className="pt-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-[#B50104] hover:bg-[#8B0003] text-white px-10 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Pay & Print"
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
