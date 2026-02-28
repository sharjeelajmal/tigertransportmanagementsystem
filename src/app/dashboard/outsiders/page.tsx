"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    UserCircle2,
    Truck,
    HardHat,
    Search,
    SlidersHorizontal,
    Eye,
    Plus,
    X,
    Trash2,
} from "lucide-react";
import CustomDropdown from "@/components/CustomDropdown";
import DeleteModal from "@/components/DeleteModal";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";
import CustomMonthPicker from "@/components/CustomMonthPicker";
import { useAuth } from "@/context/AuthContext";

interface OutsiderMember {
    _id: string;
    outsiderName: string;
    category: string;
    contactNo: string;
    lastAllocation: string | null;
    lastAllocationDate: string | null;
    balanceStatus: string;
}

const categoryOptions = [
    { value: "All", label: "All Categories" },
    { value: "Vehicle Outsider", label: "Vehicle Outsider" },
    { value: "Labor Outsider", label: "Labor Outsider" },
    { value: "Both", label: "Both" },
];

const balanceOptions = [
    { value: "All", label: "All Balances" },
    { value: "Clear", label: "Clear" },
    { value: "Payable", label: "Payable" },
];

const avatarColors: Record<string, string> = {
    "Vehicle Outsider": "#0891B2",
    "Labor Outsider": "#D97706",
    "Both": "#7C3AED",
};

const badgeStyle = (cat: string) => {
    const map: Record<string, { bg: string; color: string }> = {
        "Vehicle Outsider": { bg: "rgba(8,145,178,0.1)", color: "#0891B2" },
        "Labor Outsider": { bg: "rgba(217,119,6,0.1)", color: "#D97706" },
        "Both": { bg: "rgba(124,58,237,0.1)", color: "#7C3AED" },
    };
    return map[cat] || { bg: "rgba(var(--primary-rgb, 181,1,4),0.08)", color: "var(--primary)" };
};

const formatDate = (d: string | null | undefined) => {
    if (!d) return '-';
    try {
        return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
        return '-';
    }
};

