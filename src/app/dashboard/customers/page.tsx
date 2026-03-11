"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    UserCircle2,
    Search,
    SlidersHorizontal,
    Eye,
    Plus,
    X,
    Trash2,
    Mail,
    Phone,
    MapPin,
    FileText,
    TrendingUp,
} from "lucide-react";
import CustomDropdown from "@/components/CustomDropdown";
import CustomDatePicker from "@/components/CustomDatePicker";
import DeleteModal from "@/components/DeleteModal";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";
import ReportModal from "@/components/customers/ReportModal";
import { useAuth } from "@/context/AuthContext";

interface Customer {
    _id: string;
    customerName: string;
    mobileNo: string;
    emergencyNo: string;
    address: string;
    email: string;
    refPerson: string;
    remarks: string;
    createdAt: string;
}

export default function CustomersPage() {
    const router = useRouter();
    const { isAdmin } = useAuth();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Report state
    const [reportCustomer, setReportCustomer] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        fetchCustomers();
    }, [startDate, endDate]);

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (startDate) params.set("startDate", startDate.toISOString().split('T')[0]);
            if (endDate) params.set("endDate", endDate.toISOString().split('T')[0]);
            
            const res = await fetch(`/api/customers?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setCustomers(data.data);
            }
        } catch {
            console.error("Failed to fetch customers");
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDelete = (id: string) => setDeleteId(id);

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/customers/${deleteId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setCustomers(prev => prev.filter(c => c._id !== deleteId));
                setDeleteId(null);
            } else {
                alert("Failed to delete customer");
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
            alert('Error deleting customer');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleGenerateReport = (startDate: Date, endDate: Date) => {
        if (!reportCustomer) return;
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];
        router.push(`/dashboard/invoices?search=${encodeURIComponent(reportCustomer.name)}&startDate=${startStr}&endDate=${endStr}`);
    };

    const filtered = customers.filter((c) => {
        return (
            c.customerName.toLowerCase().includes(search.toLowerCase()) ||
            c.mobileNo.includes(search) ||
            c.email.toLowerCase().includes(search.toLowerCase())
        );
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [search, startDate, endDate]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedData = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const statsCards = [
        { label: "Total Customers", value: String(customers.length).padStart(2, '0'), icon: UserCircle2, sub: "All registered" },
        { label: "Recent Added", value: String(customers.filter(c => {
            const d = new Date(c.createdAt);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length).padStart(2, '0'), icon: Plus, sub: "This month" },
    ];

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
                        Customer List
                    </h1>
                    <p className="text-gray-400 text-xs md:text-sm mt-0.5">
                        {customers.length} customers registered
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => router.push("/dashboard/invoice?type=inbound")}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border-2 border-gray-100 text-gray-700 text-sm font-bold shadow-sm cursor-pointer shrink-0 hover:border-gray-200 transition-all"
                    >
                        <FileText size={15} className="text-primary" />
                        <span className="hidden sm:inline">Invoice</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.03, boxShadow: "0 8px 25px rgba(var(--primary-rgb, 181,1,4),0.35)" }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => router.push("/dashboard/customers/add")}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg cursor-pointer shrink-0"
                        style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                    >
                        <Plus size={15} />
                        <span className="hidden sm:inline">Add Customer</span>
                        <span className="sm:hidden">Add</span>
                    </motion.button>
                </div>
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
                                    <p className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                                        {card.value}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div
                            className="absolute bottom-4 right-4 w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
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
                    <div className="relative flex-1 min-w-0" style={{ minWidth: "200px" }}>
                        <Search
                            size={15}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Search name, mobile or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 outline-none transition-all"
                            style={{
                                borderColor: search ? "var(--primary)" : "",
                                boxShadow: search ? "0 0 0 3px rgba(var(--primary-rgb, 181,1,4),0.08)" : "",
                            }}
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="w-full md:w-56">
                            <CustomDatePicker
                                label="From"
                                value={startDate || ""}
                                onChange={setStartDate}
                            />
                        </div>
                        <div className="w-full md:w-56">
                            <CustomDatePicker
                                label="To"
                                value={endDate || ""}
                                onChange={setEndDate}
                            />
                        </div>
                        {(startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(null); setEndDate(null); }}
                                className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1 shrink-0"
                            >
                                <X size={14} /> Clear
                            </button>
                        )}
                    </div>

                    <div className="ml-auto text-sm text-gray-400 shrink-0">
                        <span className="font-bold text-gray-700">{filtered.length}</span> results
                    </div>
                </div>

                {/* ── Desktop Table ── */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {["Sr. #", "Customer Name", "Contact Details", "Address", "Ref Person", "Action"].map((h) => (
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
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 bg-gray-100 rounded-lg w-16"></div>
                                                <div className="h-7 bg-gray-100 rounded-lg w-8"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <UserCircle2 size={40} className="opacity-20" />
                                            <p className="text-sm font-medium">No customers found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((c, i) => (
                                    <motion.tr
                                        key={c._id}
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
                                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                                                    style={{ background: "var(--primary)" }}
                                                >
                                                    {c.customerName.charAt(0)}
                                                </div>
                                                <p className="text-sm font-bold text-gray-800 whitespace-nowrap">
                                                    {c.customerName}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-0.5 min-w-max">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                                                    <Phone size={11} className="text-gray-400" />
                                                    {c.mobileNo || "-"}
                                                </div>
                                                {c.email && (
                                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                                        <Mail size={11} />
                                                        {c.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium max-w-[180px] truncate">
                                                <MapPin size={12} className="text-gray-300 flex-shrink-0" />
                                                {c.address || "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                            {c.refPerson || "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => router.push(`/dashboard/customers/${c._id}`)}
                                                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-bold cursor-pointer bg-primary shadow-md"
                                                >
                                                    <Eye size={13} />
                                                    View
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setReportCustomer({ id: c._id, name: c.customerName })}
                                                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold cursor-pointer shadow-md"
                                                >
                                                    <TrendingUp size={13} />
                                                    Report
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => router.push(`/dashboard/invoice?type=inbound&name=${encodeURIComponent(c.customerName)}&phone=${encodeURIComponent(c.mobileNo || "")}&address=${encodeURIComponent(c.address || "")}`)}
                                                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[var(--primary)] border-2 border-[var(--primary)] text-xs font-bold cursor-pointer hover:bg-red-50 transition-colors"
                                                >
                                                    <FileText size={13} />
                                                    Invoice
                                                </motion.button>
                                                {isAdmin && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => confirmDelete(c._id)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                                                        title="Delete Customer"
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
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 shrink-0"></div>
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="h-4 bg-gray-100 rounded w-32"></div>
                                            <div className="h-3 bg-gray-100 rounded w-24"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : paginatedData.length === 0 ? (
                        <div className="py-16 flex justify-center text-gray-400">
                             <UserCircle2 size={40} className="opacity-20" />
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {paginatedData.map((c, i) => (
                                <motion.div
                                    key={c._id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="px-4 py-4 flex flex-col gap-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0"
                                            style={{ background: "var(--primary)" }}
                                        >
                                            {c.customerName.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate">
                                                {c.customerName}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate">{c.mobileNo || "No contact"} &bull; {c.refPerson || "No ref"}</p>
                                        </div>
                                         <div className="flex items-center gap-2 mt-2 w-full">
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => router.push(`/dashboard/customers/${c._id}`)}
                                            className="flex-1 px-3 py-2 rounded-lg text-white text-xs font-bold shrink-0 cursor-pointer bg-primary shadow-md flex items-center justify-center gap-1.5"
                                        >
                                            <Eye size={13} />
                                            View Profile
                                        </motion.button>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setReportCustomer({ id: c._id, name: c.customerName })}
                                            className="flex-1 px-3 py-2 rounded-lg bg-emerald-500 text-white text-xs font-bold shrink-0 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                                        >
                                            <TrendingUp size={13} />
                                            Report
                                        </motion.button>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => router.push(`/dashboard/invoice?type=inbound&name=${encodeURIComponent(c.customerName)}&phone=${encodeURIComponent(c.mobileNo || "")}&address=${encodeURIComponent(c.address || "")}`)}
                                            className="flex-1 px-3 py-2 rounded-lg text-primary border-2 border-primary text-xs font-bold shrink-0 cursor-pointer bg-white flex items-center justify-center gap-1.5"
                                        >
                                            <FileText size={13} />
                                            Invoice
                                        </motion.button>
                                        {isAdmin && (
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => confirmDelete(c._id)}
                                                className="w-10 h-10 rounded-lg border-2 border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </motion.button>
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
                title="Remove Customer"
                description="Are you sure you want to remove this customer? They will be permanently deleted from the system."
            />

            <ReportModal
                isOpen={!!reportCustomer}
                customerName={reportCustomer?.name || ""}
                onClose={() => setReportCustomer(null)}
            />
        </div>
    );
}
