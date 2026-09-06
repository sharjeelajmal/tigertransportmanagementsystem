"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, FileText, Printer, Download, ArrowLeft,
    Calendar, Loader2, Sparkles
} from "lucide-react";
import CustomDatePicker from "@/components/CustomDatePicker";
import CustomDropdown from "@/components/CustomDropdown";

export interface ExpenseItem {
    _id: string;
    date: string;
    category: "Vehicle Expense" | "Office Expense";
    vehicleNo?: string;
    driverName?: string;
    helperName?: string;
    route?: string;
    amountGivenTo?: string;
    remarks?: string;
    expenseType: string;
    totalAmount: number;
    paidAmount?: number;
    remainingAmount?: number;
    paymentMethod?: string;
    status: "Paid" | "Unpaid" | "Partial Paid";
}

interface ExpenseLedgerModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialStartDate?: string;
    initialEndDate?: string;
    initialSpecificDate?: string;
    initialCategory?: string;
}

const categoryOptions = [
    { value: "All", label: "All Categories" },
    { value: "Vehicle Expense", label: "Vehicle Expense" },
    { value: "Office Expense", label: "Office Expense" },
];

const formatDateDMY = (dateVal: any): string => {
    if (!dateVal) return "-";
    if (typeof dateVal === "string" && dateVal.includes("-")) {
        const parts = dateVal.split("-");
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

const fmtMoney = (n: number): string => {
    return Number(n || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

function toDateStr(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export default function ExpenseLedgerModal({
    isOpen,
    onClose,
    initialStartDate = "",
    initialEndDate = "",
    initialSpecificDate = "",
    initialCategory = "All",
}: ExpenseLedgerModalProps) {
    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);
    const [specificDate, setSpecificDate] = useState(initialSpecificDate);
    const [category, setCategory] = useState(initialCategory);

    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [reportExpenses, setReportExpenses] = useState<ExpenseItem[]>([]);
    const [view, setView] = useState<"selection" | "report">("selection");

    useEffect(() => {
        if (isOpen) {
            setStartDate(initialStartDate);
            setEndDate(initialEndDate);
            setSpecificDate(initialSpecificDate);
            setCategory(initialCategory);

            if (initialStartDate || initialEndDate || initialSpecificDate) {
                handleFetchAndGenerate(initialStartDate, initialEndDate, initialSpecificDate, initialCategory);
            } else {
                setView("selection");
            }
        }
    }, [isOpen, initialStartDate, initialEndDate, initialSpecificDate, initialCategory]);

    const handleFetchAndGenerate = async (
        fromD = startDate,
        toD = endDate,
        specD = specificDate,
        cat = category
    ) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (specD) {
                params.set("date", specD);
            } else {
                if (fromD) params.set("startDate", fromD);
                if (toD) params.set("endDate", toD);
            }

            const res = await fetch(`/api/expenses?${params.toString()}`);
            const data = await res.json();

            if (data.success && Array.isArray(data.data)) {
                let list: ExpenseItem[] = data.data;
                if (cat !== "All") {
                    list = list.filter((e) => e.category === cat);
                }

                // Chronological sorting
                list.sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0));
                setReportExpenses(list);
                setView("report");
            }
        } catch (err) {
            console.error("Failed to generate expense ledger:", err);
            alert("Error loading expense records. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const setPreset = (type: "today" | "month" | "all") => {
        const today = new Date();
        if (type === "today") {
            const todayStr = toDateStr(today);
            setSpecificDate(todayStr);
            setStartDate("");
            setEndDate("");
        } else if (type === "month") {
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            setStartDate(toDateStr(firstDay));
            setEndDate(toDateStr(lastDay));
            setSpecificDate("");
        } else {
            setStartDate("");
            setEndDate("");
            setSpecificDate("");
        }
    };

    // Calculate totals
    const grandTotal = useMemo(
        () => reportExpenses.reduce((s, e) => s + (e.totalAmount || 0), 0),
        [reportExpenses]
    );
    const vehicleTotal = useMemo(
        () =>
            reportExpenses
                .filter((e) => e.category === "Vehicle Expense")
                .reduce((s, e) => s + (e.totalAmount || 0), 0),
        [reportExpenses]
    );
    const officeTotal = useMemo(
        () =>
            reportExpenses
                .filter((e) => e.category === "Office Expense")
                .reduce((s, e) => s + (e.totalAmount || 0), 0),
        [reportExpenses]
    );

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            const printArea = document.getElementById("expense-ledger-content");
            if (!printArea) {
                window.print();
                return;
            }

            const cleanHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Expense Ledger Sheet</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; background: #fff; color: #000; padding: 24px 30px; font-size: 11px; }
    @page { size: A4 portrait; margin: 12mm 15mm; }
    .header-title-row { text-align: center; position: relative; margin-bottom: 12px; }
    .header-title { font-size: 16px; font-weight: bold; text-decoration: underline; text-transform: uppercase; }
    .print-date { position: absolute; right: 0; top: 0; font-size: 10px; font-weight: bold; }
    .meta-box { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1.5px solid #000; padding-bottom: 6px; margin-bottom: 10px; }
    .meta-left { display: flex; flex-direction: column; gap: 4px; }
    .meta-row { font-size: 11px; }
    .meta-label { font-weight: bold; display: inline-block; min-width: 60px; }
    .meta-val { font-weight: bold; }
    .meta-right { font-weight: bold; font-size: 11px; }
    .date-underline { text-decoration: underline; margin: 0 4px; }
    .table-head { display: flex; font-weight: bold; font-size: 11px; border-bottom: 1.5px solid #000; padding-bottom: 4px; margin-bottom: 8px; }
    .col-sr { flex: 0.6; text-align: center; }
    .col-date { flex: 1.4; text-align: left; }
    .col-cat { flex: 1.6; text-align: left; }
    .col-type { flex: 2.2; text-align: left; }
    .col-target { flex: 1.8; text-align: left; }
    .col-remarks { flex: 2.6; text-align: left; }
    .col-status { flex: 1.2; text-align: center; }
    .col-amt { flex: 1.8; text-align: right; }
    .item-row { display: flex; padding: 3px 0; font-size: 10.5px; border-bottom: 1px dashed #e5e7eb; }
    .item-row:last-child { border-bottom: none; }
    .subtotal-box { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; border-top: 1px solid #777; padding-top: 5px; margin-top: 10px; font-size: 11px; font-weight: bold; }
    .subtotal-row { display: flex; justify-content: space-between; width: 300px; }
    .party-total-box { display: flex; justify-content: flex-end; align-items: center; gap: 30px; border-top: 1.5px solid #000; padding-top: 8px; margin-top: 12px; font-weight: bold; font-size: 12px; page-break-inside: avoid; break-inside: avoid; }
    .sign-section { display: flex; justify-content: space-between; margin-top: 45px; padding-top: 10px; page-break-inside: avoid; break-inside: avoid; }
    .sign-col { width: 170px; text-align: center; border-top: 1px dashed #000; padding-top: 4px; font-size: 10px; font-weight: bold; }
  </style>
</head>
<body>
  ${printArea.innerHTML}
</body>
</html>`;

            const cleanPeriod = (specificDate || `${startDate}_${endDate}` || "All_Records").replace(/[^a-zA-Z0-9_-]/g, "_");
            const filename = `Expense_Ledger_${cleanPeriod}.pdf`;

            const res = await fetch("/api/pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ html: cleanHtml, filename }),
            });

            if (!res.ok) throw new Error("PDF generation failed");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e) {
            console.error("PDF generation failed, opening browser print:", e);
            handleBrowserPrint();
        } finally {
            setIsDownloading(false);
        }
    };

    const handleBrowserPrint = () => {
        const printArea = document.getElementById("expense-ledger-content");
        if (!printArea) return;

        const cleanHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Expense Ledger Sheet</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; background: #fff; color: #000; padding: 24px 30px; font-size: 11px; }
    @page { size: A4 portrait; margin: 12mm 15mm; }
    .header-title-row { text-align: center; position: relative; margin-bottom: 12px; }
    .header-title { font-size: 16px; font-weight: bold; text-decoration: underline; text-transform: uppercase; }
    .print-date { position: absolute; right: 0; top: 0; font-size: 10px; font-weight: bold; }
    .meta-box { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1.5px solid #000; padding-bottom: 6px; margin-bottom: 10px; }
    .meta-left { display: flex; flex-direction: column; gap: 4px; }
    .meta-row { font-size: 11px; }
    .meta-label { font-weight: bold; display: inline-block; min-width: 60px; }
    .meta-val { font-weight: bold; }
    .meta-right { font-weight: bold; font-size: 11px; }
    .date-underline { text-decoration: underline; margin: 0 4px; }
    .table-head { display: flex; font-weight: bold; font-size: 11px; border-bottom: 1.5px solid #000; padding-bottom: 4px; margin-bottom: 8px; }
    .col-sr { flex: 0.6; text-align: center; }
    .col-date { flex: 1.4; text-align: left; }
    .col-cat { flex: 1.6; text-align: left; }
    .col-type { flex: 2.2; text-align: left; }
    .col-target { flex: 1.8; text-align: left; }
    .col-remarks { flex: 2.6; text-align: left; }
    .col-status { flex: 1.2; text-align: center; }
    .col-amt { flex: 1.8; text-align: right; }
    .item-row { display: flex; padding: 3px 0; font-size: 10.5px; border-bottom: 1px dashed #e5e7eb; }
    .item-row:last-child { border-bottom: none; }
    .subtotal-box { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; border-top: 1px solid #777; padding-top: 5px; margin-top: 10px; font-size: 11px; font-weight: bold; }
    .subtotal-row { display: flex; justify-content: space-between; width: 300px; }
    .party-total-box { display: flex; justify-content: flex-end; align-items: center; gap: 30px; border-top: 1.5px solid #000; padding-top: 8px; margin-top: 12px; font-weight: bold; font-size: 12px; page-break-inside: avoid; break-inside: avoid; }
    .sign-section { display: flex; justify-content: space-between; margin-top: 45px; padding-top: 10px; page-break-inside: avoid; break-inside: avoid; }
    .sign-col { width: 170px; text-align: center; border-top: 1px dashed #000; padding-top: 4px; font-size: 10px; font-weight: bold; }
  </style>
</head>
<body>
  ${printArea.innerHTML}
</body>
</html>`;

        const w = window.open("", "_blank");
        if (!w) {
            alert("Popup blocked! Please allow popups to print.");
            return;
        }
        w.document.open();
        w.document.write(cleanHtml);
        w.document.close();
        setTimeout(() => {
            w.print();
        }, 600);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white print:fixed-none">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={`bg-white rounded-2xl shadow-2xl overflow-hidden print:overflow-visible transition-all duration-300 print:shadow-none print:rounded-none print:w-full print:max-w-none ${
                            view === "report" ? "w-full max-w-5xl" : "w-full max-w-md"
                        }`}
                    >
                        {/* Modal Top Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70 print:hidden">
                            <div className="flex items-center gap-2">
                                {view === "report" && (
                                    <button
                                        type="button"
                                        onClick={() => setView("selection")}
                                        className="p-2 hover:bg-gray-200 rounded-full text-gray-600 mr-1 transition-colors cursor-pointer"
                                        title="Back to Date Filters"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                )}
                                <div className="p-2 bg-red-50 rounded-lg text-[var(--primary)]">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight leading-tight">
                                        {view === "selection" ? "Expense Ledger Sheet" : "List of Expenses"}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium">
                                        TTS Transport &bull; Expense Statement
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full text-gray-400 transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto print:max-h-none print:p-0 print:overflow-visible">
                            {view === "selection" ? (
                                <div className="space-y-5">
                                    {/* Presets */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                            Quick Presets
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setPreset("today")}
                                                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-700 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all cursor-pointer"
                                            >
                                                Today
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPreset("month")}
                                                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-700 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all cursor-pointer"
                                            >
                                                This Month
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPreset("all")}
                                                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-700 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all cursor-pointer"
                                            >
                                                All Records
                                            </button>
                                        </div>
                                    </div>

                                    {/* Date Range Section */}
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                            <Calendar size={14} className="text-[var(--primary)]" />
                                            From Date to To Date
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <CustomDatePicker
                                                label="From Date"
                                                value={startDate}
                                                onChange={(d) => {
                                                    setStartDate(toDateStr(d));
                                                    setSpecificDate("");
                                                }}
                                                align="left"
                                            />
                                            <CustomDatePicker
                                                label="To Date"
                                                value={endDate}
                                                onChange={(d) => {
                                                    setEndDate(toDateStr(d));
                                                    setSpecificDate("");
                                                }}
                                                align="right"
                                            />
                                        </div>
                                    </div>

                                    {/* Specific Date Section */}
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                            <Sparkles size={14} className="text-[var(--primary)]" />
                                            Or Specific Single Date
                                        </p>
                                        <CustomDatePicker
                                            label="Specific Date"
                                            value={specificDate}
                                            onChange={(d) => {
                                                setSpecificDate(toDateStr(d));
                                                setStartDate("");
                                                setEndDate("");
                                            }}
                                            align="left"
                                        />
                                    </div>

                                    {/* Category Filter */}
                                    <div>
                                        <CustomDropdown
                                            label="Expense Category"
                                            options={categoryOptions}
                                            value={category}
                                            onChange={setCategory}
                                        />
                                    </div>

                                    <div className="bg-blue-50/70 rounded-xl p-4 border border-blue-100 flex gap-3">
                                        <Calendar size={18} className="text-blue-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                            Tareekh muntakhib karein aur Ledger Summary Sheet generate karein jise aap print ya PDF mein download kar sakte hain.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                /* Report Document Preview - Same format as Customer Report */
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-4 sm:p-8 print:border-none print:p-0 print:shadow-none">
                                    <div id="expense-ledger-content">
                                        {/* 1. Header Title Row */}
                                        <div className="header-title-row text-center relative mb-4">
                                            <h2 className="header-title text-base sm:text-xl font-bold uppercase tracking-wide underline text-gray-950 font-sans">
                                                List of Expenses
                                            </h2>
                                            <div className="print-date absolute right-0 top-0 text-[11px] font-semibold text-gray-700">
                                                {formatDateDMY(new Date())}
                                            </div>
                                        </div>

                                        {/* 2. Metadata Row */}
                                        <div className="meta-box flex flex-wrap justify-between items-end border-b-2 border-black pb-2 mb-3 text-xs sm:text-[13px] text-gray-950 font-sans font-medium">
                                            <div className="meta-left space-y-1">
                                                <div className="meta-row">
                                                    <span className="meta-label font-bold mr-2">Company:</span>
                                                    <span className="meta-val uppercase font-bold tracking-wide">TTS TRANSPORT</span>
                                                </div>
                                                <div className="meta-row">
                                                    <span className="meta-label font-bold mr-2">Category:</span>
                                                    <span className="meta-val">{category === "All" ? "ALL EXPENSES" : category.toUpperCase()}</span>
                                                </div>
                                            </div>
                                            <div className="meta-right text-right font-bold mt-2 sm:mt-0">
                                                {specificDate ? (
                                                    <>
                                                        <span>DATE:</span>
                                                        <span className="date-underline underline ml-1">
                                                            {formatDateDMY(specificDate)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>FROM:</span>
                                                        <span className="date-underline underline ml-1 mr-4">
                                                            {startDate ? formatDateDMY(startDate) : "START"}
                                                        </span>
                                                        <span>TO:</span>
                                                        <span className="date-underline underline ml-1">
                                                            {endDate ? formatDateDMY(endDate) : "PRESENT"}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* 3. Table Column Headers */}
                                        <div className="table-head flex items-center font-bold text-xs sm:text-[13px] text-gray-950 border-b-2 border-black pb-1.5 mb-3 font-sans">
                                            <div className="col-sr flex-[0.6] text-center">Sr.#</div>
                                            <div className="col-date flex-[1.4] text-left">Date</div>
                                            <div className="col-cat flex-[1.6] text-left">Category</div>
                                            <div className="col-type flex-[2.2] text-left">Expense Type</div>
                                            <div className="col-target flex-[1.8] text-left">Vehicle / Person</div>
                                            <div className="col-remarks flex-[2.6] text-left">Route / Remarks</div>
                                            <div className="col-status flex-[1.2] text-center">Status</div>
                                            <div className="col-amt flex-[1.8] text-right">Amount</div>
                                        </div>

                                        {/* 4. Items List */}
                                        <div className="expenses-container space-y-1">
                                            {reportExpenses.length > 0 ? (
                                                reportExpenses.map((item, idx) => (
                                                    <div
                                                        key={item._id}
                                                        className="item-row flex items-center text-xs sm:text-[12px] text-gray-900 font-sans leading-relaxed hover:bg-gray-50/60 print:hover:bg-transparent"
                                                    >
                                                        <div className="col-sr flex-[0.6] text-center font-medium text-gray-500">
                                                            {String(idx + 1).padStart(2, "0")}
                                                        </div>
                                                        <div className="col-date flex-[1.4] text-left font-medium">
                                                            {formatDateDMY(item.date)}
                                                        </div>
                                                        <div className="col-cat flex-[1.6] text-left font-medium uppercase">
                                                            {item.category === "Vehicle Expense" ? "Vehicle" : "Office"}
                                                        </div>
                                                        <div className="col-type flex-[2.2] text-left font-bold uppercase truncate pr-1">
                                                            {item.expenseType}
                                                        </div>
                                                        <div className="col-target flex-[1.8] text-left uppercase font-medium truncate pr-1">
                                                            {item.vehicleNo || item.amountGivenTo || "—"}
                                                        </div>
                                                        <div className="col-remarks flex-[2.6] text-left font-medium text-gray-700 truncate pr-1">
                                                            {[item.route, item.driverName ? `Dr: ${item.driverName}` : "", item.remarks].filter(Boolean).join(" • ") || "—"}
                                                        </div>
                                                        <div className="col-status flex-[1.2] text-center font-bold text-[11px]">
                                                            {item.status}
                                                        </div>
                                                        <div className="col-amt flex-[1.8] text-right font-bold">
                                                            {fmtMoney(item.totalAmount)}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-12 text-center text-gray-400 font-bold italic text-sm">
                                                    No expenses found in the selected date range.
                                                </div>
                                            )}
                                        </div>

                                        {/* Subtotals breakdown */}
                                        {reportExpenses.length > 0 && (
                                            <div className="subtotal-box">
                                                <div className="subtotal-row">
                                                    <span>Vehicle Expenses:</span>
                                                    <span>{fmtMoney(vehicleTotal)}</span>
                                                </div>
                                                <div className="subtotal-row">
                                                    <span>Office Expenses:</span>
                                                    <span>{fmtMoney(officeTotal)}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* 5. Grand Total Footer */}
                                        {reportExpenses.length > 0 && (
                                            <div className="party-total-box flex justify-end items-center gap-6 border-t-2 border-black pt-3 mt-4 text-xs sm:text-sm font-black text-gray-950 font-sans break-inside-avoid">
                                                <span className="tracking-wide uppercase">Grand Total Expense:</span>
                                                <span className="text-right min-w-[140px] font-black text-sm sm:text-base">
                                                    {fmtMoney(grandTotal)}
                                                </span>
                                            </div>
                                        )}

                                        {/* Signatures */}
                                        <div className="sign-section">
                                            <div className="sign-col">Prepared By</div>
                                            <div className="sign-col">Checked By</div>
                                            <div className="sign-col">Authorized Signature</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Bottom Actions */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-3 print:hidden">
                            {view === "selection" ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-100 transition-all font-inter cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleFetchAndGenerate()}
                                        disabled={isLoading}
                                        className="flex-[2] px-4 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                        style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                                    >
                                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                                        {isLoading ? "Fetching Expenses..." : "Generate Summary"}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setView("selection")}
                                        className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <ArrowLeft size={16} />
                                        Change Dates
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleBrowserPrint}
                                        className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-900 text-gray-900 font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Printer size={16} />
                                        Print
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDownloadPDF}
                                        disabled={isDownloading}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-md hover:bg-black transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                        {isDownloading ? "Generating PDF..." : "Download PDF"}
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 12mm 15mm;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #expense-ledger-content,
                    #expense-ledger-content * {
                        visibility: visible !important;
                        overflow: visible !important;
                    }
                    #expense-ledger-content {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        background: #fff !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        overflow: visible !important;
                    }
                    .print-hidden {
                        display: none !important;
                    }
                    .break-inside-avoid {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }
                    .party-total-box {
                        visibility: visible !important;
                        display: flex !important;
                        overflow: visible !important;
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                        margin-top: 16px !important;
                        border-top: 2px solid #000 !important;
                        padding-top: 8px !important;
                    }
                    .party-total-box * {
                        visibility: visible !important;
                    }
                }
            ` }} />
        </AnimatePresence>
    );
}
