"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Users,
    Briefcase,
    HardHat,
    Truck,
    Search,
    SlidersHorizontal,
    Eye,
    Plus,
    CheckCircle2,
    XCircle,
    MoreHorizontal,
    X,
    Trash2,
} from "lucide-react";
import CustomDropdown from "@/components/CustomDropdown";
import DeleteModal from "@/components/DeleteModal";
import Loader from "@/components/Loader";

interface StaffMember {
    _id: string;
    firstName: string;
    lastName: string;
    mobile: string;
    designation: string;
    status: string;
    cnic: string;
    photo?: string;
}

const designationOptions = [
    { value: "All", label: "All Designations" },
    { value: "Operation Manager", label: "Operation Manager" },
    { value: "Transport Manager", label: "Transport Manager" },
    { value: "Warehouse Supervisor", label: "Warehouse Supervisor" },
    { value: "Labor", label: "Labor" },
    { value: "Driver", label: "Driver" },
    { value: "Admin", label: "Admin" },
];

const statusOptions = [
    { value: "All", label: "All Statuses" },
    { value: "On Duty", label: "On Duty" },
    { value: "Off Duty", label: "Off Duty" },
];

const avatarColors: Record<string, string> = {
    "Operation Manager": "#4F46E5",
    "Transport Manager": "#0891B2",
    "Warehouse Supervisor": "#D97706",
    Labor: "#B50104",
    Driver: "#059669",
    Admin: "#7C3AED",
};

const desBadgeStyle = (d: string) => {
    const map: Record<string, { bg: string; color: string }> = {
        Driver: { bg: "rgba(5,150,105,0.1)", color: "#059669" },
        "Operation Manager": { bg: "rgba(79,70,229,0.1)", color: "#4F46E5" },
        "Transport Manager": { bg: "rgba(8,145,178,0.1)", color: "#0891B2" },
        "Warehouse Supervisor": { bg: "rgba(217,119,6,0.1)", color: "#D97706" },
        Labor: { bg: "rgba(181,1,4,0.08)", color: "#B50104" },
        Admin: { bg: "rgba(124,58,237,0.1)", color: "#7C3AED" },
    };
    return map[d] || { bg: "rgba(181,1,4,0.08)", color: "#B50104" };
};

