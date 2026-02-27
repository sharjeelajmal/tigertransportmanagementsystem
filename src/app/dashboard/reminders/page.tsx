"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell, Save, Trash2, Edit2, CheckCircle,
    Clock, Calendar as CalendarIcon, X, Plus, AlertCircle
} from "lucide-react";
import CustomDatePicker from "@/components/CustomDatePicker";
import CustomTimePicker from "@/components/CustomTimePicker";
import Loader from "@/components/Loader";
import DeleteModal from "@/components/DeleteModal";

interface Reminder {
    _id: string;
    details: string;
    reminderDate: string;
    reminderTime: string;
    isCompleted: boolean;
}

const inputCls = "w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:border-[var(--primary)] transition-all placeholder:text-gray-300";

export default function RemindersPage() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [form, setForm] = useState({
        details: "",
        reminderDate: new Date().toISOString().split("T")[0],
        reminderTime: "12:00",
    });

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchReminders();
    }, []);

    const fetchReminders = async () => {
        try {
            const res = await fetch("/api/reminders");
            const data = await res.json();
            if (data.success) setReminders(data.data);
        } catch (error) {
            console.error("Error fetching reminders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.details) return;
        setIsSubmitting(true);
        try {
            const url = editingId ? `/api/reminders/${editingId}` : "/api/reminders";
            const method = editingId ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                setForm({ details: "", reminderDate: new Date().toISOString().split("T")[0], reminderTime: "12:00" });
                setEditingId(null);
                fetchReminders();
            }
        } catch (error) {
            console.error("Error saving reminder:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleStatus = async (reminder: Reminder) => {
        try {
            const res = await fetch(`/api/reminders/${reminder._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isCompleted: !reminder.isCompleted }),
            });
            if (res.ok) fetchReminders();
        } catch (error) {
            console.error("Error toggling status:", error);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/reminders/${deleteId}`, { method: "DELETE" });
            if (res.ok) {
                setDeleteId(null);
                fetchReminders();
            }
        } catch (error) {
            console.error("Error deleting reminder:", error);
        }
    };

    const startEdit = (r: Reminder) => {
        setEditingId(r._id);
        setForm({
            details: r.details,
            reminderDate: r.reminderDate.split("T")[0],
            reminderTime: r.reminderTime,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto pb-20 px-2 md:px-0">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-3 px-1">
                <div className="min-w-0">
                    <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-red-100 flex-shrink-0">
                            <Bell className="text-white w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <span className="truncate">Manual Reminders</span>
                    </h1>
                    <p className="text-gray-400 text-[10px] md:text-sm mt-0.5 font-medium truncate">Manage your 'hisab kitab' reminders</p>
                </div>
            </motion.div>

            {/* Form Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50"
            >
                <div className="px-4 md:px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                    <h2 className="font-bold text-sm md:text-base text-gray-800 flex items-center gap-2">
                        {editingId ? <Edit2 size={16} className="text-[var(--primary)]" /> : <Plus size={16} className="text-[var(--primary)]" />}
                        {editingId ? "Edit Reminder" : "New Reminder"}
                    </h2>
                    {editingId && (
                        <button onClick={() => { setEditingId(null); setForm({ details: "", reminderDate: new Date().toISOString().split("T")[0], reminderTime: "12:00" }); }} className="text-[10px] md:text-xs font-bold text-red-500 hover:underline cursor-pointer">
                            Cancel
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Reminder Details</label>
                        <textarea
                            className={`${inputCls} min-h-[120px] resize-none`}
                            placeholder="Type your hisab kitab or reminder details here..."
                            value={form.details}
                            onChange={(e) => setForm(p => ({ ...p, details: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Date</label>
                            <CustomDatePicker
                                value={form.reminderDate}
                                onChange={(d) => d && setForm(p => ({ ...p, reminderDate: d.toISOString().split("T")[0] }))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Time</label>
                            <CustomTimePicker
                                value={form.reminderTime}
                                onChange={(t) => setForm(p => ({ ...p, reminderTime: t }))}
                                placeholder="12:00"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 md:py-3 rounded-xl text-white text-sm font-black shadow-lg shadow-red-50/50 cursor-pointer disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                        >
                            {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                            <span className="uppercase tracking-widest text-[10px] md:text-xs">
                                {isSubmitting ? "Saving..." : (editingId ? "Update" : "Save")}
                            </span>
                        </motion.button>
                    </div>
                </form>
            </motion.div>

            {/* List Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50"
            >
                <div className="px-4 md:px-6 py-4 md:py-6 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="font-bold text-sm md:text-base text-gray-900 uppercase tracking-tighter">History</h2>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-[9px] md:text-[10px] font-black uppercase text-gray-400">
                        {reminders.length} Total
                    </span>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    <div className="min-h-[200px]">
                        {isLoading ? (
                            <div className="p-8 space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : reminders.length === 0 ? (
                            <div className="px-6 py-20 text-center">
                                <div className="flex flex-col items-center gap-3 opacity-20 text-gray-300">
                                    <Bell size={48} />
                                    <p className="font-black text-[10px] uppercase tracking-[0.2em]">No records found</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                                {["Details", "Date & Time", "Status", "Actions"].map(h => (
                                                    <th key={h} className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {reminders.map((r) => (
                                                <tr key={r._id} className={`group hover:bg-gray-50/80 transition-all ${r.isCompleted ? 'opacity-60' : ''}`}>
                                                    <td className="px-6 py-5 min-w-[300px]">
                                                        <p className={`text-sm font-semibold text-gray-700 leading-relaxed ${r.isCompleted ? 'line-through decoration-gray-400 text-gray-400' : ''}`}>
                                                            {r.details}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-5 whitespace-nowrap">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                                                <CalendarIcon size={12} className="text-[var(--primary)]" />
                                                                {new Date(r.reminderDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                                                <Clock size={12} />
                                                                {r.reminderTime}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <StatusBadge r={r} />
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <ActionButton onClick={() => toggleStatus(r)} variant={r.isCompleted ? "pending" : "done"} />
                                                            <ActionButton onClick={() => startEdit(r)} variant="edit" />
                                                            <ActionButton onClick={() => setDeleteId(r._id)} variant="delete" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="md:hidden divide-y divide-gray-50">
                                    {reminders.map((r) => (
                                        <div key={r._id} className={`p-4 space-y-3 ${r.isCompleted ? 'bg-gray-50/50' : 'bg-white'}`}>
                                            <div className="flex items-start justify-between gap-4">
                                                <p className={`text-sm font-bold text-gray-800 leading-snug flex-1 ${r.isCompleted ? 'line-through text-gray-400' : ''}`}>
                                                    {r.details}
                                                </p>
                                                <StatusBadge r={r} mini />
                                            </div>

                                            <div className="flex items-center justify-between gap-2 border-t border-gray-50 pt-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                                        <CalendarIcon size={10} className="text-[var(--primary)]" />
                                                        {new Date(r.reminderDate).toLocaleDateString("en-GB", { day: '2-digit', month: '2-digit' })}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                                        <Clock size={10} />
                                                        {r.reminderTime}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <ActionButton onClick={() => toggleStatus(r)} variant={r.isCompleted ? "pending" : "done"} />
                                                    <ActionButton onClick={() => startEdit(r)} variant="edit" />
                                                    <ActionButton onClick={() => setDeleteId(r._id)} variant="delete" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>

            <DeleteModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Remove Reminder"
                description="Are you sure you want to delete this manual reminder? This action cannot be undone."
            />
        </div>
    );
}

// ── Sub-components ──

function StatusBadge({ r, mini }: { r: Reminder; mini?: boolean }) {
    const isDone = r.isCompleted;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider ${isDone ? 'text-green-500 bg-green-50' : 'text-amber-500 bg-amber-50'
            }`}>
            {isDone ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
            {!mini && (isDone ? "Completed" : "Pending")}
        </span>
    );
}

function ActionButton({ onClick, variant }: { onClick: () => void; variant: 'done' | 'pending' | 'edit' | 'delete' }) {
    const colors = {
        done: 'text-green-400 hover:bg-green-50',
        pending: 'text-amber-400 hover:bg-amber-50',
        edit: 'text-blue-400 hover:bg-blue-50',
        delete: 'text-red-400 hover:bg-red-50'
    };

    const icons = {
        done: <CheckCircle size={16} />,
        pending: <AlertCircle size={16} />,
        edit: <Edit2 size={16} />,
        delete: <Trash2 size={16} />
    };

    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${colors[variant]}`}
        >
            {icons[variant]}
        </button>
    );
}
