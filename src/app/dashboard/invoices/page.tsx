"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    FileText,
    Search,
    SlidersHorizontal,
    Eye,
    Plus,
    X,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    Handshake,
    Download,
    Trash2
} from "lucide-react";
import CustomDropdown from "@/components/CustomDropdown";
import CustomDatePicker from "@/components/CustomDatePicker";
import Pagination from "@/components/Pagination";
import DeleteModal from "@/components/DeleteModal";

interface Invoice {
    _id: string;
    type: "inbound" | "outbound" | "allocation";
    invoiceNo: string;
    invoiceDate: string;
    clientName?: string;
    partyName?: string;
    totalAmount: number;
    createdAt: string;
}

const typeOptions = [
    { value: "All", label: "All Types" },
    { value: "Inbound", label: "Inbound" },
    { value: "Outbound", label: "Outbound" },
    { value: "Allocation", label: "Outsider" },
];

export default function InvoicesPage() {
    const router = useRouter();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [dateFilter, setDateFilter] = useState<Date | null>(null);
    const [showFilters, setShowFilters] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Delete state
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/invoices");
            const data = await res.json();
            if (data.success) {
                setInvoices(data.data);
            }
        } catch {
            console.error("Failed to fetch invoices");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/invoices/${deleteId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setInvoices((prev) => prev.filter((inv) => inv._id !== deleteId));
                setDeleteId(null);
            } else {
                alert("Failed to delete invoice");
            }
        } catch {
            alert("An error occurred while deleting");
        }
        setIsDeleting(false);
    };

    const handleDownloadPDF = async (id: string) => {
        const inv = invoices.find(i => i._id === id);
        if (!inv) return;

        // Use a hidden iframe to silently trigger the download without opening any tabs
        const iframe = document.createElement('iframe');
        iframe.style.visibility = 'hidden';
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '1024px';
        iframe.style.height = '1024px';
        iframe.src = `/dashboard/invoice?id=${id}&type=${inv.type}&download=true`;
        document.body.appendChild(iframe);

        // Auto clean up the iframe after a reasonable time
        setTimeout(() => {
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
        }, 10000);
    };

    const filtered = invoices.filter((inv) => {
        const nameMatch = (inv.clientName || inv.partyName || "").toLowerCase().includes(search.toLowerCase());
        const noMatch = inv.invoiceNo.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "All" || inv.type.toLowerCase() === typeFilter.toLowerCase();

        let matchDate = true;
        if (dateFilter) {
            // Simple string match for DD/MM/YYYY
            const formattedFilterDate = dateFilter.toLocaleDateString('en-GB');
            matchDate = inv.invoiceDate === formattedFilterDate;
        }

        return (nameMatch || noMatch) && matchType && matchDate;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [search, typeFilter, dateFilter]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedData = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const activeFilters = typeFilter !== "All" || dateFilter !== null;

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "inbound": return <ArrowUpRight size={14} className="text-emerald-500" />;
            case "outbound": return <ArrowDownLeft size={14} className="text-blue-500" />;
            case "allocation": return <Handshake size={14} className="text-purple-500" />;
            default: return <FileText size={14} />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "inbound": return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case "outbound": return "bg-blue-50 text-blue-700 border-blue-100";
            case "allocation": return "bg-purple-50 text-purple-700 border-purple-100";
            default: return "bg-gray-50 text-gray-700 border-gray-100";
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-3 sm:p-4">
            {/* ── Page Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">Invoice Archive</h1>
                    <p className="text-gray-400 text-xs md:text-sm font-medium mt-1">Manage and track all system-generated invoices</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => router.push("/dashboard")}
                    className="w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-bold shadow-lg"
                    style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                >
                    <Plus size={18} /><span>New Invoice</span>
                </motion.button>
            </motion.div>

            {/* ── Main Container ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-2xl relative"
            >
                {/* Toolbar */}
                <div className="px-4 sm:px-6 py-6 border-b border-gray-50 bg-white/50 backdrop-blur-sm relative z-50">
                    <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 w-full sm:min-w-[200px] relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or invoice number..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none transition-all placeholder:text-gray-400 text-sm font-medium focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/5"
                            />
                        </div>

                        {/* Filter Toggle */}
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold border-2 transition-all cursor-pointer ${showFilters ? 'bg-red-50 border-[var(--primary)] text-[var(--primary)]' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'}`}
                        >
                            <SlidersHorizontal size={18} />
                            <span>Filters</span>
                            {activeFilters && (
                                <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                            )}
                        </motion.button>
                    </div>

                    {/* Filter Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                className="mt-6 flex flex-col sm:flex-row flex-wrap sm:items-end gap-4 overflow-visible relative z-[60] pb-2"
                            >
                                <CustomDropdown
                                    label="Invoice Type"
                                    options={typeOptions}
                                    value={typeFilter}
                                    onChange={setTypeFilter}
                                    className="w-full sm:w-56"
                                />
                                <div className="w-full sm:w-64">
                                    <CustomDatePicker
                                        label="Specific Date"
                                        value={dateFilter || ""}
                                        onChange={(d) => setDateFilter(d)}
                                    />
                                </div>
                                {activeFilters && (
                                    <button
                                        onClick={() => { setTypeFilter("All"); setDateFilter(null); }}
                                        className="mb-3 px-4 py-2 text-xs font-bold text-gray-400 hover:text-[var(--primary)] flex items-center gap-1 transition-colors"
                                    >
                                        <X size={14} /> Reset Filters
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto relative z-10 pb-40">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50/50">
                                {["Invoice Info", "Type", "Client/Party", "Amount", "Created", "Action"].map((h) => (
                                    <th key={h} className="px-4 sm:px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-4 sm:px-8 py-6"><div className="h-12 bg-gray-50 rounded-2xl w-full" /></td>
                                    </tr>
                                ))
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 sm:px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <FileText size={48} className="text-gray-400" />
                                            <p className="font-bold text-gray-500">No invoices found matching your criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((inv, i) => (
                                    <motion.tr
                                        key={inv._id}
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                        className="group hover:bg-[var(--primary)]/5 transition-defaults"
                                    >
                                        <td className="px-4 sm:px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900 group-hover:text-[var(--primary)] transition-colors">#{inv.invoiceNo}</span>
                                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase mt-1">
                                                    <Calendar size={10} /> {inv.invoiceDate}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-8 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-wider ${getTypeColor(inv.type)}`}>
                                                {getTypeIcon(inv.type)} {inv.type === 'allocation' ? 'outsider' : inv.type}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-8 py-5">
                                            <span className="text-sm font-bold text-gray-700">{inv.clientName || inv.partyName || "-"}</span>
                                        </td>
                                        <td className="px-4 sm:px-8 py-5">
                                            <span className="text-sm font-black text-gray-900">Rs. {inv.totalAmount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-4 sm:px-8 py-5">
                                            <span className="text-xs font-medium text-gray-400">{new Date(inv.createdAt).toLocaleDateString('en-GB')}</span>
                                        </td>
                                        <td className="px-4 sm:px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                    onClick={() => router.push(`/dashboard/invoice?id=${inv._id}&type=${inv.type}`)}
                                                    className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 hover:shadow-lg transition-all cursor-pointer"
                                                >
                                                    <Eye size={16} />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleDownloadPDF(inv._id)}
                                                    className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-emerald-500 hover:border-emerald-100 hover:shadow-lg transition-all cursor-pointer"
                                                    title="Download PDF"
                                                >
                                                    <Download size={16} />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleDelete(inv._id)}
                                                    className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 hover:shadow-lg transition-all cursor-pointer"
                                                    title="Delete Invoice"
                                                >
                                                    <Trash2 size={16} />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden px-3 py-4 space-y-3">
                    {isLoading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse h-32 rounded-2xl bg-gray-50 border border-gray-100" />
                        ))
                    ) : paginatedData.length === 0 ? (
                        <div className="py-14 text-center opacity-40">
                            <FileText size={42} className="mx-auto text-gray-400 mb-3" />
                            <p className="font-bold text-gray-500 text-sm">No invoices found matching your criteria</p>
                        </div>
                    ) : (
                        paginatedData.map((inv, i) => (
                            <motion.div
                                key={inv._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Invoice</p>
                                        <p className="text-sm font-black text-gray-900">#{inv.invoiceNo}</p>
                                        <p className="mt-1 text-[11px] text-gray-500 font-medium">{inv.clientName || inv.partyName || "-"}</p>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider ${getTypeColor(inv.type)}`}>
                                        {getTypeIcon(inv.type)} {inv.type === 'allocation' ? 'outsider' : inv.type}
                                    </span>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-2.5">
                                        <p className="text-gray-400 font-bold uppercase tracking-wide">Amount</p>
                                        <p className="text-gray-900 font-black mt-0.5">Rs. {inv.totalAmount.toLocaleString()}</p>
                                    </div>
                                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-2.5">
                                        <p className="text-gray-400 font-bold uppercase tracking-wide">Created</p>
                                        <p className="text-gray-900 font-bold mt-0.5">{new Date(inv.createdAt).toLocaleDateString('en-GB')}</p>
                                    </div>
                                </div>

                                <div className="mt-2 text-[11px] text-gray-500 font-medium flex items-center gap-1.5">
                                    <Calendar size={12} /> {inv.invoiceDate}
                                </div>

                                <div className="mt-4 flex items-center gap-2">
                                    <button
                                        onClick={() => router.push(`/dashboard/invoice?id=${inv._id}&type=${inv.type}`)}
                                        className="flex-1 h-10 rounded-xl border border-gray-200 text-gray-600 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
                                    >
                                        <Eye size={15} /> View
                                    </button>
                                    <button
                                        onClick={() => handleDownloadPDF(inv._id)}
                                        className="h-10 w-10 rounded-xl border border-gray-200 text-gray-600 hover:text-emerald-600 hover:border-emerald-200 transition-colors flex items-center justify-center"
                                        title="Download PDF"
                                    >
                                        <Download size={15} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(inv._id)}
                                        className="h-10 w-10 rounded-xl border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center"
                                        title="Delete Invoice"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                    <div className="px-4 sm:px-8 py-6 bg-gray-50/50 backdrop-blur-md border-t border-gray-100 relative z-10">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </motion.div>

            {/* Delete Modal */}
            <DeleteModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
}