export default function StaffPage() {
    const router = useRouter();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [designation, setDesignation] = useState("All");
    const [status, setStatus] = useState("All");
    const [showFilters, setShowFilters] = useState(false);

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/staff");
            const data = await res.json();
            if (data.success) setStaff(data.data);
        } catch {
            console.error("Failed to fetch staff");
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDelete = (id: string) => {
        setDeleteId(id);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/staff/${deleteId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setStaff(prev => prev.filter(s => s._id !== deleteId));
                setDeleteId(null);
            } else {
                alert('Failed to delete staff member');
            }
        } catch (error) {
            console.error('Error deleting staff:', error);
            alert('Error deleting staff member');
        } finally {
            setIsDeleting(false);
        }
    };

    const filtered = staff.filter((s) => {
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        const matchSearch =
            fullName.includes(search.toLowerCase()) || s.cnic?.includes(search);
        const matchDes = designation === "All" || s.designation === designation;
        const matchStatus = status === "All" || s.status === status;
        return matchSearch && matchDes && matchStatus;
    });

    const statsCards = [
        { label: "Total Staff", value: staff.length, icon: Users, sub: "All members" },
        {
            label: "Office Staff",
            value: staff.filter((s) => s.designation === "Office Staff").length,
            icon: Briefcase,
            sub: "Active members",
        },
        {
            label: "Labor",
            value: staff.filter((s) => s.designation === "Labor").length,
            icon: HardHat,
            sub: "On ground",
        },
        {
            label: "Drivers",
            value: staff.filter((s) => s.designation === "Driver").length,
            icon: Truck,
            sub: "On route",
        },
    ];

    const activeFilters = designation !== "All" || status !== "All";

    return (
        <div className="space-y-5 max-w-7xl mx-auto">
            {/* ── Page Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3"
            >
                <div className="min-w-0">
                    <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight truncate">
                        Staff Management
                    </h1>
                    <p className="text-gray-400 text-xs md:text-sm mt-0.5">
                        {staff.length} members &bull;{" "}
                        {staff.filter((s) => s.status === "On Duty").length} on duty
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 8px 25px rgba(181,1,4,0.35)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => router.push("/dashboard/staff/add")}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg flex-shrink-0 cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #B50104, #8B0003)" }}
                >
                    <Plus size={15} />
                    <span className="hidden sm:inline">Add Staff</span>
                    <span className="sm:hidden">Add</span>
                </motion.button>
            </motion.div>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {statsCards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        whileHover={{ y: -3 }}
                        className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 relative overflow-hidden group cursor-pointer"
                        style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
                    >
                        <div
                            className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                            style={{ background: "linear-gradient(90deg, #B50104, #E8000A)" }}
                        />
                        <div className="flex items-start justify-between mt-1">
                            <div className="min-w-0">
                                <p className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
                                    {card.label}
                                </p>
                                <p className="text-2xl md:text-3xl font-black text-gray-900 mt-1 leading-none">
                                    {isLoading ? <Loader size="sm" /> : card.value}
                                </p>
                                <p className="text-[10px] md:text-xs text-gray-400 mt-1">{card.sub}</p>
                            </div>
                            <div
                                className="w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                                style={{ background: "rgba(181,1,4,0.08)" }}
                            >
                                <card.icon className="w-4 h-4 md:w-5 md:h-5" style={{ color: "#B50104" }} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── Table/Card Container ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
            >
                {/* Toolbar */}
                <div className="px-4 md:px-6 py-4 flex flex-wrap items-center gap-3 border-b border-gray-100">
                    {/* Search */}
                    <div className="relative flex-1 min-w-0" style={{ minWidth: "140px" }}>
                        <Search
                            size={15}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Search name or CNIC..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 outline-none transition-all"
                            style={{
                                borderColor: search ? "#B50104" : "",
                                boxShadow: search ? "0 0 0 3px rgba(181,1,4,0.08)" : "",
                            }}
                        />
                    </div>

                    {/* Filter toggle */}
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer flex-shrink-0"
                        style={{
                            background: showFilters ? "rgba(181,1,4,0.06)" : "#F9FAFB",
                            borderColor: showFilters ? "#B50104" : "#E5E7EB",
                            color: showFilters ? "#B50104" : "#6B7280",
                        }}
                    >
                        <SlidersHorizontal size={15} />
                        <span className="hidden sm:inline">Filters</span>
                        {activeFilters && (
                            <span className="w-2 h-2 rounded-full bg-[#B50104]" />
                        )}
                    </motion.button>

                    <div className="ml-auto text-sm text-gray-400 flex-shrink-0">
                        <span className="font-bold text-gray-700">{filtered.length}</span> results
                    </div>
                </div>

                {/* Filter Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="px-4 md:px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-wrap items-end gap-3">
                                <CustomDropdown
                                    label="Designation"
                                    options={designationOptions}
                                    value={designation}
                                    onChange={setDesignation}
                                    className="w-full sm:w-48"
                                />
                                <CustomDropdown
                                    label="Status"
                                    options={statusOptions}
                                    value={status}
                                    onChange={setStatus}
                                    className="w-full sm:w-44"
                                />
                                {activeFilters && (
                                    <button
                                        onClick={() => {
                                            setDesignation("All");
                                            setStatus("All");
                                        }}
                                        className="flex items-center gap-1 text-xs font-semibold text-[#B50104] hover:underline mb-1 cursor-pointer"
                                    >
                                        <X size={12} /> Clear all
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Desktop Table ── */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {["Staff Member", "Contact", "Designation", "Status", "Action"].map((h) => (
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
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader size="md" />
                                            <p className="text-gray-400 text-sm">Loading staff data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <EmptyState onAdd={() => router.push("/dashboard/staff/add")} />
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((s, i) => (
                                    <motion.tr
                                        key={s._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="border-b border-gray-50 hover:bg-[#FFF8F8] transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <StaffAvatar s={s} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-500 font-medium">{s.mobile}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <DesBadge designation={s.designation} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={s.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => router.push(`/dashboard/staff/${s._id}`)}
                                                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-bold cursor-pointer"
                                                    style={{
                                                        background: "linear-gradient(135deg, #B50104, #8B0003)",
                                                        boxShadow: "0 2px 8px rgba(181,1,4,0.3)",
                                                    }}
                                                >
                                                    <Eye size={13} />
                                                    View
                                                </motion.button>
                                                <button
                                                    onClick={() => confirmDelete(s._id)}
                                                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                                    title="Delete Staff"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Mobile Card List ── */}
                <div className="md:hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-3 py-16">
                            <Loader size="md" />
                            <p className="text-gray-400 text-sm">Loading staff data...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 flex justify-center">
                            <EmptyState onAdd={() => router.push("/dashboard/staff/add")} />
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filtered.map((s, i) => (
                                <motion.div
                                    key={s._id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="px-4 py-4 flex items-center gap-3"
                                >
                                    {/* Avatar */}
                                    {s.photo ? (
                                        <img
                                            src={s.photo}
                                            alt={s.firstName}
                                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                                            style={{ background: avatarColors[s.designation] || "#B50104" }}
                                        >
                                            {s.firstName[0]}
                                            {s.lastName[0]}
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">
                                            {s.firstName} {s.lastName}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate">{s.mobile}</p>
                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                            <DesBadge designation={s.designation} />
                                            <StatusBadge status={s.status} small />
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="flex items-center gap-2">
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => router.push(`/dashboard/staff/${s._id}`)}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-bold flex-shrink-0 cursor-pointer"
                                            style={{
                                                background: "linear-gradient(135deg, #B50104, #8B0003)",
                                                boxShadow: "0 2px 8px rgba(181,1,4,0.25)",
                                            }}
                                        >
                                            <Eye size={12} />
                                            View
                                        </motion.button>
                                        <button
                                            onClick={() => confirmDelete(s._id)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 md:px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                        Showing{" "}
                        <span className="font-bold text-gray-600">{filtered.length}</span> of{" "}
                        <span className="font-bold text-gray-600">{staff.length}</span> staff members
                    </p>
                </div>
            </motion.div>

            <DeleteModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                title="Remove Staff Member"
                description="Are you sure you want to remove this staff member? They will be permanently deleted from the system."
            />
        </div>
    );
}

// ── Sub-components ──

function StaffAvatar({ s }: { s: StaffMember }) {
    return (
        <div className="flex items-center gap-3">
            {s.photo ? (
                <img
                    src={s.photo}
                    alt={s.firstName}
                    className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                />
            ) : (
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                    style={{ background: avatarColors[s.designation] || "#B50104" }}
                >
                    {s.firstName[0]}
                    {s.lastName[0]}
                </div>
            )}
            <div>
                <p className="text-sm font-bold text-gray-800">
                    {s.firstName} {s.lastName}
                </p>
                <p className="text-xs text-gray-400">{s.cnic}</p>
            </div>
        </div>
    );
}

function DesBadge({ designation }: { designation: string }) {
    const style = desBadgeStyle(designation);
    return (
        <span
            className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
            style={{ background: style.bg, color: style.color }}
        >
            {designation}
        </span>
    );
}

function StatusBadge({ status, small }: { status: string; small?: boolean }) {
    const isOn = status === "On Duty";
    return (
        <div className="flex items-center gap-1.5">
            {isOn ? (
                <CheckCircle2 size={small ? 12 : 15} className="text-emerald-500" />
            ) : (
                <XCircle size={small ? 12 : 15} className="text-[#B50104]" />
            )}
            <span
                className={`font-semibold ${small ? "text-xs" : "text-sm"} ${isOn ? "text-emerald-600" : "text-[#B50104]"
                    }`}
            >
                {status}
            </span>
        </div>
    );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Users className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm font-medium">No staff members found</p>
            <button
                onClick={onAdd}
                className="text-xs font-bold text-[#B50104] hover:underline cursor-pointer"
            >
                + Add first staff member
            </button>
        </div>
    );
}
