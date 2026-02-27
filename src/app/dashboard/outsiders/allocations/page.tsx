"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard, Search, Plus, SlidersHorizontal, Eye,
    Trash2, Truck, HardHat, Database,
} from "lucide-react";
import DeleteModal from "@/components/DeleteModal";
import Loader from "@/components/Loader";
import CustomDropdown from "@/components/CustomDropdown";
import CustomMonthPicker from "@/components/CustomMonthPicker";
import Pagination from "@/components/Pagination";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Allocation {
    _id: string;
    outsider: { _id: string; outsiderName: string; category: string; };
    customerName: string;
    allocationDate: string;
    vehicleQty: number;
    laborQty: number;
    totalAmount: number;
    paidAmount: number;
    paymentStatus: string;
}

const statusOptions = [
    { value: "All", label: "All Status" },
    { value: "Paid", label: "Paid" },
    { value: "Unpaid", label: "Unpaid" },
    { value: "Partial Paid", label: "Partial Paid" },
];

const categoryOptions = [
    { value: "All", label: "All Categories" },
    { value: "Vehicle Outsider", label: "Vehicle" },
    { value: "Labor Outsider", label: "Labor" },
];

const statusColor = (s: string) => {
    if (s === 'Paid') return 'text-green-500 bg-green-50';
    if (s === 'Partial Paid') return 'text-sky-500 bg-sky-50';
    return 'text-red-500 bg-red-50';
};

