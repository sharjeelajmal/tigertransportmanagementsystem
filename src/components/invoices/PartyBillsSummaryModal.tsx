"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileSpreadsheet, Calendar, Loader2, ArrowLeft, Download, Printer, AlertCircle } from "lucide-react";
import CustomDatePicker from "@/components/CustomDatePicker";
import { toLocalYMD } from "@/lib/ledgerRules";
import type { PartyKind, PartyBillsSummary } from "@/lib/partySummary";
import { buildPrintHtml, printHtml, downloadPdf, fileSafe } from "@/lib/printDocument";

interface PartyBillsSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    partyType: PartyKind;
    /** When both dates are given the summary is generated straight away. */
    initialStartDate?: Date | null;
    initialEndDate?: Date | null;
}

const CONTENT_ID = "party-bills-summary-content";

/** Print / PDF styles (Tailwind is not available in the print document). */
const SUMMARY_CSS = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; background: #fff; color: #000; padding: 24px 30px; font-size: 11px; }
    @page { size: A4 portrait; margin: 12mm 15mm; }
    .header-title-row { text-align: center; position: relative; margin-bottom: 8px; }
    .header-title { font-size: 16px; font-weight: bold; text-decoration: underline; }
    .print-date { position: absolute; right: 0; top: 0; font-size: 10px; font-weight: bold; }
    .period { text-align: center; font-size: 11.5px; margin-bottom: 10px; }
    table.summary { width: 100%; border-collapse: collapse; font-size: 11px; }
    table.summary th { font-weight: bold; text-align: left; padding: 4px 6px; border-top: 1.5px solid #000; border-bottom: 1.5px solid #000; }
    table.summary td { padding: 3px 6px; border-bottom: 1px solid #999; }
    table.summary tr { page-break-inside: avoid; break-inside: avoid; }
    .c-sr { width: 7%; text-align: center; }
    .c-code { width: 9%; }
    .c-bills { width: 14%; text-align: center !important; }
    .c-amt { width: 20%; text-align: right !important; }
    .c-name { text-transform: uppercase; }
    tr.total-row td { font-weight: bold; border-top: 1.5px solid #000; border-bottom: none; padding-top: 5px; }
    .empty { text-align: center; padding: 30px 0; font-style: italic; color: #666; }
`;

const formatDMY = (d: Date): string =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

const fmtMoney = (n: number): string =>
    Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function PartyBillsSummaryModal({
    isOpen,
    onClose,
    partyType,
    initialStartDate = null,
    initialEndDate = null,
}: PartyBillsSummaryModalProps) {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [view, setView] = useState<"selection" | "report">("selection");
    const [summary, setSummary] = useState<PartyBillsSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState("");
    // Ignores responses of older requests when the user generates again quickly.
    const requestSeq = useRef(0);

    const isOutsider = partyType === "Outsider";
    const title = isOutsider ? "List of Outsider Invoices Summary" : "List of Sales Invoices Summary";
    const nameHeader = isOutsider ? "Outsider Name" : "Customer Name";

    const generate = useCallback(async (from: Date | null, to: Date | null) => {
        if (!from || !to) {
            setError("Please select both From and To dates.");
            return;
        }
        if (toLocalYMD(from) > toLocalYMD(to)) {
            setError("From date cannot be after To date.");
            return;
        }

        const seq = ++requestSeq.current;
        setError("");
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                type: isOutsider ? "outsider" : "customer",
                startDate: toLocalYMD(from),
                endDate: toLocalYMD(to),
            });
            const res = await fetch(`/api/invoices/summary?${params.toString()}`);
            const json = await res.json().catch(() => null);
            if (seq !== requestSeq.current) return;

            if (!res.ok || !json?.success) {
                setError(json?.error || "Could not load the bills summary. Please try again.");
                return;
            }
            setSummary(json.data as PartyBillsSummary);
            setView("report");
        } catch {
            if (seq === requestSeq.current) setError("Network error while loading the bills summary.");
        } finally {
            if (seq === requestSeq.current) setIsLoading(false);
        }
    }, [isOutsider]);

    useEffect(() => {
        if (!isOpen) return;
        setStartDate(initialStartDate);
        setEndDate(initialEndDate);
        setSummary(null);
        setError("");
        if (initialStartDate && initialEndDate) {
            generate(initialStartDate, initialEndDate);
        } else {
            setView("selection");
        }
    }, [isOpen, initialStartDate, initialEndDate, generate]);

    const handleClose = () => {
        requestSeq.current++;
        setIsLoading(false);
        setView("selection");
        onClose();
    };

    const printDocument = () => {
        const content = document.getElementById(CONTENT_ID);
        return content ? buildPrintHtml(title, SUMMARY_CSS, content.innerHTML) : null;
    };

    const handlePrint = () => {
        const html = printDocument();
        if (html && !printHtml(html)) setError("Popup blocked — please allow popups to print.");
    };

    const handleDownload = async () => {
        const html = printDocument();
        if (!html || !startDate || !endDate) return;
        setIsDownloading(true);
        setError("");
        try {
            await downloadPdf(html, `${fileSafe(`${partyType}_Bills_Summary_${toLocalYMD(startDate)}_to_${toLocalYMD(endDate)}`)}.pdf`);
        } catch {
            setError("PDF could not be generated. You can use Print → Save as PDF instead.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 w-full ${view === "report" ? "max-w-4xl" : "max-w-md"}`}
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
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
                                    <FileSpreadsheet size={18} />
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight leading-tight">
                                        {isOutsider ? "Outsider Bills Summary" : "Customer Bills Summary"}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {isOutsider ? "Outsider Bills (OT)" : "Customer Bills (TT)"} &bull; Party-wise totals
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full text-gray-400 transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto">
                            {view === "selection" ? (
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 gap-4">
                                        <CustomDatePicker label="From Date" value={startDate || ""} onChange={setStartDate} />
                                        <CustomDatePicker label="To Date" value={endDate || ""} onChange={setEndDate} />
                                    </div>
                                    <div className="bg-blue-50/70 rounded-xl p-4 border border-blue-100 flex gap-3">
                                        <Calendar size={18} className="text-blue-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                            Har {isOutsider ? "outsider" : "customer"} ke in tareekhon ke darmiyan bane hue bills ki tadaad aur total amount ki list banegi.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto p-4 sm:p-8">
                                    <div id={CONTENT_ID} className="min-w-[560px]">
                                        <div className="header-title-row text-center relative mb-2">
                                            <h2 className="header-title text-base sm:text-xl font-bold underline text-gray-950">{title}</h2>
                                            <div className="print-date absolute right-0 top-0 text-[11px] font-semibold text-gray-700">
                                                {formatDMY(new Date())}
                                            </div>
                                        </div>
                                        <p className="period text-center text-xs sm:text-[13px] font-medium text-gray-900 mb-3">
                                            {startDate ? formatDMY(startDate) : "-"} To : {endDate ? formatDMY(endDate) : "-"}
                                        </p>

                                        <table className="summary w-full text-xs sm:text-[13px] text-gray-900 border-collapse">
                                            <thead>
                                                <tr className="border-y-2 border-black">
                                                    <th className="c-sr py-1.5 text-center font-bold">S.#</th>
                                                    <th className="c-code py-1.5 text-left font-bold">Code</th>
                                                    <th className="py-1.5 text-left font-bold">{nameHeader}</th>
                                                    <th className="c-bills py-1.5 text-center font-bold">No. of Bills</th>
                                                    <th className="c-amt py-1.5 pr-1 text-right font-bold">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {summary && summary.rows.length > 0 ? (
                                                    <>
                                                        {summary.rows.map((row, idx) => (
                                                            <tr key={row.partyId ?? `unregistered-${row.partyName}`} className="border-b border-gray-200 hover:bg-gray-50/60">
                                                                <td className="c-sr py-1.5 text-center text-gray-500">{idx + 1}</td>
                                                                <td className="c-code py-1.5">{row.code ?? "—"}</td>
                                                                <td className="c-name py-1.5 font-medium uppercase">{row.partyName}</td>
                                                                <td className="c-bills py-1.5 text-center">{row.billCount}</td>
                                                                <td className="c-amt py-1.5 pr-1 text-right font-medium">{fmtMoney(row.totalAmount)}</td>
                                                            </tr>
                                                        ))}
                                                        <tr className="total-row border-t-2 border-black font-black">
                                                            <td className="py-2" colSpan={3}></td>
                                                            <td className="c-bills py-2 text-center">{summary.totalBills}</td>
                                                            <td className="c-amt py-2 pr-1 text-right">{fmtMoney(summary.totalAmount)}</td>
                                                        </tr>
                                                    </>
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="empty py-12 text-center text-gray-400 font-bold italic text-sm">
                                                            No {isOutsider ? "outsider" : "customer"} bills found in the selected date range.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
                                    <AlertCircle size={16} className="shrink-0" />
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Footer actions */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-3">
                            {view === "selection" ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-100 transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => generate(startDate, endDate)}
                                        disabled={isLoading}
                                        className="flex-[2] px-4 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                        style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                                    >
                                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />}
                                        {isLoading ? "Loading Bills..." : "Generate Summary"}
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
                                        onClick={handlePrint}
                                        className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-900 text-gray-900 font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Printer size={16} />
                                        Print
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDownload}
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
        </AnimatePresence>
    );
}
