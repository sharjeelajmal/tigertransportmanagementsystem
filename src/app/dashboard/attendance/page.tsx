"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CalendarDays,
    CheckCircle2,
    XCircle,
    Users,
    UserCheck,
    UserX,
    Save,
    RefreshCw,
} from "lucide-react";
import Loader from "@/components/Loader";
import CustomDatePicker from "@/components/CustomDatePicker";
import Pagination from "@/components/Pagination";

interface AttendanceRecord {
    staffId: string;
    firstName: string;
    lastName: string;
    designation: string;
    status: "Present" | "Absent";
}

const avatarColors: Record<string, string> = {
    "Office Staff": "#4F46E5",
    Driver: "#0891B2",
    Labor: "var(--primary)",
    Supervisor: "#D97706",
    Mechanic: "#059669",
    "Security Guard": "#7C3AED",
    Cleaner: "#DB2777",
    Accountant: "#0369A1",
};

const desBadge = (d: string) => {
    const map: Record<string, { bg: string; color: string }> = {
        Driver: { bg: "rgba(8,145,178,0.1)", color: "#0891B2" },
        "Office Staff": { bg: "rgba(79,70,229,0.1)", color: "#4F46E5" },
        Supervisor: { bg: "rgba(217,119,6,0.1)", color: "#D97706" },
        Mechanic: { bg: "rgba(5,150,105,0.1)", color: "#059669" },
        "Security Guard": { bg: "rgba(124,58,237,0.1)", color: "#7C3AED" },
        Cleaner: { bg: "rgba(219,39,119,0.1)", color: "#DB2777" },
        Accountant: { bg: "rgba(3,105,161,0.1)", color: "#0369A1" },
    };
    return map[d] || { bg: "rgba(var(--primary-rgb, 181,1,4),0.08)", color: "var(--primary)" };
};

const today = () => new Date().toISOString().split("T")[0];

interface Toast { type: "success" | "error"; message: string }