export default function OutsiderAllocationPage() {
    const router = useRouter();
    const { isManager } = useAuth();

    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [stats, setStats] = useState({
        totalAllocations: 0, vehicleAllocations: 0,
        laborAllocations: 0, unpaidAllocations: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [search, setSearch] = useState("");
    const [monthFilter, setMonthFilter] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    const [statusFilter, setStatusFilter] = useState("All");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [showFilters, setShowFilters] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => { fetchAllocations(); }, [monthFilter]);

    const fetchAllocations = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/outsiders/allocations?month=${monthFilter}`);
            const data = await res.json();
            if (data.success) {
                setAllocations(data.data);
                if (data.stats) setStats(data.stats);
            }
        } catch (error) { console.error(error); }
        finally { setIsLoading(false); }
    };

    const filtered = allocations.filter(a => {
        const matchSearch = (a.outsider?.outsiderName || "").toLowerCase().includes(search.toLowerCase()) ||
            a.customerName.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "All" || a.paymentStatus === statusFilter;
        const matchCategory = categoryFilter === "All" || a.outsider?.category === categoryFilter;
        return matchSearch && matchStatus && matchCategory;
    });

    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/outsiders/allocations/${deleteId}`, { method: 'DELETE' });
            if (res.ok) { setDeleteId(null); fetchAllocations(); }
            else { alert('Failed to delete allocation'); }
        } catch (error) { console.error(error); alert('Error deleting allocation'); }
        finally { setIsDeleting(false); }
    };

    const statsCards = [
        { label: "Total Allocations", value: String(stats.totalAllocations).padStart(2, '0'), icon: LayoutDashboard, sub: "All time" },
        { label: "Total Vehicles", value: String(stats.vehicleAllocations).padStart(2, '0'), icon: Truck, sub: "Vehicles allocated" },
        { label: "Total Laborers", value: String(stats.laborAllocations).padStart(2, '0'), icon: HardHat, sub: "Laborers allocated" },
        { label: "Unpaid", value: String(stats.unpaidAllocations).padStart(2, '0'), icon: Database, sub: "Pending payments" },
    ];

    return (
        <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Outsider Allocations</h1>
                    <p className="text-xs md:text-sm text-gray-400 font-medium">Manage and track outsider job allocations</p>
                </div>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => router.push('/dashboard/outsiders/allocations/add')}
                    className="flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-2xl text-white text-sm font-black shadow-lg cursor-pointer w-full sm:w-auto justify-center"
                    style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}>
                    <Plus size={18} /><span>Add Allocation</span>
                </motion.button>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {statsCards.map((card, i) => (
                    <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -3 }}
                        className="bg-white rounded-2xl p-3 md:p-5 border border-gray-100 relative overflow-hidden group cursor-pointer" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: "linear-gradient(90deg, var(--primary), var(--primary-light))" }} />
                        <div className="flex items-start justify-between mt-1">
                            <div className="min-w-0">
                                <p className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">{card.label}</p>
                                <p className="text-xl md:text-3xl font-black text-gray-900 mt-1 leading-none">{isLoading ? <Loader size="sm" /> : card.value}</p>
                                <p className="text-[10px] md:text-xs text-gray-400 mt-1">{card.sub}</p>
                            </div>
                            <div className="w-8 h-8 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                                style={{ background: "rgba(var(--primary-rgb, 181,1,4),0.08)" }}>
                                <card.icon className="w-4 h-4 md:w-5 md:h-5" style={{ color: "var(--primary)" }} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Table Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50">

                {/* Filters */}
                <div className="px-4 md:px-6 py-4 md:py-6 border-b border-gray-50 space-y-3 relative z-30">
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${showFilters ? "bg-[var(--primary)] text-white shadow-lg shadow-red-100" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}>
                                <SlidersHorizontal size={14} /> Filters
                            </button>
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{filtered.length} found</span>
                        </div>
                        <div className="relative w-full sm:w-56 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Search Name..." value={search} onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 md:py-2.5 bg-gray-50 border-2 border-transparent focus:border-[var(--primary)] focus:bg-white rounded-xl text-sm outline-none transition-all placeholder:text-gray-400 font-bold text-gray-800" />
                        </div>
                    </div>
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col sm:flex-row gap-3">
                                <div className="w-full sm:w-44"><CustomMonthPicker value={monthFilter} onChange={setMonthFilter} /></div>
                                <div className="w-full sm:w-40"><CustomDropdown options={categoryOptions} value={categoryFilter} onChange={setCategoryFilter} placeholder="Category" /></div>
                                <div className="w-full sm:w-40"><CustomDropdown options={statusOptions} value={statusFilter} onChange={setStatusFilter} placeholder="Status" /></div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto min-h-[400px]">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="bg-white border-b border-gray-200">
                                {["Sr.#", "Outsider", "Category", "Customer", "Date", "Qty.", "Status", ""].map(h => (
                                    <th key={h} className="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-900 capitalize whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse"><td colSpan={8} className="px-6 py-5"><div className="h-4 bg-gray-50 rounded-lg w-full" /></td></tr>
                                ))
                            ) : paginated.length === 0 ? (
                                <tr><td colSpan={8} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-30"><LayoutDashboard size={48} /><p className="font-black text-xs uppercase tracking-widest">No records found</p></div>
                                </td></tr>
                            ) : (
                                paginated.map((a, i) => (
                                    <motion.tr key={a._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-[#FFF8F8] group transition-all">
                                        <td className="px-4 lg:px-6 py-4"><span className="text-xs font-medium text-gray-400">{String((currentPage - 1) * itemsPerPage + i + 1).padStart(2, '0')}</span></td>
                                        <td className="px-4 lg:px-6 py-4"><span className="text-sm font-semibold text-gray-700">{a.outsider?.outsiderName || '-'}</span></td>
                                        <td className="px-4 lg:px-6 py-4"><span className="text-sm font-medium text-gray-400">{a.outsider?.category === 'Vehicle Outsider' ? 'Vehicle' : a.outsider?.category === 'Labor Outsider' ? 'Labor' : a.outsider?.category || '-'}</span></td>
                                        <td className="px-4 lg:px-6 py-4"><span className="text-sm font-medium text-gray-400">{a.customerName || '-'}</span></td>
                                        <td className="px-4 lg:px-6 py-4"><span className="text-sm font-medium text-gray-400">{new Date(a.allocationDate).toLocaleDateString('en-GB')}</span></td>
                                        <td className="px-4 lg:px-6 py-4"><span className="text-sm font-medium text-gray-400">V-{String(a.vehicleQty || 0).padStart(2, '0')}, L-{String(a.laborQty || 0).padStart(2, '0')}</span></td>
                                        <td className="px-4 lg:px-6 py-4"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor(a.paymentStatus)}`}>{a.paymentStatus}</span></td>
                                        <td className="px-4 lg:px-6 py-4 text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => router.push(`/dashboard/outsiders/allocations/${a._id}`)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold cursor-pointer"
                                                    style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", boxShadow: "0 2px 8px rgba(var(--primary-rgb,181,1,4),0.3)" }}>
                                                    <Eye size={13} /> View
                                                </motion.button>
                                                {!isManager && (
                                                    <button onClick={() => setDeleteId(a._id)} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"><Trash2 size={15} /></button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-3 space-y-3 min-h-[300px]">
                    {isLoading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-gray-50 rounded-2xl p-4 space-y-3">
                                <div className="h-4 bg-gray-100 rounded w-2/3" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        ))
                    ) : paginated.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 opacity-30 py-16">
                            <LayoutDashboard size={48} /><p className="font-black text-xs uppercase tracking-widest">No records found</p>
                        </div>
                    ) : (
                        paginated.map((a, i) => (
                            <motion.div key={a._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{a.outsider?.outsiderName || '-'}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{a.customerName}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(a.paymentStatus)}`}>{a.paymentStatus}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-[11px]">
                                    <div><span className="text-gray-400 block">Category</span><span className="font-semibold text-gray-700">{a.outsider?.category === 'Vehicle Outsider' ? 'Vehicle' : 'Labor'}</span></div>
                                    <div><span className="text-gray-400 block">Date</span><span className="font-semibold text-gray-700">{new Date(a.allocationDate).toLocaleDateString('en-GB')}</span></div>
                                    <div><span className="text-gray-400 block">Qty</span><span className="font-semibold text-gray-700">V-{a.vehicleQty || 0}, L-{a.laborQty || 0}</span></div>
                                </div>
                                <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => router.push(`/dashboard/outsiders/allocations/${a._id}`)}
                                        className="flex-1 py-2 rounded-lg text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                                        style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}>
                                        <Eye size={12} /> View
                                    </motion.button>
                                    {!isManager && (
                                        <button onClick={() => setDeleteId(a._id)} className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"><Trash2 size={15} /></button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                <div className="px-4 md:px-6 py-3 bg-gray-50 flex items-center justify-between border-t border-gray-50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page {currentPage} of {totalPages || 1}</p>
                    {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
                </div>
            </motion.div>

            <DeleteModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} isDeleting={isDeleting}
                title="Remove Allocation" description="Are you sure you want to remove this allocation? It will be permanently deleted from the system." />
        </div>
    );
}
