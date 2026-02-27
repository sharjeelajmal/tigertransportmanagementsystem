"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import CustomDropdown from "../CustomDropdown";
import CustomDatePicker from "../CustomDatePicker";

interface AddAllocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: () => void;
    defaultOutsiderId?: string;
}

export default function AddAllocationModal({ isOpen, onClose, onAdd, defaultOutsiderId }: AddAllocationModalProps) {
    const [form, setForm] = useState({
        outsider: defaultOutsiderId || "",
        customerName: "",
        allocationDate: new Date().toISOString().split('T')[0],
        vehicleQty: 0,
        laborQty: 0,
        totalAmount: 0,
        paidAmount: 0,
        description: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [outsiders, setOutsiders] = useState<{ label: string, value: string }[]>([]);
    const [isLoadingOutsiders, setIsLoadingOutsiders] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchOutsiders();
            if (defaultOutsiderId) {
                setForm(prev => ({ ...prev, outsider: defaultOutsiderId }));
            }
        }
    }, [isOpen, defaultOutsiderId]);

    const fetchOutsiders = async () => {
        setIsLoadingOutsiders(true);
        try {
            const res = await fetch("/api/outsiders");
            const data = await res.json();
            if (data.success) {
                setOutsiders(data.data.map((o: any) => ({
                    label: o.outsiderName,
                    value: o._id
                })));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingOutsiders(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/outsiders/allocations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            const data = await res.json();

            if (data.success) {
                onAdd();
                onClose();
                setForm({
                    outsider: defaultOutsiderId || "",
                    customerName: "",
                    allocationDate: new Date().toISOString().split('T')[0],
                    vehicleQty: 0,
                    laborQty: 0,
                    totalAmount: 0,
                    paidAmount: 0,
                    description: ""
                });
            } else {
                alert("Failed to save allocation.");
            }
        } catch (error) {
            console.error(error);
            alert("Error processing allocation.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
                    className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/50">
                        <div>
                            <h2 className="text-xl font-black text-gray-800 tracking-tight">Add New Allocation</h2>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Outsider Records</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all cursor-pointer"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Outsider Select */}
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Outsider Name</label>
                                {defaultOutsiderId ? (
                                    <div className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-100 rounded-xl text-sm font-bold text-gray-500">
                                        {outsiders.find(o => o.value === defaultOutsiderId)?.label || 'Loading...'}
                                    </div>
                                ) : (
                                    <CustomDropdown
                                        options={outsiders}
                                        value={form.outsider}
                                        onChange={(val) => setForm(prev => ({ ...prev, outsider: val }))}
                                        placeholder="Select Outsider"
                                        className="w-full"
                                        searchable={true}
                                        isLoading={isLoadingOutsiders}
                                    />
                                )}
                            </div>

                            {/* Customer Name */}
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Customer Name</label>
                                <input
                                    type="text"
                                    value={form.customerName}
                                    onChange={(e) => setForm(prev => ({ ...prev, customerName: e.target.value }))}
                                    placeholder="Enter Customer Name"
                                    className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100 focus:border-[var(--primary)] rounded-xl text-sm outline-none transition-all font-bold text-gray-800"
                                    required
                                />
                            </div>

                            {/* Date */}
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Allocation Date</label>
                                <CustomDatePicker
                                    value={form.allocationDate}
                                    onChange={(date) => {
                                        if (date) {
                                            const yyyy = date.getFullYear();
                                            const mm = String(date.getMonth() + 1).padStart(2, "0");
                                            const dd = String(date.getDate()).padStart(2, "0");
                                            setForm(prev => ({ ...prev, allocationDate: `${yyyy}-${mm}-${dd}` }));
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-gray-50">
                            {/* Vehicle Qty */}
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Vehicle Qty</label>
                                <input
                                    type="number"
                                    value={form.vehicleQty}
                                    onChange={(e) => setForm(prev => ({ ...prev, vehicleQty: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100 focus:border-[var(--primary)] rounded-xl text-sm outline-none transition-all font-bold text-gray-800"
                                />
                            </div>

                            {/* Labor Qty */}
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Labor Qty</label>
                                <input
                                    type="number"
                                    value={form.laborQty}
                                    onChange={(e) => setForm(prev => ({ ...prev, laborQty: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100 focus:border-[var(--primary)] rounded-xl text-sm outline-none transition-all font-bold text-gray-800"
                                />
                            </div>

                            {/* Total Amount */}
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Total Amount</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={form.totalAmount}
                                        onChange={(e) => setForm(prev => ({ ...prev, totalAmount: parseInt(e.target.value) || 0 }))}
                                        className="w-full pl-4 pr-12 py-3 bg-gray-50/50 border-2 border-gray-100 focus:border-[var(--primary)] rounded-xl text-sm outline-none transition-all font-bold text-gray-800"
                                        required
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">PKR</span>
                                </div>
                            </div>

                            {/* Paid Amount */}
                            <div className="space-y-2">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Paid Amount</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={form.paidAmount}
                                        onChange={(e) => setForm(prev => ({ ...prev, paidAmount: parseInt(e.target.value) || 0 }))}
                                        className="w-full pl-4 pr-12 py-3 bg-gray-50/50 border-2 border-gray-100 focus:border-[var(--primary)] rounded-xl text-sm outline-none transition-all font-bold text-gray-800"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">PKR</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2 pt-4">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Description (Optional)</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                                rows={2}
                                placeholder="Add any specific details here..."
                                className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100 focus:border-[var(--primary)] rounded-xl text-sm outline-none transition-all font-bold text-gray-800 resize-none"
                            />
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-end gap-3 pt-6 mt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(var(--primary-rgb, 181,1,4),0.15)" }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isSubmitting || !form.outsider || !form.customerName || !form.totalAmount}
                                className="px-10 py-3 rounded-xl text-white text-sm font-black shadow-lg shadow-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                            >
                                {isSubmitting ? "Processing..." : "Create Allocation"}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