export default function AttendancePage() {
    const [date, setDate] = useState(today());
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);
    const [savedDate, setSavedDate] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const showToast = (t: Toast) => {
        setToast(t);
        setTimeout(() => setToast(null), 3500);
    };

    const fetchAttendance = useCallback(async (d: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/attendance?date=${d}`);
            const data = await res.json();
            if (data.success) {
                setRecords(data.data.records || []);
                setSavedDate(data.isNew ? null : d);
            }
        } catch {
            showToast({ type: "error", message: "Failed to load attendance data." });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setCurrentPage(1);
        fetchAttendance(date);
    }, [date, fetchAttendance]);

    const toggle = (staffId: string) => {
        setRecords((prev) =>
            prev.map((r) =>
                r.staffId === staffId
                    ? { ...r, status: r.status === "Present" ? "Absent" : "Present" }
                    : r
            )
        );
    };

    const markAll = (status: "Present" | "Absent") => {
        setRecords((prev) => prev.map((r) => ({ ...r, status })));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, records }),
            });
            const data = await res.json();
            if (data.success) {
                setSavedDate(date);
                showToast({ type: "success", message: `Attendance for ${date} saved successfully!` });
            } else {
                showToast({ type: "error", message: "Failed to save attendance." });
            }
        } catch {
            showToast({ type: "error", message: "Network error. Please try again." });
        } finally {
            setIsSaving(false);
        }
    };

    const presentCount = records.filter((r) => r.status === "Present").length;
    const absentCount = records.filter((r) => r.status === "Absent").length;
    const total = records.length;

    const totalPages = Math.ceil(records.length / itemsPerPage);
    const paginatedRecords = records.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-5 max-w-5xl mx-auto">
            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                        Staff Attendance
                    </h1>
                    <p className="text-gray-400 text-sm mt-0.5">
                        Mark and track daily attendance
                    </p>
                </div>

                {/* Date Picker */}
                <div className="w-56">
                    <CustomDatePicker
                        value={date}
                        onChange={(d: Date) => {
                            const yyyy = d.getFullYear();
                            const mm = String(d.getMonth() + 1).padStart(2, "0");
                            const dd = String(d.getDate()).padStart(2, "0");
                            setDate(`${yyyy}-${mm}-${dd}`);
                        }}
                    />
                </div>

            </motion.div>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
                {[
                    { label: "Total Staff", value: total, icon: Users, color: "#6366F1", bg: "rgba(99,102,241,0.08)" },
                    { label: "Present", value: presentCount, icon: UserCheck, color: "#059669", bg: "rgba(5,150,105,0.08)" },
                    { label: "Absent", value: absentCount, icon: UserX, color: "var(--primary)", bg: "rgba(var(--primary-rgb, 181,1,4),0.08)" },
                ].map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 relative overflow-hidden"
                        style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
                    >
                        <div
                            className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                            style={{ background: card.color }}
                        />
                        <div className="flex items-center justify-between mt-1">
                            <div>
                                <p className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    {card.label}
                                </p>
                                <motion.p
                                    key={card.value}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-2xl md:text-3xl font-black mt-1 leading-none"
                                    style={{ color: card.color }}
                                >
                                    {isLoading ? "--" : card.value}
                                </motion.p>
                            </div>
                            <div
                                className="w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center"
                                style={{ background: card.bg }}
                            >
                                <card.icon size={18} style={{ color: card.color }} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── Attendance Table Card ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
            >
                {/* Toolbar */}
                <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-700">
                            {date}
                        </span>
                        {savedDate === date && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"
                            >
                                <CheckCircle2 size={11} /> Saved
                            </motion.span>
                        )}
                    </div>

                    {/* Quick mark buttons */}
                    {!isLoading && records.length > 0 && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => markAll("Present")}
                                className="text-xs font-bold px-3 py-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                                All Present
                            </button>
                            <button
                                onClick={() => markAll("Absent")}
                                className="text-xs font-bold px-3 py-1.5 rounded-lg text-[var(--primary)] bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                            >
                                All Absent
                            </button>
                        </div>
                    )}
                </div>

                {/* Table — Desktop */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {["Sr.#", "Staff Member", "Designation", "Status"].map((h) => (
                                    <th
                                        key={h}
                                        className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [...Array(5)].map((_, idx) => (
                                    <tr key={`sk-${idx}`} className="animate-pulse border-b border-gray-50">
                                        <td className="px-6 py-4 w-16"><div className="h-4 bg-gray-100 rounded w-6"></div></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gray-100"></div>
                                                <div className="h-4 bg-gray-100 rounded w-28"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded-full w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-gray-100 rounded-xl w-20"></div></td>
                                    </tr>
                                ))
                            ) : paginatedRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users className="w-10 h-10 text-gray-200" />
                                            <p className="text-gray-400 text-sm font-medium">No staff found</p>
                                            <p className="text-gray-300 text-xs">Add staff members first</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedRecords.map((r, i) => (
                                    <motion.tr
                                        key={r.staffId}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.025 }}
                                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                    >
                                        {/* Sr */}
                                        <td className="px-6 py-4 w-16">
                                            <span className="text-xs font-bold text-gray-300">
                                                {String((currentPage - 1) * itemsPerPage + i + 1).padStart(2, "0")}
                                            </span>
                                        </td>

                                        {/* Name */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                                                    style={{ background: avatarColors[r.designation] || "var(--primary)" }}
                                                >
                                                    {r.firstName[0]}{r.lastName[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">
                                                        {r.firstName} {r.lastName}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Designation */}
                                        <td className="px-6 py-4">
                                            <span
                                                className="text-xs font-bold px-2.5 py-1 rounded-full"
                                                style={{
                                                    background: desBadge(r.designation).bg,
                                                    color: desBadge(r.designation).color,
                                                }}
                                            >
                                                {r.designation}
                                            </span>
                                        </td>

                                        {/* Status Toggle */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => toggle(r.staffId)}
                                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"
                                                    style={{
                                                        background: r.status === "Present" ? "rgba(5,150,105,0.1)" : "rgba(var(--primary-rgb, 181,1,4),0.08)",
                                                        color: r.status === "Present" ? "#059669" : "var(--primary)",
                                                        border: `1.5px solid ${r.status === "Present" ? "rgba(5,150,105,0.2)" : "rgba(var(--primary-rgb, 181,1,4),0.15)"}`,
                                                    }}
                                                >
                                                    <AnimatePresence mode="wait">
                                                        {r.status === "Present" ? (
                                                            <motion.span
                                                                key="present"
                                                                initial={{ scale: 0.5, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                exit={{ scale: 0.5, opacity: 0 }}
                                                                className="flex items-center gap-1.5"
                                                            >
                                                                <CheckCircle2 size={13} />
                                                                Present
                                                            </motion.span>
                                                        ) : (
                                                            <motion.span
                                                                key="absent"
                                                                initial={{ scale: 0.5, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                exit={{ scale: 0.5, opacity: 0 }}
                                                                className="flex items-center gap-1.5"
                                                            >
                                                                <XCircle size={13} />
                                                                Absent
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden">
                    {isLoading ? (
                        <div className="divide-y divide-gray-50">
                            {[...Array(5)].map((_, idx) => (
                                <div key={`sk-mob-${idx}`} className="px-4 py-3.5 flex items-center gap-3 animate-pulse">
                                    <div className="w-6 h-4 bg-gray-100 rounded flex-shrink-0"></div>
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-100 rounded w-24"></div>
                                        <div className="h-3 bg-gray-100 rounded-full w-16"></div>
                                    </div>
                                    <div className="h-8 bg-gray-100 rounded-xl w-14 flex-shrink-0"></div>
                                </div>
                            ))}
                        </div>
                    ) : records.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-16">
                            <Users className="w-10 h-10 text-gray-200" />
                            <p className="text-gray-400 text-sm font-medium">No staff found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {paginatedRecords.map((r, i) => (
                                <motion.div
                                    key={r.staffId}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="px-4 py-3.5 flex items-center gap-3"
                                >
                                    <span className="text-xs font-bold text-gray-300 w-6 flex-shrink-0">
                                        {String((currentPage - 1) * itemsPerPage + i + 1).padStart(2, "0")}
                                    </span>
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                                        style={{ background: avatarColors[r.designation] || "var(--primary)" }}
                                    >
                                        {r.firstName[0]}{r.lastName[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">
                                            {r.firstName} {r.lastName}
                                        </p>
                                        <span
                                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                            style={{
                                                background: desBadge(r.designation).bg,
                                                color: desBadge(r.designation).color,
                                            }}
                                        >
                                            {r.designation}
                                        </span>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => toggle(r.staffId)}
                                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0 cursor-pointer transition-all"
                                        style={{
                                            background: r.status === "Present" ? "rgba(5,150,105,0.1)" : "rgba(var(--primary-rgb, 181,1,4),0.08)",
                                            color: r.status === "Present" ? "#059669" : "var(--primary)",
                                            border: `1.5px solid ${r.status === "Present" ? "rgba(5,150,105,0.2)" : "rgba(var(--primary-rgb, 181,1,4),0.15)"}`,
                                        }}
                                    >
                                        {r.status === "Present" ? (
                                            <><CheckCircle2 size={12} /> P</>
                                        ) : (
                                            <><XCircle size={12} /> A</>
                                        )}
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                    <div className="border-t border-gray-100 bg-white">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}

                {/* Footer — Save Button */}
                {!isLoading && records.length > 0 && (
                    <div className="px-4 md:px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                        <p className="text-xs text-gray-400">
                            <span className="font-bold text-emerald-600">{presentCount} Present</span>
                            {" · "}
                            <span className="font-bold text-[var(--primary)]">{absentCount} Absent</span>
                            {" · "}
                            {total} Total
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.03, boxShadow: "0 8px 25px rgba(var(--primary-rgb, 181,1,4),0.35)" }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg disabled:opacity-60 cursor-pointer"
                            style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                        >
                            {isSaving ? (
                                <><Loader size="sm" className="mr-2" /> Saving...</>
                            ) : (
                                <><Save size={15} /> Save Attendance</>
                            )}
                        </motion.button>
                    </div>
                )}
            </motion.div>

            {/* ── Toast ── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        key="toast"
                        initial={{ opacity: 0, y: 20, x: 20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: 20, x: 20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl"
                        style={{
                            background: "#fff",
                            border: `1.5px solid ${toast.type === "success" ? "rgba(5,150,105,0.2)" : "rgba(var(--primary-rgb, 181,1,4),0.2)"}`,
                            boxShadow: toast.type === "success"
                                ? "0 8px 32px rgba(5,150,105,0.2)"
                                : "0 8px 32px rgba(var(--primary-rgb, 181,1,4),0.2)",
                        }}
                    >
                        {toast.type === "success" ? (
                            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                        ) : (
                            <XCircle size={18} style={{ color: "var(--primary)" }} className="flex-shrink-0" />
                        )}
                        <p className="text-sm font-semibold text-gray-800">{toast.message}</p>
                        <motion.div
                            className="absolute bottom-0 left-0 h-0.5 rounded-b-2xl"
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 3.5, ease: "linear" }}
                            style={{ background: toast.type === "success" ? "#059669" : "var(--primary)" }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
