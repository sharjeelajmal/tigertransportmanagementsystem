"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft } from "lucide-react";
import Image from "next/image";
import PayrollSlipPreview, { handleSlipPrint } from "@/components/payroll/PayrollSlipPreview";

interface StaffDetails {
    _id: string;
    firstName: string;
    lastName: string;
    designation: string;
    photo?: string;
    basicSalary?: number;
}

interface PayrollFormProps {
    staff: StaffDetails;
    staffId: string;
    initialAdvanceDeduction: number;
    advanceIds: string[];
    initialMonth: string;
}

export default function PayrollForm({
    staff,
    staffId,
    initialAdvanceDeduction,
    advanceIds,
    initialMonth
}: PayrollFormProps) {
    const router = useRouter();

    const [isSaving, setIsSaving] = useState(false);
    const [showSlip, setShowSlip] = useState(false);

    // Form states
    const [month, setMonth] = useState(initialMonth);
    const [basicSalary, setBasicSalary] = useState(staff?.basicSalary || 0);
    const [overtimeHours, setOvertimeHours] = useState(0);
    const [overtimeRate, setOvertimeRate] = useState(0);
    const [allowance, setAllowance] = useState(0);
    const [bonus, setBonus] = useState(0);
    const [otherEarnings, setOtherEarnings] = useState(0);

    const [absentDays, setAbsentDays] = useState(0);
    const [absentFinePerDay, setAbsentFinePerDay] = useState(0);
    const advanceDeduction = initialAdvanceDeduction;
    const [fine, setFine] = useState(0);
    const [otherDeductions, setOtherDeductions] = useState(0);

    // Auto-calculate absent days from attendance records
    useEffect(() => {
        const fetchAbsents = async () => {
            try {
                const res = await fetch(`/api/attendance/monthly?staffId=${staffId}&month=${month}`);
                const data = await res.json();
                if (data.success) {
                    setAbsentDays(data.data.absent || 0);
                }
            } catch (error) {
                console.error('Error fetching monthly attendance:', error);
            }
        };
        if (staffId && month) fetchAbsents();
    }, [staffId, month]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                staffId,
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
                setShowSlip(true);
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

    const formatMonth = (m: string) => {
        if (!m) return "";
        const [y, mo] = m.split("-");
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${months[parseInt(mo) - 1]} ${y}`;
    };

    const handlePrint = () => {
        handleSlipPrint({
            staffFirstName: staff.firstName,
            staffLastName: staff.lastName,
            staffDesignation: staff.designation,
            staffId,
            month,
            basicSalary,
            calcOvertimeEarning,
            bonus,
            allowance,
            otherEarnings,
            calcAbsentPenalty,
            advanceDeduction,
            fine,
            otherDeductions,
            totalEarnings,
            totalDeductions,
        });
    };

    if (showSlip && staff) {
        const slipData = {
            staffFirstName: staff.firstName,
            staffLastName: staff.lastName,
            staffDesignation: staff.designation,
            staffId,
            month,
            basicSalary,
            calcOvertimeEarning,
            bonus,
            allowance,
            otherEarnings,
            calcAbsentPenalty,
            advanceDeduction,
            fine,
            otherDeductions,
            totalEarnings,
            totalDeductions,
        };
        return (
            <div className="max-w-7xl mx-auto pb-12">
                <PayrollSlipPreview
                    data={slipData}
                    onPrint={handlePrint}
                    onBack={() => router.push('/dashboard/payroll')}
                />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-500 hover:text-[var(--primary)] transition-colors cursor-pointer"
                type="button"
            >
                <ChevronLeft size={20} />
                <span className="font-medium text-sm">Back to Payroll List</span>
            </button>

            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-8 text-white relative overflow-hidden flex items-center justify-between shadow-lg"
                style={{ background: "linear-gradient(135deg, #9C171A 0%, #7A0A0C 100%)" }}
            >
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mb-10 -mr-10" />
                <div className="relative z-10">
                    <h1 className="text-4xl font-black uppercase tracking-wider mb-2">
                        {staff.firstName} {staff.lastName}
                    </h1>
                    <p className="text-white/80 font-medium tracking-wide">{staff.designation}</p>
                </div>
                <div className="relative z-10 flex-shrink-0">
                    <div className="w-24 h-24 rounded-xl border-4 border-white overflow-hidden shadow-2xl relative bg-white flex items-center justify-center">
                        {staff.photo ? (
                            <Image src={staff.photo} alt="Profile" fill className="object-cover" />
                        ) : (
                            <span className="text-[var(--primary)] font-black text-3xl">
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
                            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 outline-none focus:border-[var(--primary)] transition-colors cursor-pointer"
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
                            <InputField label="Basic Fixed Salary" value={basicSalary} onChange={setBasicSalary} readOnly bgGray />
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Absent Days" value={absentDays} onChange={setAbsentDays} bgGray />
                                <InputField label="Absent Fine" value={absentFinePerDay} onChange={setAbsentFinePerDay} suffix="Per Day" />
                            </div>
                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-bold text-gray-500">Overtime Rate</label>
                                <div className="relative flex items-center gap-3">
                                    <input
                                        type="range" min="0" max="5000" step="1"
                                        value={overtimeRate}
                                        onChange={(e) => setOvertimeRate(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                                    />
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <input
                                            type="number"
                                            value={overtimeRate || ''}
                                            onChange={(e) => setOvertimeRate(Number(e.target.value))}
                                            placeholder="0"
                                            className="w-16 px-2 py-1 border border-gray-200 rounded-md text-xs font-bold text-gray-700 outline-none focus:border-[var(--primary)] text-center appearance-none"
                                        />
                                        <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">/ Hr</span>
                                    </div>
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
                            <InputField label="Basic Salary" value={basicSalary} readOnly bgGray suffix="PKR" />
                            <InputField label="Overtime (Hours)" value={overtimeHours} onChange={setOvertimeHours} suffix="Hours" />
                            <InputField label="Bonus" value={bonus} onChange={setBonus} suffix="PKR" />
                            <InputField label="Allowance" value={allowance} onChange={setAllowance} suffix="PKR" />
                            <InputField label="Others" value={otherEarnings} onChange={setOtherEarnings} suffix="PKR" />
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Deductions */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-1">
                            <h3 className="text-sm font-bold text-gray-900">Deductions</h3>
                        </div>
                        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <InputField label="Absent Days (Penalty)" value={calcAbsentPenalty} readOnly bgGray suffix="PKR" />
                            <InputField label="Advance" value={advanceDeduction} readOnly bgGray suffix="PKR" />
                            <InputField label="Fine" value={fine} onChange={setFine} suffix="PKR" />
                            <InputField label="Others" value={otherDeductions} onChange={setOtherDeductions} suffix="PKR" />
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
                        <p className="text-3xl font-black text-[var(--primary)]">{finalAmount.toLocaleString()}/-</p>
                    </div>
                </div>

                <div className="pt-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-[var(--primary)]  text-white px-10 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
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

/* ── Reusable Input Field ── */
function InputField({ label, value, onChange, readOnly, bgGray, suffix }: {
    label: string;
    value: number;
    onChange?: (v: number) => void;
    readOnly?: boolean;
    bgGray?: boolean;
    suffix?: string;
}) {
    return (
        <div className="space-y-1.5 relative">
            <label className="text-xs font-bold text-gray-500">{label}</label>
            <input
                type="number"
                readOnly={readOnly}
                value={value || ''}
                onChange={onChange ? (e) => onChange(Number(e.target.value)) : undefined}
                placeholder={readOnly ? "[Auto Filled]" : "0"}
                className={`w-full pl-4 ${suffix ? 'pr-16' : 'pr-4'} py-3 rounded-xl text-sm font-${readOnly ? 'semibold' : 'bold'} outline-none transition-colors ${bgGray
                    ? 'bg-gray-50 border-2 border-gray-100 text-gray-500'
                    : 'bg-white border-2 border-gray-200 focus:border-[var(--primary)] text-gray-800'
                    }`}
            />
            {suffix && (
                <span className="absolute right-4 top-1/2 translate-y-0.5 text-xs font-bold text-gray-400">{suffix}</span>
            )}
        </div>
    );
}
