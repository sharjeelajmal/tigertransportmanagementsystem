"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Calendar, Loader2, ArrowLeft, Download } from "lucide-react";
import CustomDatePicker from "@/components/CustomDatePicker";

interface ReportItem {
    date: string;
    cargoDetails: string;
    vehicle: string;
    rate: number;
    qty: number;
    amount: number;
}

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerName: string;
}

export default function ReportModal({ isOpen, onClose, customerName }: ReportModalProps) {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [reportItems, setReportItems] = useState<ReportItem[]>([]);
    const [view, setView] = useState<"selection" | "report">("selection");

    const handleGenerate = async () => {
        if (!startDate || !endDate) {
            alert("Please select both From and To dates");
            return;
        }

        setIsLoading(true);
        try {
            const startStr = startDate.toISOString().split('T')[0];
            const endStr = endDate.toISOString().split('T')[0];
            const res = await fetch(`/api/invoices?search=${encodeURIComponent(customerName)}&startDate=${startStr}&endDate=${endStr}`);
            const data = await res.json();

            if (data.success) {
                const items: ReportItem[] = [];
                data.data.forEach((inv: any) => {
                    inv.items.forEach((item: any) => {
                        items.push({
                            date: inv.invoiceDate,
                            cargoDetails: item.cargoDetails,
                            vehicle: item.vehicle,
                            rate: item.rate,
                            qty: item.qty,
                            amount: item.rate * item.qty
                        });
                    });
                });
                setReportItems(items);
                setView("report");
            } else {
                alert("Failed to fetch report data");
            }
        } catch (error) {
            console.error("Error fetching report:", error);
            alert("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const resetModal = () => {
        setStartDate(null);
        setEndDate(null);
        setReportItems([]);
        setView("selection");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={`bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${view === "report" ? "w-full max-w-4xl" : "w-full max-w-md"}`}
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 print:bg-white">
                            <div className="flex items-center gap-2">
                                {view === "report" && (
                                    <button onClick={() => setView("selection")} className="p-2 hover:bg-gray-200 rounded-full text-gray-600 mr-1 print:hidden">
                                        <ArrowLeft size={18} />
                                    </button>
                                )}
                                <div className="p-2 bg-red-50 rounded-lg text-primary print:hidden">
                                    <FileText size={18} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">
                                    {view === "selection" ? "Customer Report" : "Report Details"}
                                </h3>
                            </div>
                            <button onClick={resetModal} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full text-gray-400 transition-colors print:hidden">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {view === "selection" ? (
                                <>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Generating report for:</p>
                                        <p className="text-lg font-bold text-gray-900">{customerName}</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <CustomDatePicker
                                            label="From Date"
                                            value={startDate || ""}
                                            onChange={setStartDate}
                                        />
                                        <CustomDatePicker
                                            label="To Date"
                                            value={endDate || ""}
                                            onChange={setEndDate}
                                        />
                                    </div>

                                    <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 flex gap-3">
                                        <Calendar size={18} className="text-blue-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-blue-700 leading-relaxed">
                                            Select the date range to see all items and details for this customer.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Customer</p>
                                            <p className="text-xl font-black text-gray-900">{customerName}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Range: {startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Total Items</p>
                                            <p className="text-xl font-black text-primary">{reportItems.length}</p>
                                        </div>
                                    </div>

                                    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                                        <table className="w-full text-left text-sm border-collapse min-w-[600px] md:min-w-full">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
                                                    <th className="px-4 py-3">Date</th>
                                                    <th className="px-4 py-3">Cargo Details</th>
                                                    <th className="px-4 py-3">Vehicle</th>
                                                    <th className="px-4 py-3 text-right">Rate</th>
                                                    <th className="px-4 py-3 text-right">Qty</th>
                                                    <th className="px-4 py-3 text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportItems.length > 0 ? (
                                                    reportItems.map((item, idx) => (
                                                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-4 py-3 font-medium text-gray-600 whitespace-nowrap">{item.date}</td>
                                                            <td className="px-4 py-3 font-bold text-gray-900">{item.cargoDetails}</td>
                                                            <td className="px-4 py-3 text-gray-600">{item.vehicle || "-"}</td>
                                                            <td className="px-4 py-3 text-right font-medium">{item.rate.toLocaleString()}</td>
                                                            <td className="px-4 py-3 text-right font-medium">{item.qty}</td>
                                                            <td className="px-4 py-3 text-right font-black text-gray-900">
                                                                {item.amount.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={6} className="px-4 py-10 text-center text-gray-400 font-bold italic">
                                                            No items found for this period.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                            {reportItems.length > 0 && (
                                                <tfoot>
                                                    <tr className="bg-gray-50/50 font-black">
                                                        <td colSpan={5} className="px-4 py-3 text-right text-gray-600 uppercase text-xs tracking-widest">Grand Total</td>
                                                        <td className="px-4 py-3 text-right text-primary text-lg">
                                                            {reportItems.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            )}
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 print:hidden">
                            {view === "selection" ? (
                                <>
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-100 transition-all font-inter"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isLoading}
                                        className="flex-[2] px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                        style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                                    >
                                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                                        {isLoading ? "Fetching..." : "Generate Report"}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setView("selection")}
                                        className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-100 transition-all"
                                    >
                                        Back to Filters
                                    </button>
                                    <button
                                        onClick={() => window.print()}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2"
                                    >
                                        <Download size={18} />
                                        Print Report
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    .fixed.inset-0.z-\[100\],
                    .fixed.inset-0.z-\[100\] * {
                        visibility: visible !important;
                    }
                    .fixed.inset-0.z-\[100\] {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        background: white !important;
                        backdrop-filter: none !important;
                        padding: 0 !important;
                    }
                    .fixed.inset-0.z-\[100\] > div {
                        box-shadow: none !important;
                        width: 100% !important;
                        max-width: none !important;
                        border: none !important;
                        transform: none !important;
                    }
                    .max-h-\[70vh\] {
                        max-height: none !important;
                        overflow: visible !important;
                    }
                    .print\:hidden {
                        display: none !important;
                    }
                    /* Ensure table and contents are correctly visible */
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    th, td {
                        border: 1px solid #eee !important;
                    }
                }
            `}</style>
        </AnimatePresence>
    );
}
