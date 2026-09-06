"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Calendar, Loader2, ArrowLeft, Download, Printer } from "lucide-react";
import CustomDatePicker from "@/components/CustomDatePicker";
import { parseLedgerDate } from "@/lib/ledgerRules";

interface ReportBillItem {
    id?: string;
    description: string;
    vehicle: string;
    qty: number;
    rate: number;
    amount: number;
}

interface ReportBill {
    id: string;
    invoiceNo: string;
    billDate: string;
    rawDate: Date;
    items: ReportBillItem[];
    subtotal: number;
}

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerName: string;
    customerId?: string;
    customerCode?: string;
}

const toLocalIso = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDateDMY = (dateVal: any): string => {
    const d = parseLedgerDate(dateVal);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

const fmtMoney = (n: number): string => {
    return Number(n || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const fmtQty = (q: number): string => {
    return Number(q || 0).toLocaleString("en-US", {
        maximumFractionDigits: 2,
    });
};

export default function ReportModal({ isOpen, onClose, customerName, customerCode }: ReportModalProps) {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [reportBills, setReportBills] = useState<ReportBill[]>([]);
    const [view, setView] = useState<"selection" | "report">("selection");

    const handleGenerate = async () => {
        if (!startDate || !endDate) {
            alert("Please select both From and To dates");
            return;
        }

        setIsLoading(true);
        try {
            const startStr = toLocalIso(startDate);
            const endStr = toLocalIso(endDate);
            const res = await fetch(`/api/invoices?search=${encodeURIComponent(customerName)}&startDate=${startStr}&endDate=${endStr}&sort=asc`);
            const data = await res.json();

            if (data.success && Array.isArray(data.data)) {
                const bills: ReportBill[] = [];

                data.data.forEach((inv: any) => {
                    const rawDate = parseLedgerDate(inv.billingDate || inv.invoiceDate || inv.createdAt);
                    const billDate = formatDateDMY(rawDate);

                    let items: ReportBillItem[] = [];
                    if (Array.isArray(inv.items) && inv.items.length > 0) {
                        items = inv.items.map((it: any) => {
                            const rate = Number(it.rate ?? 0);
                            const qty = Number(it.qty ?? 0);
                            const amount = Number(it.amount !== undefined && it.amount !== null ? it.amount : (rate * qty));
                            return {
                                id: it.id || it._id,
                                description: it.cargoDetails || (it.vehicle ? "VEHICLE CHARGES" : "CHARGES"),
                                vehicle: it.vehicle || "",
                                qty,
                                rate,
                                amount,
                            };
                        });
                    } else {
                        const desc = inv.remarks || [inv.pickupFrom, inv.deliverTo].filter(Boolean).join(" TO ") || "VEHICLE CHARGES";
                        items = [{
                            description: desc,
                            vehicle: inv.vehicleNo || "",
                            qty: 1,
                            rate: Number(inv.totalAmount || inv.subtotal || 0),
                            amount: Number(inv.totalAmount || inv.subtotal || 0),
                        }];
                    }

                    const calculatedSubtotal = items.reduce((sum, item) => sum + item.amount, 0);
                    const billSubtotal = calculatedSubtotal > 0 ? calculatedSubtotal : Number(inv.totalAmount || inv.subtotal || 0);

                    bills.push({
                        id: inv._id || inv.invoiceNo || Math.random().toString(),
                        invoiceNo: inv.invoiceNo || "N/A",
                        billDate,
                        rawDate,
                        items,
                        subtotal: billSubtotal,
                    });
                });

                bills.sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime() || a.invoiceNo.localeCompare(b.invoiceNo));
                setReportBills(bills);
                setView("report");
            } else {
                alert("Failed to fetch report data");
            }
        } catch (error) {
            console.error("Error fetching report:", error);
            alert("Something went wrong while generating the report");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            const printArea = document.getElementById("bills-summary-content");
            if (!printArea) {
                window.print();
                return;
            }

            const cleanHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${customerName} - Bills Summary</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; background: #fff; color: #000; padding: 24px 30px; font-size: 11px; }
    .header-title-row { text-align: center; position: relative; margin-bottom: 12px; }
    .header-title { font-size: 16px; font-weight: bold; text-decoration: underline; text-transform: uppercase; }
    .print-date { position: absolute; right: 0; top: 0; font-size: 10px; font-weight: bold; }
    .meta-box { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1.5px solid #000; padding-bottom: 6px; margin-bottom: 10px; }
    .meta-left { display: flex; flex-direction: column; gap: 4px; }
    .meta-row { font-size: 11px; }
    .meta-label { font-weight: bold; display: inline-block; min-width: 50px; }
    .meta-val { font-weight: bold; }
    .meta-right { font-weight: bold; font-size: 11px; }
    .date-underline { text-decoration: underline; margin: 0 4px; }
    .table-head { display: flex; font-weight: bold; font-size: 11px; border-bottom: 1.5px solid #000; padding-bottom: 4px; margin-bottom: 8px; }
    .col-desc { flex: 4.5; text-align: left; }
    .col-veh { flex: 2.5; text-align: left; padding-left: 6px; }
    .col-qty { flex: 1; text-align: right; }
    .col-rate { flex: 1.8; text-align: right; }
    .col-amt { flex: 2.2; text-align: right; }
    .bill-block { page-break-inside: avoid; break-inside: avoid; margin-bottom: 14px; }
    .bill-header { display: flex; gap: 20px; border-bottom: 1px solid #999; padding-bottom: 3px; margin-bottom: 4px; font-style: italic; font-weight: bold; font-size: 11px; }
    .bill-header .val { font-style: normal; text-decoration: underline; font-weight: bold; }
    .bill-item-row { display: flex; padding: 2px 0; font-size: 10.5px; }
    .bill-subtotal-row { display: flex; justify-content: flex-end; padding-top: 3px; font-weight: bold; font-size: 11px; }
    .bill-subtotal-amt { width: 18%; text-align: right; }
    .party-total-box { display: flex; justify-content: flex-end; align-items: center; gap: 30px; border-top: 1.5px solid #000; padding-top: 8px; margin-top: 18px; font-weight: bold; font-size: 12px; page-break-inside: avoid; break-inside: avoid; }
  </style>
</head>
<body>
  ${printArea.innerHTML}
</body>
</html>`;

            const filename = `${customerName.replace(/[^a-zA-Z0-9_-]/g, "_")}_Bills_Summary.pdf`;
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
            window.print();
        } finally {
            setIsDownloading(false);
        }
    };

    const handleBrowserPrint = () => {
        const printArea = document.getElementById("bills-summary-content");
        if (!printArea) return;

        const cleanHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${customerName} - Bills Summary</title>
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
    .meta-label { font-weight: bold; display: inline-block; min-width: 50px; }
    .meta-val { font-weight: bold; }
    .meta-right { font-weight: bold; font-size: 11px; }
    .date-underline { text-decoration: underline; margin: 0 4px; }
    .table-head { display: flex; font-weight: bold; font-size: 11px; border-bottom: 1.5px solid #000; padding-bottom: 4px; margin-bottom: 8px; }
    .col-desc { flex: 4.5; text-align: left; }
    .col-veh { flex: 2.5; text-align: left; padding-left: 6px; }
    .col-qty { flex: 1; text-align: right; }
    .col-rate { flex: 1.8; text-align: right; }
    .col-amt { flex: 2.2; text-align: right; }
    .bill-block { page-break-inside: avoid; break-inside: avoid; margin-bottom: 14px; }
    .bill-header { display: flex; gap: 20px; border-bottom: 1px solid #999; padding-bottom: 3px; margin-bottom: 4px; font-style: italic; font-weight: bold; font-size: 11px; }
    .bill-header .val { font-style: normal; text-decoration: underline; font-weight: bold; }
    .bill-item-row { display: flex; padding: 2px 0; font-size: 10.5px; }
    .bill-subtotal-row { display: flex; justify-content: flex-end; padding-top: 3px; font-weight: bold; font-size: 11px; }
    .bill-subtotal-amt { width: 18%; text-align: right; }
    .party-total-box { display: flex; justify-content: flex-end; align-items: center; gap: 30px; border-top: 1.5px solid #000; padding-top: 8px; margin-top: 18px; font-weight: bold; font-size: 12px; page-break-inside: avoid; break-inside: avoid; }
  </style>
</head>
<body>
  ${printArea.innerHTML}
</body>
</html>`;

        const w = window.open("", "_blank");
        if (!w) return;
        w.document.open();
        w.document.write(cleanHtml);
        w.document.close();
        setTimeout(() => { w.print(); }, 600);
    };

    const resetModal = () => {
        setStartDate(null);
        setEndDate(null);
        setReportBills([]);
        setView("selection");
        onClose();
    };

    const grandTotal = reportBills.reduce((acc, curr) => acc + curr.subtotal, 0);

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
                                        onClick={() => setView("selection")}
                                        className="p-2 hover:bg-gray-200 rounded-full text-gray-600 mr-1 transition-colors"
                                        title="Back to Date Filters"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                )}
                                <div className="p-2 bg-red-50 rounded-lg text-primary">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight leading-tight">
                                        {view === "selection" ? "Customer Bills Summary" : "List of Bills"}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {customerName}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={resetModal}
                                className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full text-gray-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto print:max-h-none print:p-0 print:overflow-visible">
                            {view === "selection" ? (
                                <div className="space-y-5">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                            Generating Summary For
                                        </p>
                                        <p className="text-lg font-black text-gray-900">
                                            {customerName}
                                        </p>
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

                                    <div className="bg-blue-50/70 rounded-xl p-4 border border-blue-100 flex gap-3">
                                        <Calendar size={18} className="text-blue-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                            Select the date range to generate the complete bill-by-bill summary report with individual bill subtotals and grand total.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                /* Report Document Preview */
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-4 sm:p-8 print:border-none print:p-0 print:shadow-none">
                                    <div id="bills-summary-content">
                                        {/* 1. Header Title Row */}
                                        <div className="header-title-row text-center relative mb-4">
                                            <h2 className="header-title text-base sm:text-xl font-bold uppercase tracking-wide underline text-gray-950 font-sans">
                                                List of Bills
                                            </h2>
                                            <div className="print-date absolute right-0 top-0 text-[11px] font-semibold text-gray-700">
                                                {formatDateDMY(new Date())}
                                            </div>
                                        </div>

                                        {/* 2. Customer Metadata Row */}
                                        <div className="meta-box flex flex-wrap justify-between items-end border-b-2 border-black pb-2 mb-3 text-xs sm:text-[13px] text-gray-950 font-sans font-medium">
                                            <div className="meta-left space-y-1">
                                                <div className="meta-row">
                                                    <span className="meta-label font-bold mr-2">Code:</span>
                                                    <span className="meta-val">{customerCode || "-"}</span>
                                                </div>
                                                <div className="meta-row">
                                                    <span className="meta-label font-bold mr-2">Name:</span>
                                                    <span className="meta-val uppercase font-bold tracking-wide">{customerName}</span>
                                                </div>
                                            </div>
                                            <div className="meta-right text-right font-bold mt-2 sm:mt-0">
                                                <span>FROM:</span>
                                                <span className="date-underline underline ml-1 mr-4">
                                                    {startDate ? formatDateDMY(startDate) : "-"}
                                                </span>
                                                <span>TO:</span>
                                                <span className="date-underline underline ml-1">
                                                    {endDate ? formatDateDMY(endDate) : "-"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* 3. Table Column Headers */}
                                        <div className="table-head flex items-center font-bold text-xs sm:text-[13px] text-gray-950 border-b-2 border-black pb-1.5 mb-3 font-sans">
                                            <div className="col-desc flex-[4.5] text-left">Description</div>
                                            <div className="col-veh flex-[2.5] text-left pl-2">Vehicle #</div>
                                            <div className="col-qty flex-1 text-right">Qty</div>
                                            <div className="col-rate flex-[1.8] text-right">Rate</div>
                                            <div className="col-amt flex-[2.2] text-right">Amount</div>
                                        </div>

                                        {/* 4. Bills Grouped List */}
                                        <div className="bills-container space-y-4">
                                            {reportBills.length > 0 ? (
                                                reportBills.map((bill) => (
                                                    <div key={bill.id} className="bill-block break-inside-avoid">
                                                        {/* Bill Sub-Header */}
                                                        <div className="bill-header flex items-center gap-6 border-b border-gray-400 pb-1 mb-1.5 text-xs sm:text-[13px] font-bold italic text-gray-900 font-sans">
                                                            <div className="bill-header-item">
                                                                Bill No. <span className="val not-italic font-bold underline ml-1">{bill.invoiceNo}</span>
                                                            </div>
                                                            <div className="bill-header-item ml-4">
                                                                Bill dt: <span className="val not-italic font-bold underline ml-1">{bill.billDate}</span>
                                                            </div>
                                                        </div>

                                                        {/* Bill Line Items */}
                                                        <div className="bill-items space-y-1">
                                                            {bill.items.map((item, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="bill-item-row flex items-center text-xs sm:text-[12px] text-gray-900 font-sans leading-relaxed hover:bg-gray-50/60 print:hover:bg-transparent"
                                                                >
                                                                    <div className="col-desc flex-[4.5] text-left truncate font-medium uppercase pr-2">
                                                                        {item.description}
                                                                    </div>
                                                                    <div className="col-veh flex-[2.5] text-left pl-2 font-medium uppercase text-gray-800">
                                                                        {item.vehicle || ""}
                                                                    </div>
                                                                    <div className="col-qty flex-1 text-right font-medium">
                                                                        {fmtQty(item.qty)}
                                                                    </div>
                                                                    <div className="col-rate flex-[1.8] text-right font-medium">
                                                                        {fmtMoney(item.rate)}
                                                                    </div>
                                                                    <div className="col-amt flex-[2.2] text-right font-medium">
                                                                        {fmtMoney(item.amount)}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Bill Subtotal */}
                                                        <div className="bill-subtotal-row flex justify-end pt-1 font-bold text-xs sm:text-[13px] text-gray-950 font-sans">
                                                            <div className="bill-subtotal-amt flex-[2.2] text-right font-bold text-gray-950">
                                                                {fmtMoney(bill.subtotal)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-12 text-center text-gray-400 font-bold italic text-sm">
                                                    No bills found for this customer in the selected date range.
                                                </div>
                                            )}
                                        </div>

                                        {/* 5. Partywise Total Footer */}
                                        {reportBills.length > 0 && (
                                            <div className="party-total-box flex justify-end items-center gap-6 border-t-2 border-black pt-3 mt-6 text-xs sm:text-sm font-black text-gray-950 font-sans break-inside-avoid">
                                                <span className="tracking-wide">Partywise Total:</span>
                                                <span className="text-right min-w-[120px] font-black text-sm sm:text-base">
                                                    {fmtMoney(grandTotal)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Bottom Actions */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-3 print:hidden">
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
                                        className="flex-[2] px-4 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                                        style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                                    >
                                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                                        {isLoading ? "Fetching Bills..." : "Generate Summary"}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setView("selection")}
                                        className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft size={16} />
                                        Change Dates
                                    </button>
                                    <button
                                        onClick={handleBrowserPrint}
                                        className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-900 text-gray-900 font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Printer size={16} />
                                        Print
                                    </button>
                                    <button
                                        onClick={handleDownloadPDF}
                                        disabled={isDownloading}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-md hover:bg-black transition-all flex items-center justify-center gap-2"
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
                    #bills-summary-content,
                    #bills-summary-content * {
                        visibility: visible !important;
                        overflow: visible !important;
                    }
                    #bills-summary-content {
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
