"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import CustomDropdown from "./CustomDropdown";
import CustomDatePicker from "./CustomDatePicker";

interface AddAdvanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: any) => void;
}

export default function AddAdvanceModal({ isOpen, onClose, onAdd }: AddAdvanceModalProps) {
    const [employee, setEmployee] = useState("");
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingStaff, setIsLoadingStaff] = useState(false);

    const [employees, setEmployees] = useState<{ label: string, value: string }[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchStaff();
        }
    }, [isOpen]);

    const fetchStaff = async () => {
        setIsLoadingStaff(true);
        try {
            const res = await fetch("/api/staff");
            const data = await res.json();
            if (data.success) {
                setEmployees(data.data.map((s: any) => ({
                    label: `${s.firstName} ${s.lastName}`,
                    value: s._id
                })));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingStaff(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/advance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employee, date, amount, reason })
            });
            const data = await res.json();

            if (data.success) {
                onAdd({ employee, date, amount, reason });
                onClose();
                setEmployee("");
                setDate(undefined);
                setAmount("");
                setReason("");
            } else {
                alert("Failed to save advance.");
            }
        } catch (error) {
            console.error(error);
            alert("Error processing advance.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-black text-gray-800 tracking-tight">Add Advance</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-600">Select Employee</label>
                                <CustomDropdown
                                    options={employees}
                                    value={employee}
                                    onChange={setEmployee}
                                    placeholder="Select an employee"
                                    className="w-full"
                                    searchable={true}
                                    isLoading={isLoadingStaff}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-600">Date</label>
                                <CustomDatePicker
                                    value={date}
                                    onChange={setDate}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5 relative">
                                <label className="block text-xs font-bold text-gray-600">Advance Amount</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-4 pr-12 py-3 bg-white border-2 border-gray-200 focus:border-[var(--primary)] rounded-xl text-sm outline-none transition-colors font-medium text-gray-800"
                                        required
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                                        PKR
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-600">Reason</label>
                                <input
                                    type="text"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Enter reason for advance"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 focus:border-[var(--primary)] rounded-xl text-sm outline-none transition-colors font-medium text-gray-800"
                                    required
                                />
                            </div>
                        </div>

                        {/* Footer actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !employee || !date || !amount || !reason}
                                className="text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                style={{ background: "var(--primary)" }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    "Save Advance"
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
