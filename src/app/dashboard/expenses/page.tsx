"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Receipt, TrendingUp, Building2, Truck,
    Search, SlidersHorizontal, Plus, X, Eye, Trash2, FileSpreadsheet,
} from "lucide-react";
import CustomDropdown from "@/components/CustomDropdown";
import CustomDatePicker from "@/components/CustomDatePicker";
import Loader from "@/components/Loader";
import DeleteModal from "@/components/DeleteModal";
import Pagination from "@/components/Pagination";
import ExpenseLedgerModal from "@/components/expenses/ExpenseLedgerModal";
import { useAuth } from "@/context/AuthContext";

interface Expense {
    _id: string;
    date: string;
    category: string;
    vehicleNo?: string;
    expenseType: string;
    totalAmount: number;
    status: "Paid" | "Unpaid" | "Partial Paid";
}

const categoryPalette = [
    { bg: "rgba(8,145,178,0.1)", color: "#0891B2" },
    { bg: "rgba(79,70,229,0.1)", color: "#4F46E5" },
    { bg: "rgba(16,185,129,0.1)", color: "#10B981" },
    { bg: "rgba(245,158,11,0.1)", color: "#D97706" },
    { bg: "rgba(236,72,153,0.1)", color: "#DB2777" },
    { bg: "rgba(139,92,246,0.1)", color: "#7C3AED" },
];

function getCatStyle(name: string) {
    if (name === "Vehicle Expense") return categoryPalette[0];
    if (name === "Office Expense") return categoryPalette[1];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const idx = Math.abs(hash) % categoryPalette.length;
    return categoryPalette[idx];
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { bg: string; color: string }> = {
        Paid: { bg: "rgba(5,150,105,0.1)", color: "#059669" },
        Unpaid: { bg: "rgba(var(--primary-rgb, 181,1,4),0.08)", color: "var(--primary)" },
        "Partial Paid": { bg: "rgba(234,179,8,0.1)", color: "#B45309" },
    };
    const s = map[status] || map["Unpaid"];
    return (
        <span className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: s.bg, color: s.color }}>
            {status}
        </span>
    );
}

function CatBadge({ category }: { category: string }) {
    const style = getCatStyle(category);
    return (
        <span className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: style.bg, color: style.color }}>
            {category}
        </span>
    );
}

