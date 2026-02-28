'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export interface PayrollSlipData {
    staffFirstName: string;
    staffLastName: string;
    staffDesignation: string;
    staffId: string;
    month: string;
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
}

export function formatMonthLabel(m: string): string {
    if (!m) return '';
    const [y, mo] = m.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(mo) - 1]} ${y}`;
}

export function handleSlipPrint(data: PayrollSlipData) {
    const pw = window.open('', '_blank');
    if (!pw) return;
    const month = formatMonthLabel(data.month);
    const html = `<!DOCTYPE html><html><head><title>Payroll Slip - ${data.staffFirstName} ${data.staffLastName}</title>
<style>@page{size:A4;margin:15mm}*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;color:#222;background:#fff}.slip{max-width:700px;margin:0 auto;padding:20px}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px}.logo-area{display:flex;align-items:center;gap:0}.logo-area img{height:55px}.slip-title{text-align:right}.slip-title h1{font-size:28px;font-weight:900;color:#222;margin:0}.slip-title .month{font-size:13px;color:#666;margin-top:2px}.contact-bar{display:flex;align-items:center;gap:16px;background:#B50104;color:#fff;padding:7px 16px;border-radius:6px;font-size:11px;margin-bottom:24px}.contact-bar span{display:flex;align-items:center;gap:5px}.emp-info{display:flex;justify-content:space-between;margin-bottom:20px;padding:0 4px}.emp-info div{font-size:13px}.emp-info strong{font-weight:700;color:#111}.tables-row{display:flex;gap:20px;margin-bottom:20px}.tables-row .tbl{flex:1}.tbl table{width:100%;border-collapse:collapse}.tbl .tbl-head{background:#f5f5f5;font-weight:700;font-size:13px;padding:8px 12px;border-bottom:2px solid #ddd}.tbl .tbl-head td:last-child{text-align:right}.tbl td{padding:7px 12px;font-size:12px;border-bottom:1px solid #eee}.tbl td:last-child{text-align:right;font-weight:600}.totals{margin-top:0}.totals table{width:50%;border-collapse:collapse}.totals td{padding:8px 12px;font-size:13px;font-weight:700;border-bottom:1px solid #ddd}.totals td:last-child{text-align:right}.totals .earning-row{background:#f0fdf4;color:#15803d}.totals .deduction-row{background:#fef2f2;color:#b91c1c}.print-date{text-align:right;font-size:11px;color:#999;margin-top:20px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head>
<body><div class="slip"><div class="header"><div class="logo-area"><img src="/Images/logo.jpg" alt="Tiger Transports"/></div><div class="slip-title"><h1>Payroll Slip</h1><div class="month">${month}</div></div></div>
<div class="contact-bar"><span>📞 +92 300 9280276</span><span>📍 PLOT NO. W2/142, NORTH WEST INDUSTRIAL ZONE NEAR PSO PUMP, PORT QASIM</span></div>
<div class="emp-info"><div><strong>Employee Name:</strong> ${data.staffFirstName} ${data.staffLastName}</div><div><strong>Designation:</strong> ${data.staffDesignation}</div><div><strong>Employee ID:</strong> E-${data.staffId.slice(-3).toUpperCase()}</div></div>
<div class="tables-row"><div class="tbl"><table><tr class="tbl-head"><td>Earning</td><td>Amount</td></tr><tr><td>Basic Salary</td><td>${data.basicSalary.toLocaleString()}</td></tr><tr><td>Overtime</td><td>${data.calcOvertimeEarning.toLocaleString()}</td></tr><tr><td>Bonus</td><td>${data.bonus.toLocaleString()}</td></tr><tr><td>Allowance</td><td>${data.allowance.toLocaleString()}</td></tr><tr><td>Others</td><td>${data.otherEarnings.toLocaleString()}</td></tr></table></div>
<div class="tbl"><table><tr class="tbl-head"><td>Deduction</td><td>Amount</td></tr><tr><td>Absent Days</td><td>${data.calcAbsentPenalty.toLocaleString()}</td></tr><tr><td>Advance</td><td>${data.advanceDeduction.toLocaleString()}</td></tr><tr><td>Fine</td><td>${data.fine.toLocaleString()}</td></tr><tr><td>Others</td><td>${data.otherDeductions.toLocaleString()}</td></tr></table></div></div>
<div class="totals"><table><tr class="earning-row"><td>Total Earning</td><td>${data.totalEarnings.toLocaleString()}/-</td></tr><tr class="deduction-row"><td>Total Deduction</td><td>${data.totalDeductions.toLocaleString()}/-</td></tr></table></div>
<div class="print-date">Print Date: ${new Date().toLocaleDateString('en-GB')}</div></div>
<script>window.onload = function() { window.print(); }</script></body></html>`;
    pw.document.write(html);
    pw.document.close();
}

export default function PayrollSlipPreview({ data, onPrint, onBack }: {
    data: PayrollSlipData;
    onPrint: () => void;
    onBack: () => void;
}) {
    const netSalary = data.totalEarnings - data.totalDeductions;
    const month = formatMonthLabel(data.month);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-800">Payroll Slip Preview</h2>
                <div className="flex gap-3">
                    <button onClick={onPrint} className="bg-[var(--primary)] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-red-100 transition-all cursor-pointer">
                        🖨️ Print Slip
                    </button>
                    <button onClick={onBack} className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer">
                        Back to Payroll
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden max-w-[700px] mx-auto">
                <div className="px-8 pt-6 pb-2 flex justify-between items-start">
                    <div className="flex items-center">
                        <Image src="/Images/logo.jpg" alt="Tiger Transports" width={120} height={55} className="object-contain" />
                    </div>
                    <div className="text-right">
                        <h1 className="text-2xl font-black text-gray-800">Payroll Slip</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{month}</p>
                    </div>
                </div>

                <div className="mx-6 mb-5 flex items-center gap-4 bg-[var(--primary)] text-white px-4 py-2 rounded-md text-[11px]">
                    <span>📞 +92 300 9280276</span>
                    <span>📍 PLOT NO. W2/142, NORTH WEST INDUSTRIAL ZONE NEAR PSO PUMP, PORT QASIM</span>
                </div>

                <div className="px-8 pb-4 flex justify-between text-sm">
                    <div><strong className="text-gray-700">Employee Name:</strong> <span className="text-gray-500">{data.staffFirstName} {data.staffLastName}</span></div>
                    <div><strong className="text-gray-700">Designation:</strong> <span className="text-gray-500">{data.staffDesignation}</span></div>
                    <div><strong className="text-gray-700">Employee ID:</strong> <span className="text-gray-500">E-{data.staffId.slice(-3).toUpperCase()}</span></div>
                </div>

                <div className="px-8 pb-4 flex gap-5">
                    <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
                        <div className="flex justify-between bg-gray-50 px-3 py-2 border-b border-gray-200 text-xs font-bold text-gray-700">
                            <span>Earning</span><span>Amount</span>
                        </div>
                        <SlipRow label="Basic Salary" value={data.basicSalary} />
                        <SlipRow label="Overtime" value={data.calcOvertimeEarning} />
                        <SlipRow label="Bonus" value={data.bonus} />
                        <SlipRow label="Allowance" value={data.allowance} />
                        <SlipRow label="Others" value={data.otherEarnings} />
                    </div>
                    <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
                        <div className="flex justify-between bg-gray-50 px-3 py-2 border-b border-gray-200 text-xs font-bold text-gray-700">
                            <span>Deduction</span><span>Amount</span>
                        </div>
                        <SlipRow label="Absent Days" value={data.calcAbsentPenalty} />
                        <SlipRow label="Advance" value={data.advanceDeduction} />
                        <SlipRow label="Fine" value={data.fine} />
                        <SlipRow label="Others" value={data.otherDeductions} />
                    </div>
                </div>

                <div className="px-8 pb-2">
                    <div className="w-1/2 border border-gray-200 rounded-lg overflow-hidden">
                        <div className="flex justify-between px-3 py-2 bg-green-50 text-green-700 text-xs font-bold border-b border-gray-200">
                            <span>Total Earning</span><span>{data.totalEarnings.toLocaleString()}/-</span>
                        </div>
                        <div className="flex justify-between px-3 py-2 bg-red-50 text-red-700 text-xs font-bold">
                            <span>Total Deduction</span><span>{data.totalDeductions.toLocaleString()}/-</span>
                        </div>
                    </div>
                </div>

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

function SlipRow({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex justify-between px-3 py-1.5 text-xs text-gray-600 border-b border-gray-50">
            <span>{label}</span>
            <span className="font-semibold">{value.toLocaleString()}</span>
        </div>
    );
}
