"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft } from "lucide-react";
import Image from "next/image";

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

    /* ── Payroll Slip Print ── */
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const slipHTML = `
<!DOCTYPE html>
<html>
<head>
<title>Payroll Slip - ${staff.firstName} ${staff.lastName}</title>
<style>
    @page { size: A4; margin: 15mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #222; background: #fff; }
    .slip { max-width: 700px; margin: 0 auto; padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
    .logo-area { display: flex; align-items: center; gap: 0; }
    .logo-area img { height: 55px; }
    .slip-title { text-align: right; }
    .slip-title h1 { font-size: 28px; font-weight: 900; color: #222; margin: 0; }
    .slip-title .month { font-size: 13px; color: #666; margin-top: 2px; }
    .contact-bar { display: flex; align-items: center; gap: 16px; background: var(--primary); color: #fff; padding: 7px 16px; border-radius: 6px; font-size: 11px; margin-bottom: 24px; }
    .contact-bar span { display: flex; align-items: center; gap: 5px; }
    .emp-info { display: flex; justify-content: space-between; margin-bottom: 20px; padding: 0 4px; }
    .emp-info div { font-size: 13px; }
    .emp-info strong { font-weight: 700; color: #111; }
    .tables-row { display: flex; gap: 20px; margin-bottom: 20px; }
    .tables-row .tbl { flex: 1; }
    .tbl table { width: 100%; border-collapse: collapse; }
    .tbl .tbl-head { background: #f5f5f5; font-weight: 700; font-size: 13px; padding: 8px 12px; border-bottom: 2px solid #ddd; }
    .tbl .tbl-head td:last-child { text-align: right; }
    .tbl td { padding: 7px 12px; font-size: 12px; border-bottom: 1px solid #eee; }
    .tbl td:last-child { text-align: right; font-weight: 600; }
    .totals { margin-top: 0; }
    .totals table { width: 50%; border-collapse: collapse; }
    .totals td { padding: 8px 12px; font-size: 13px; font-weight: 700; border-bottom: 1px solid #ddd; }
    .totals td:last-child { text-align: right; }
    .totals .earning-row { background: #f0fdf4; color: #15803d; }
    .totals .deduction-row { background: #fef2f2; color: #b91c1c; }
    .print-date { text-align: right; font-size: 11px; color: #999; margin-top: 20px; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="slip">
    <div class="header">
        <div class="logo-area">
            <img src="/Images/logo.jpg" alt="Tiger Transports" />
        </div>
        <div class="slip-title">
            <h1>Payroll Slip</h1>
            <div class="month">${formatMonth(month)}</div>
        </div>
    </div>
    <div class="contact-bar">
        <span>📞 +92 300 9280276</span>
        <span>📍 PLOT NO. W2/142, NORTH WEST INDUSTRIAL ZONE NEAR PSO PUMP, PORT QASIM</span>
    </div>
    <div class="emp-info">
        <div><strong>Employee Name:</strong> ${staff.firstName} ${staff.lastName}</div>
        <div><strong>Designation:</strong> ${staff.designation}</div>
        <div><strong>Employee ID:</strong> E-${staffId.slice(-3).toUpperCase()}</div>
    </div>
    <div class="tables-row">
        <div class="tbl">
            <table>
                <tr class="tbl-head"><td>Earning</td><td>Amount</td></tr>
                <tr><td>Basic Salary</td><td>${basicSalary.toLocaleString()}</td></tr>
                <tr><td>Overtime</td><td>${calcOvertimeEarning.toLocaleString()}</td></tr>
                <tr><td>Bonus</td><td>${bonus.toLocaleString()}</td></tr>
                <tr><td>Allowance</td><td>${allowance.toLocaleString()}</td></tr>
                <tr><td>Others</td><td>${otherEarnings.toLocaleString()}</td></tr>
            </table>
        </div>
        <div class="tbl">
            <table>
                <tr class="tbl-head"><td>Deduction</td><td>Amount</td></tr>
                <tr><td>Absent Days</td><td>${calcAbsentPenalty.toLocaleString()}</td></tr>
                <tr><td>Advance</td><td>${advanceDeduction.toLocaleString()}</td></tr>
                <tr><td>Fine</td><td>${fine.toLocaleString()}</td></tr>
                <tr><td>Others</td><td>${otherDeductions.toLocaleString()}</td></tr>
            </table>
        </div>
    </div>
    <div class="totals">
        <table>
            <tr class="earning-row"><td>Total Earning</td><td>${totalEarnings.toLocaleString()}/-</td></tr>
            <tr class="deduction-row"><td>Total Deduction</td><td>${totalDeductions.toLocaleString()}/-</td></tr>
        </table>
    </div>
    <div class="print-date">Print Date: ${new Date().toLocaleDateString('en-GB')}</div>
</div>
<script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

        printWindow.document.write(slipHTML);
        printWindow.document.close();
    };

    /* ── Payroll Slip Modal ── */
    if (showSlip && staff) {
        return (
            <div className="max-w-7xl mx-auto pb-12">
                <PayrollSlipPreview
                    staff={staff}
                    staffId={staffId}
                    month={month}
                    formatMonth={formatMonth}
                    basicSalary={basicSalary}
                    calcOvertimeEarning={calcOvertimeEarning}
                    bonus={bonus}
                    allowance={allowance}
                    otherEarnings={otherEarnings}
                    calcAbsentPenalty={calcAbsentPenalty}
                    advanceDeduction={advanceDeduction}
                    fine={fine}
                    otherDeductions={otherDeductions}
                    totalEarnings={totalEarnings}
                    totalDeductions={totalDeductions}
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

/* ── Payroll Slip Preview Component ── */
function PayrollSlipPreview({ staff, staffId, month, formatMonth, basicSalary, calcOvertimeEarning, bonus, allowance, otherEarnings, calcAbsentPenalty, advanceDeduction, fine, otherDeductions, totalEarnings, totalDeductions, onPrint, onBack }: {
    staff: StaffDetails;
    staffId: string;
    month: string;
    formatMonth: (m: string) => string;
    basicSalary: number;
    calcOvertimeEarning: number;
    bonus: number;
    allowance: number;
    otherEarnings: number;
    calcAbsentPenalty: number;
    advanceDeduction: number;
    fine: number;
    otherDeductions: number;
    totalEarnings: number;
    totalDeductions: number;
    onPrint: () => void;
    onBack: () => void;
}) {
    const netSalary = totalEarnings - totalDeductions;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Action bar */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-800">Payroll Slip Preview</h2>
                <div className="flex gap-3">
                    <button onClick={onPrint} className="bg-[var(--primary)]  text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-red-100 transition-all cursor-pointer">
                        🖨️ Print Slip
                    </button>
                    <button onClick={onBack} className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer">
                        Back to Payroll
                    </button>
                </div>
            </div>

            {/* Slip Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden max-w-[700px] mx-auto">
                {/* Header */}
                <div className="px-8 pt-6 pb-2 flex justify-between items-start">
                    <div className="flex items-center">
                        <Image src="/Images/logo.jpg" alt="Tiger Transports" width={120} height={55} className="object-contain" />
                    </div>
                    <div className="text-right">
                        <h1 className="text-2xl font-black text-gray-800">Payroll Slip</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{formatMonth(month)}</p>
                    </div>
                </div>

                {/* Contact Bar */}
                <div className="mx-6 mb-5 flex items-center gap-4 bg-[var(--primary)] text-white px-4 py-2 rounded-md text-[11px]">
                    <span>📞 +92 300 9280276</span>
                    <span>📍 PLOT NO. W2/142, NORTH WEST INDUSTRIAL ZONE NEAR PSO PUMP, PORT QASIM</span>
                </div>

                {/* Employee Info */}
                <div className="px-8 pb-4 flex justify-between text-sm">
                    <div><strong className="text-gray-700">Employee Name:</strong> <span className="text-gray-500">{staff.firstName} {staff.lastName}</span></div>
                    <div><strong className="text-gray-700">Designation:</strong> <span className="text-gray-500">{staff.designation}</span></div>
                    <div><strong className="text-gray-700">Employee ID:</strong> <span className="text-gray-500">E-{staffId.slice(-3).toUpperCase()}</span></div>
                </div>

                {/* Tables */}
                <div className="px-8 pb-4 flex gap-5">
                    {/* Earnings */}
                    <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
                        <div className="flex justify-between bg-gray-50 px-3 py-2 border-b border-gray-200 text-xs font-bold text-gray-700">
                            <span>Earning</span><span>Amount</span>
                        </div>
                        <SlipRow label="Basic Salary" value={basicSalary} />
                        <SlipRow label="Overtime" value={calcOvertimeEarning} />
                        <SlipRow label="Bonus" value={bonus} />
                        <SlipRow label="Allowance" value={allowance} />
                        <SlipRow label="Others" value={otherEarnings} />
                    </div>
                    {/* Deductions */}
                    <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
                        <div className="flex justify-between bg-gray-50 px-3 py-2 border-b border-gray-200 text-xs font-bold text-gray-700">
                            <span>Deduction</span><span>Amount</span>
                        </div>
                        <SlipRow label="Absent Days" value={calcAbsentPenalty} />
                        <SlipRow label="Advance" value={advanceDeduction} />
                        <SlipRow label="Fine" value={fine} />
                        <SlipRow label="Others" value={otherDeductions} />
                    </div>
                </div>

                {/* Totals */}
                <div className="px-8 pb-2">
                    <div className="w-1/2 border border-gray-200 rounded-lg overflow-hidden">
                        <div className="flex justify-between px-3 py-2 bg-green-50 text-green-700 text-xs font-bold border-b border-gray-200">
                            <span>Total Earning</span><span>{totalEarnings.toLocaleString()}/-</span>
                        </div>
                        <div className="flex justify-between px-3 py-2 bg-red-50 text-red-700 text-xs font-bold">
                            <span>Total Deduction</span><span>{totalDeductions.toLocaleString()}/-</span>
                        </div>
                    </div>
                </div>

                {/* Net & Print Date */}
                <div className="px-8 py-4 flex justify-between items-end border-t border-gray-100 mt-2">
                    <div>
                        <span className="text-xs text-gray-400">Net Salary</span>
                        <p className="text-2xl font-black text-[var(--primary)]">{netSalary.toLocaleString()}/-</p>
                    </div>
                    <p className="text-[11px] text-gray-400">Print Date: {new Date().toLocaleDateString('en-GB')}</p>
                </div>
            </div>
        </motion.div>
    );
}

/* ── Slip Table Row ── */
function SlipRow({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex justify-between px-3 py-1.5 text-xs text-gray-600 border-b border-gray-50">
            <span>{label}</span>
            <span className="font-semibold">{value.toLocaleString()}</span>
        </div>
    );
}