export default function OutsiderPage() {
    const router = useRouter();
    const { isManager } = useAuth();
    const [outsiders, setOutsiders] = useState<OutsiderMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [balance, setBalance] = useState("All");
    const [allocationMonth, setAllocationMonth] = useState("");
    const [showFilters, setShowFilters] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchOutsiders();
    }, []);

    const fetchOutsiders = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/outsiders");
            const data = await res.json();
            if (data.success) {
                setOutsiders(data.data);
            }
        } catch {
            console.error("Failed to fetch outsiders");
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDelete = (id: string) => setDeleteId(id);

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/outsiders/${deleteId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setOutsiders(prev => prev.filter(o => o._id !== deleteId));
                setDeleteId(null);
            } else {
                alert("Failed to delete outsider");
            }
        } catch (error) {
            console.error('Error deleting outsider:', error);
            alert('Error deleting outsider');
        } finally {
            setIsDeleting(false);
        }
    };

    const filtered = outsiders.filter((o) => {
        const matchSearch =
            o.outsiderName.toLowerCase().includes(search.toLowerCase()) || o.contactNo.includes(search);
        const matchCat = category === "All" || o.category === category;
        const matchBal = balance === "All" || o.balanceStatus === balance;

        let matchAlloc = true;
        if (allocationMonth && o.lastAllocation) {
            const d = new Date(o.lastAllocation);
            const checkMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            matchAlloc = checkMonth === allocationMonth;
        } else if (allocationMonth && !o.lastAllocation) {
            matchAlloc = false;
        }

        return matchSearch && matchCat && matchBal && matchAlloc;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [search, category, balance, allocationMonth]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedData = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const mostAllocated = outsiders.length > 0 ? outsiders[0].outsiderName : "None";

    const statsCards = [
        { label: "Total Outsiders", value: String(outsiders.length).padStart(2, '0'), icon: UserCircle2, sub: "All registered" },
        { label: "Vehicle Outsider", value: String(outsiders.filter(o => o.category === "Vehicle Outsider").length).padStart(2, '0'), icon: Truck, sub: "Transportation" },
        { label: "Labor Outsiders", value: String(outsiders.filter(o => o.category === "Labor Outsider").length).padStart(2, '0'), icon: HardHat, sub: "On ground" },
        { label: "Most Allocated Outsider", value: mostAllocated, icon: Eye, sub: "Top performer", isText: true },
    ];

    const activeFilters = category !== "All" || balance !== "All" || allocationMonth !== "";

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        const d = new Date(dateString);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

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
                        Outsider List
                    </h1>
                    <p className="text-gray-400 text-xs md:text-sm mt-0.5">
                        {outsiders.length} members &bull;{" "}
                        {outsiders.filter((s) => s.balanceStatus === "Clear").length} cleared
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 8px 25px rgba(var(--primary-rgb, 181,1,4),0.35)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => router.push("/dashboard/outsiders/add")}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg flex-shrink-0 cursor-pointer"
                    style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                >
                    <Plus size={15} />
                    <span className="hidden sm:inline">Add Outsider</span>
                    <span className="sm:hidden">Add</span>
                </motion.button>
            </motion.div>

            {/* ── Stats Cards (Redesigned to Staff Page matching) ── */}
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
                            style={{ background: "linear-gradient(90deg, var(--primary), var(--primary-light))" }}
                        />
                        <div className="flex items-start justify-between mt-1 h-full flex-col">
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate mb-1">
                                    {card.label}
                                </p>
                                {isLoading ? (
                                    <Loader size="sm" />
                                ) : (
                                    <p className={`${card.isText ? 'text-lg md:text-xl' : 'text-2xl md:text-3xl'} font-black text-gray-900 leading-tight`}>
                                        {card.value}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div
                            className="absolute bottom-4 right-4 w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                            style={{ background: "rgba(var(--primary-rgb, 181,1,4),0.08)" }}
                        >
                            <card.icon className="w-4 h-4 md:w-5 md:h-5" style={{ color: "var(--primary)" }} />
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
                            placeholder="Search name or contact..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 outline-none transition-all"
                            style={{
                                borderColor: search ? "var(--primary)" : "",
                                boxShadow: search ? "0 0 0 3px rgba(var(--primary-rgb, 181,1,4),0.08)" : "",
                            }}
                        />
                    </div>

                    {/* Filter toggle */}
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer flex-shrink-0"
                        style={{
                            background: showFilters ? "rgba(var(--primary-rgb, 181,1,4),0.06)" : "#F9FAFB",
                            borderColor: showFilters ? "var(--primary)" : "#E5E7EB",
                            color: showFilters ? "var(--primary)" : "#6B7280",
                        }}
                    >
                        <SlidersHorizontal size={15} />
                        <span className="hidden sm:inline">Filters</span>
                        {activeFilters && (
                            <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
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
                            <div className="px-4 md:px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-wrap items-end gap-3 rounded-b-2xl md:rounded-b-none">
                                <CustomDropdown
                                    label="Category"
                                    options={categoryOptions}
                                    value={category}
                                    onChange={setCategory}
                                    className="w-full sm:w-48"
                                />
                                <div className="w-full sm:w-48">
                                    <CustomMonthPicker
                                        value={allocationMonth}
                                        onChange={setAllocationMonth}
                                        label="Allocation Month"
                                    />
                                </div>
                                <CustomDropdown
                                    label="Balance"
                                    options={balanceOptions}
                                    value={balance}
                                    onChange={setBalance}
                                    className="w-full sm:w-44"
                                />
                                {activeFilters && (
                                    <button
                                        onClick={() => {
                                            setCategory("All");
                                            setBalance("All");
                                            setAllocationMonth("");
                                        }}
                                        className="flex items-center gap-1 text-xs font-semibold hover:underline mb-3 ml-2 cursor-pointer"
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
                                {["Sr. #", "Outsider Name", "Category", "Contact No.", "Last Allocation", "Balance", "Action"].map((h) => (
                                    <th
                                        key={h}
                                        className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap"
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
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-8"></div></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gray-100"></div>
                                                <div className="h-4 bg-gray-100 rounded w-24"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded-full w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 bg-gray-100 rounded-lg w-20"></div>
                                                <div className="h-7 bg-gray-100 rounded-lg w-16"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <EmptyState onAdd={() => { }} />
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((o, i) => (
                                    <motion.tr
                                        key={o._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="border-b border-gray-50 hover:bg-[#FFF8F8] transition-colors group"
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-400 font-medium">
                                            {String((currentPage - 1) * itemsPerPage + i + 1).padStart(2, '0')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                                                    style={{ background: avatarColors[o.category] || "var(--primary)" }}
                                                >
                                                    {o.outsiderName.charAt(0)}
                                                </div>
                                                <p className="text-sm font-bold text-gray-800 whitespace-nowrap">
                                                    {o.outsiderName}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <CatBadge category={o.category} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-500 font-medium whitespace-nowrap">{o.contactNo}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                            {formatDate(o.lastAllocationDate || o.lastAllocation)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-bold ${o.balanceStatus === "Clear" ? "text-emerald-600" : "text-[var(--primary)]"}`}>
                                                {o.balanceStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 min-w-max">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => router.push(`/dashboard/outsiders/allocations/add?outsiderId=${o._id}&category=${encodeURIComponent(o.category)}`)}
                                                    className="px-3.5 py-1.5 rounded-lg text-white text-xs font-bold cursor-pointer bg-[var(--primary)] shadow-md min-w-[70px]"
                                                >
                                                    Allocate
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => router.push(`/dashboard/outsiders/${o._id}`)}
                                                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-bold cursor-pointer bg-[var(--primary)] shadow-md min-w-[60px]"
                                                >
                                                    <Eye size={13} />
                                                    View
                                                </motion.button>
                                                {!isManager && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => confirmDelete(o._id)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                                                        title="Delete Outsider"
                                                    >
                                                        <Trash2 size={16} />
                                                    </motion.button>
                                                )}
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
                        <div className="divide-y divide-gray-50">
                            {[...Array(5)].map((_, idx) => (
                                <div key={`sk-mob-${idx}`} className="px-4 py-4 flex flex-col gap-3 animate-pulse">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0"></div>
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="h-4 bg-gray-100 rounded w-32"></div>
                                            <div className="h-3 bg-gray-100 rounded w-24"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className="h-9 bg-gray-100 rounded-lg w-full"></div>
                                        <div className="h-9 bg-gray-100 rounded-lg w-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : paginatedData.length === 0 ? (
                        <div className="py-16 flex justify-center">
                            <EmptyState onAdd={() => { }} />
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {paginatedData.map((o, i) => (
                                <motion.div
                                    key={o._id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="px-4 py-4 flex flex-col gap-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                                            style={{ background: avatarColors[o.category] || "var(--primary)" }}
                                        >
                                            {o.outsiderName.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate">
                                                {o.outsiderName}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate">{o.contactNo} &bull; {formatDate(o.lastAllocation)}</p>
                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                <CatBadge category={o.category} />
                                                <span className={`text-xs font-bold ${o.balanceStatus === "Clear" ? "text-emerald-600" : "text-[var(--primary)]"}`}>
                                                    {o.balanceStatus}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="flex items-center gap-2 mt-2 w-full">
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => router.push(`/dashboard/outsiders/allocations/add?outsiderId=${o._id}&category=${encodeURIComponent(o.category)}`)}
                                            className="flex-1 py-2 rounded-lg text-white text-xs font-bold flex-shrink-0 cursor-pointer bg-[var(--primary)] shadow-md flex items-center justify-center gap-1.5"
                                        >
                                            Allocate
                                        </motion.button>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => router.push(`/dashboard/outsiders/${o._id}`)}
                                            className="flex-1 px-3 py-2 rounded-lg text-white text-xs font-bold flex-shrink-0 cursor-pointer bg-[var(--primary)] shadow-md flex items-center justify-center gap-1.5"
                                        >
                                            <Eye size={13} />
                                            View
                                        </motion.button>
                                        {!isManager && (
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => confirmDelete(o._id)}
                                                className="w-10 h-10 rounded-lg border-2 border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </motion.button>
                                        )}
                                    </div>
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

                {/* Footer */}
                <div className="px-4 md:px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                        Showing{" "}
                        <span className="font-bold text-gray-600">
                            {paginatedData.length}
                        </span>{" "}
                        of <span className="font-bold text-gray-600">{filtered.length}</span> results
                    </p>
                </div>
            </motion.div>

            <DeleteModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                title="Remove Outsider"
                description="Are you sure you want to remove this outsider? They will be permanently deleted from the system."
            />
        </div>
    );
}

// ── Sub-components ──

function CatBadge({ category }: { category: string }) {
    const style = badgeStyle(category);
    return (
        <span
            className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
            style={{ background: style.bg, color: style.color }}
        >
            {category}
        </span>
    );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <UserCircle2 className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm font-medium">No outsiders found</p>
            <button
                onClick={onAdd}
                className="text-xs font-bold hover:underline cursor-pointer"
            >
                + Add first outsider
            </button>
        </div>
    );
}
