"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PlusCircle, CheckCircle2, AlertCircle } from "lucide-react";
import CustomDatePicker from "@/components/CustomDatePicker";
import CustomDropdown from "@/components/CustomDropdown";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddLedgerEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    partyName: string;
    partyType: "Customer" | "Outsider" | "Both";
}

const entryTypeOptions = [
    { value: "Credit", label: "Receipt — Cash Received from Party" },
    { value: "Debit", label: "Payment — Cash Paid to Party" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddLedgerEntryModal({
    isOpen,
    onClose,
    onSuccess,
    partyName,
    partyType,
}: AddLedgerEntryModalProps) {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const [entryType, setEntryType] = useState<"Debit" | "Credit">("Credit");
    const [date, setDate] = useState(todayStr);
    const [docNo, setDocNo] = useState("");
    const [narration, setNarration] = useState("");
    const [amount, setAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const resetForm = () => {
        setEntryType("Credit");
        setDate(todayStr);
        setDocNo("");
        setNarration("");
        setAmount("");
        setToast(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsed = parseFloat(amount);
        if (!narration.trim() || !date || isNaN(parsed) || parsed <= 0) {
            setToast({ type: "error", msg: "Please fill all required fields correctly." });
            return;
        }

        setIsSubmitting(true);
        setToast(null);

        try {
            const res = await fetch("/api/ledger/receipt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    partyName,
                    partyType,
                    entryType,
                    date,
                    docNo: docNo.trim() || undefined,
                    narration: narration.trim(),
                    amount: parsed,
                }),
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.error || "Failed to save");
            setToast({ type: "success", msg: "Entry saved successfully!" });
            setTimeout(() => {
                handleClose();
                onSuccess();
            }, 900);
        } catch (err: any) {
            setToast({ type: "error", msg: err.message || "Something went wrong." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div
                            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
                            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div
                                className="flex items-center justify-between px-6 py-4 border-b border-gray-100"
                                style={{ background: "linear-gradient(135deg, #0D0D0D 0%, #1a1a1a 100%)" }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                                        style={{ background: "rgba(181,1,4,0.3)" }}
                                    >
                                        <PlusCircle size={18} style={{ color: "var(--primary)" }} />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black text-white">Add Entry</h2>
                                        <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[180px]">
                                            {partyName}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* Entry Type */}
                                <CustomDropdown
                                    label="Entry Type"
                                    options={entryTypeOptions}
                                    value={entryType}
                                    onChange={(v) => setEntryType(v as "Debit" | "Credit")}
                                    required
                                />

                                {/* Date */}
                                <CustomDatePicker
                                    label="Date"
                                    value={date}
                                    onChange={(d) => {
                                        const yyyy = d.getFullYear();
                                        const mm = String(d.getMonth() + 1).padStart(2, "0");
                                        const dd = String(d.getDate()).padStart(2, "0");
                                        setDate(`${yyyy}-${mm}-${dd}`);
                                    }}
                                />

                                {/* Doc No (optional) */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Doc No{" "}
                                        <span className="text-gray-300 font-normal normal-case">(optional — auto-generated if blank)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={docNo}
                                        onChange={(e) => setDocNo(e.target.value)}
                                        placeholder="e.g. RCPT-001"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-800 placeholder-gray-300 outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                                    />
                                </div>

                                {/* Narration */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Narration <span style={{ color: "var(--primary)" }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={narration}
                                        onChange={(e) => setNarration(e.target.value)}
                                        placeholder="e.g. Cash Received — August Payment"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-800 placeholder-gray-300 outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                                    />
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Amount (PKR) <span style={{ color: "var(--primary)" }}>*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                                            Rs.
                                        </span>
                                        <input
                                            type="number"
                                            min="1"
                                            step="any"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0"
                                            required
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-800 placeholder-gray-300 outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                                        />
                                    </div>
                                </div>

                                {/* Toast */}
                                <AnimatePresence>
                                    {toast && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            className={`flex items-center gap-2.5 p-3 rounded-xl text-sm font-medium ${
                                                toast.type === "success"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-red-50 text-red-600"
                                            }`}
                                        >
                                            {toast.type === "success" ? (
                                                <CheckCircle2 size={16} className="flex-shrink-0" />
                                            ) : (
                                                <AlertCircle size={16} className="flex-shrink-0" />
                                            )}
                                            {toast.msg}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Actions */}
                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 py-3 rounded-xl text-sm font-black text-white transition-all cursor-pointer disabled:opacity-60"
                                        style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                                Saving…
                                            </span>
                                        ) : (
                                            "Save Entry"
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