function toDateStr(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function formatDate(d: string) {
    if (!d) return "—";
    const parts = d.split("-");
    if (parts.length !== 3) return d;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export default function ExpensesPage() {
    const router = useRouter();
    const { isManager } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categoriesList, setCategoriesList] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [specificDate, setSpecificDate] = useState("");

    const [showFilters, setShowFilters] = useState(false);
    const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => { fetchExpenses(); }, []);

    const fetchExpenses = async () => {
        setIsLoading(true);
        try {
            const [resExp, resCat] = await Promise.all([
                fetch(`/api/expenses`),
                fetch(`/api/expenses/categories`),
            ]);
            const dataExp = await resExp.json();
            const dataCat = await resCat.json();
            if (dataExp.success) setExpenses(dataExp.data);
            if (dataCat.success && Array.isArray(dataCat.data)) {
                setCategoriesList(dataCat.data.map((c: any) => c.name));
            }
        } catch { console.error("Failed to fetch expenses or categories"); }
        finally { setIsLoading(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/expenses/${deleteId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setExpenses(prev => prev.filter(e => e._id !== deleteId));
                setDeleteId(null);
            } else alert(data.error || "Delete failed");
        } catch { alert("Network error"); }
        finally { setIsDeleting(false); }
    };

    const allCategories = Array.from(new Set([
        ...categoriesList,
        ...expenses.map(e => e.category).filter(Boolean)
    ]));

    const categoryOptions = [
        { value: "All", label: "All Categories" },
        ...allCategories.map(c => ({ value: c, label: c }))
    ];

    const filtered = expenses.filter((e) => {
        const matchSearch = e.expenseType.toLowerCase().includes(search.toLowerCase()) || (e.vehicleNo || "").toLowerCase().includes(search.toLowerCase());
        const matchCat = category === "All" || e.category === category;

        let matchDate = true;
        if (specificDate) {
            matchDate = e.date === specificDate;
        } else if (startDate && endDate) {
            matchDate = e.date >= startDate && e.date <= endDate;
        } else if (startDate) {
            matchDate = e.date >= startDate;
        } else if (endDate) {
            matchDate = e.date <= endDate;
        }

        return matchSearch && matchCat && matchDate;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [search, category, startDate, endDate, specificDate]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedData = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalExpense = filtered.reduce((s, e) => s + e.totalAmount, 0);
    const officeExpense = filtered.filter(e => e.category === "Office Expense").reduce((s, e) => s + e.totalAmount, 0);
    const vehicleExpense = filtered.filter(e => e.category === "Vehicle Expense").reduce((s, e) => s + e.totalAmount, 0);

    const categoryTotals: Record<string, number> = {};
    for (const e of filtered) {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.totalAmount;
    }
    let highestCat = "None";
    let maxCatVal = 0;
    for (const [c, val] of Object.entries(categoryTotals)) {
        if (val > maxCatVal) {
            maxCatVal = val;
            highestCat = c;
        }
    }

    const statsCards = [
        { label: "Total Expense", value: `${totalExpense.toLocaleString()}/-`, icon: Receipt },
        { label: "Office Expenses", value: `${officeExpense.toLocaleString()}/-`, icon: Building2 },
        { label: "Vehicle Expense", value: `${vehicleExpense.toLocaleString()}/-`, icon: Truck },
        { label: "Highest Category", value: highestCat, icon: TrendingUp },
    ];

    const activeFilters = category !== "All" || Boolean(startDate) || Boolean(endDate) || Boolean(specificDate);

    return (
        <div className="space-y-5 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                <div className="min-w-0">
                    <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight truncate">Expenses</h1>
                    <p className="text-gray-400 text-xs md:text-sm mt-0.5">{expenses.length} records &bull; Track all company expenses</p>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setIsLedgerModalOpen(true)}
                        className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-700 text-xs sm:text-sm font-bold shadow-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all cursor-pointer"
                    >
                        <FileSpreadsheet size={15} />
                        <span>Ledger Sheet</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.03, boxShadow: "0 8px 25px rgba(var(--primary-rgb, 181,1,4),0.35)" }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => router.push("/dashboard/expenses/add")}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg cursor-pointer"
                        style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                    >
                        <Plus size={15} />
                        <span className="hidden sm:inline">Add Expense</span>
                        <span className="sm:hidden">Add</span>
                    </motion.button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {statsCards.map((card, i) => (
                    <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -3 }} className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 relative overflow-hidden group cursor-pointer" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: "linear-gradient(90deg, var(--primary), var(--primary-light))" }} />
                        <div className="flex items-start justify-between mt-1">
                            <div className="min-w-0">
                                <p className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">{card.label}</p>
                                <p className="text-xl md:text-2xl font-black text-gray-900 mt-1 leading-none break-all">{isLoading ? <Loader size="sm" /> : card.value}</p>
                            </div>
                            <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110" style={{ background: "rgba(var(--primary-rgb, 181,1,4),0.08)" }}>
                                <card.icon className="w-4 h-4 md:w-5 md:h-5" style={{ color: "var(--primary)" }} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Table Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-2xl border border-gray-100 relative" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
                {/* Toolbar */}
                <div className="px-4 md:px-6 py-4 flex flex-wrap items-center gap-3 border-b border-gray-100 relative z-20">
                    <div className="relative flex-1 min-w-0" style={{ minWidth: "140px" }}>
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search expense or vehicle..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 outline-none transition-all" style={{ borderColor: search ? "var(--primary)" : "", boxShadow: search ? "0 0 0 3px rgba(var(--primary-rgb, 181,1,4),0.08)" : "" }} />
                    </div>
                    <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer flex-shrink-0" style={{ background: showFilters ? "rgba(var(--primary-rgb, 181,1,4),0.06)" : "#F9FAFB", borderColor: showFilters ? "var(--primary)" : "#E5E7EB", color: showFilters ? "var(--primary)" : "#6B7280" }}>
                        <SlidersHorizontal size={15} />
                        <span className="hidden sm:inline">Filters</span>
                        {activeFilters && <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
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
                            className="relative z-30"
                        >
                            <div className="px-4 md:px-6 py-4 bg-gray-50 border-b border-gray-100 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                                    <CustomDropdown
                                        label="Category"
                                        options={categoryOptions}
                                        value={category}
                                        onChange={setCategory}
                                        className="w-full"
                                    />
                                    <div className="w-full">
                                        <CustomDatePicker
                                            label="From Date"
                                            value={startDate}
                                            onChange={(d) => {
                                                setStartDate(toDateStr(d));
                                                setSpecificDate("");
                                            }}
                                            align="left"
                                        />
                                    </div>
                                    <div className="w-full">
                                        <CustomDatePicker
                                            label="To Date"
                                            value={endDate}
                                            onChange={(d) => {
                                                setEndDate(toDateStr(d));
                                                setSpecificDate("");
                                            }}
                                            align="right"
                                        />
                                    </div>
                                    <div className="w-full">
                                        <CustomDatePicker
                                            label="Specific Date"
                                            value={specificDate}
                                            onChange={(d) => {
                                                setSpecificDate(toDateStr(d));
                                                setStartDate("");
                                                setEndDate("");
                                            }}
                                            align="right"
                                        />
                                    </div>
                                </div>

                                {activeFilters && (
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-200/70">
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                            <span className="font-semibold text-gray-600">Active Filters:</span>
                                            {category !== "All" && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium text-xs">
                                                    Category: <strong className="text-gray-900">{category}</strong>
                                                    <button type="button" onClick={() => setCategory("All")} className="text-gray-400 hover:text-red-500 cursor-pointer">
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            )}
                                            {(startDate || endDate) && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium text-xs">
                                                    Range: <strong className="text-gray-900">{startDate ? formatDate(startDate) : "Start"} &rarr; {endDate ? formatDate(endDate) : "End"}</strong>
                                                    <button type="button" onClick={() => { setStartDate(""); setEndDate(""); }} className="text-gray-400 hover:text-red-500 cursor-pointer">
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            )}
                                            {specificDate && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium text-xs">
                                                    Date: <strong className="text-gray-900">{formatDate(specificDate)}</strong>
                                                    <button type="button" onClick={() => setSpecificDate("")} className="text-gray-400 hover:text-red-500 cursor-pointer">
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 ml-auto">
                                            <button
                                                type="button"
                                                onClick={() => setIsLedgerModalOpen(true)}
                                                className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-[var(--primary)] transition-colors cursor-pointer"
                                            >
                                                <FileSpreadsheet size={13} className="text-[var(--primary)]" />
                                                Sheet for these dates
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCategory("All");
                                                    setStartDate("");
                                                    setEndDate("");
                                                    setSpecificDate("");
                                                }}
                                                className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-red-500 hover:underline cursor-pointer"
                                            >
                                                <X size={13} /> Clear filters
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto relative z-10">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {["Sr.#", "Date", "Category", "Vehicle No.", "Expense", "Total Amount", "Status", "Actions"].map((h) => (
                                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={8} className="px-6 py-16 text-center"><div className="flex flex-col items-center gap-3"><Loader size="md" /><p className="text-gray-400 text-sm">Loading expenses...</p></div></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={8} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center"><Receipt className="w-7 h-7 text-gray-300" /></div>
                                        <p className="text-gray-400 text-sm font-medium">No expenses found</p>
                                        <button onClick={() => router.push("/dashboard/expenses/add")} className="text-xs font-bold hover:underline cursor-pointer">+ Add first expense</button>
                                    </div>
                                </td></tr>
                            ) : (
                                paginatedData.map((e, i) => (
                                    <motion.tr key={e._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-gray-50 hover:bg-[#FFF8F8] transition-colors">
                                        <td className="px-5 py-4 w-14"><span className="text-xs font-bold text-gray-300">{String((currentPage - 1) * itemsPerPage + i + 1).padStart(2, "0")}</span></td>
                                        <td className="px-5 py-4"><span className="text-sm font-medium text-gray-600 whitespace-nowrap">{formatDate(e.date)}</span></td>
                                        <td className="px-5 py-4"><CatBadge category={e.category} /></td>
                                        <td className="px-5 py-4"><span className="text-sm font-medium text-gray-600">{e.vehicleNo || "—"}</span></td>
                                        <td className="px-5 py-4"><span className="text-sm font-semibold text-gray-800">{e.expenseType}</span></td>
                                        <td className="px-5 py-4"><span className="text-sm font-bold text-gray-900 whitespace-nowrap">{e.totalAmount.toLocaleString()}/-</span></td>
                                        <td className="px-5 py-4"><StatusBadge status={e.status} /></td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => router.push(`/dashboard/expenses/${e._id}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold cursor-pointer" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", boxShadow: "0 2px 8px rgba(var(--primary-rgb, 181,1,4),0.3)" }}>
                                                    <Eye size={12} /> View
                                                </motion.button>
                                                {!isManager && (
                                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setDeleteId(e._id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border-2 border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-500 transition-colors">
                                                        <Trash2 size={12} />
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

                {/* Mobile Cards */}
                <div className="md:hidden relative z-10">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-3 py-16"><Loader size="md" /><p className="text-gray-400 text-sm">Loading...</p></div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-16">
                            <Receipt className="w-10 h-10 text-gray-200" />
                            <p className="text-gray-400 text-sm font-medium">No expenses found</p>
                            <button onClick={() => router.push("/dashboard/expenses/add")} className="text-xs font-bold hover:underline cursor-pointer">+ Add first expense</button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {paginatedData.map((e, i) => (
                                <motion.div key={e._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="px-4 py-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: getCatStyle(e.category).bg }}>
                                        {e.category === "Vehicle Expense" ? (
                                            <Truck size={16} style={{ color: getCatStyle(e.category).color }} />
                                        ) : e.category === "Office Expense" ? (
                                            <Building2 size={16} style={{ color: getCatStyle(e.category).color }} />
                                        ) : (
                                            <Receipt size={16} style={{ color: getCatStyle(e.category).color }} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">{e.expenseType}</p>
                                        <p className="text-xs text-gray-400 truncate">{formatDate(e.date)}{e.vehicleNo ? ` · ${e.vehicleNo}` : ""}</p>
                                        <div className="flex items-center gap-2 mt-1"><StatusBadge status={e.status} /></div>
                                    </div>
                                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                                        <p className="text-sm font-black text-gray-900">{e.totalAmount.toLocaleString()}/-</p>
                                        <div className="flex items-center gap-1.5">
                                            <button onClick={() => router.push(`/dashboard/expenses/${e._id}`)} className="text-xs font-bold cursor-pointer px-2 py-1 rounded-lg text-white" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}>View</button>
                                            {!isManager && (
                                                <button onClick={() => setDeleteId(e._id)} className="w-7 h-7 rounded-lg border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 cursor-pointer transition-colors">
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
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
                <div className="px-4 md:px-6 py-3.5 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                        Showing <span className="font-bold text-gray-600">{paginatedData.length}</span> of{" "}
                        <span className="font-bold text-gray-600">{filtered.length}</span> results
                    </p>
                </div>
            </motion.div>

            {/* Delete Modal */}
            <DeleteModal
                isOpen={!!deleteId}
                title="Delete Expense"
                description="Is expense ko permanently delete karna chahte hain? Yeh action undo nahi ho sakta."
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
            />

            {/* Expense Ledger Modal */}
            <ExpenseLedgerModal
                isOpen={isLedgerModalOpen}
                onClose={() => setIsLedgerModalOpen(false)}
                initialStartDate={startDate}
                initialEndDate={endDate}
                initialSpecificDate={specificDate}
                initialCategory={category}
            />
        </div>
    );
}
