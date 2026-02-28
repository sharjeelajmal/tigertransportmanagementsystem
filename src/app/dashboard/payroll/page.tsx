"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Wallet,
    Search,
    Plus,
    SlidersHorizontal,
    Banknote,
    Receipt,
    HandCoins,
    UserCheck,
    FileText
} from "lucide-react";
import Pagination from "@/components/Pagination";
import Loader from "@/components/Loader";
import CustomDropdown from "@/components/CustomDropdown";
import AddAdvanceModal from "@/components/AddAdvanceModal";
import CustomMonthPicker from "@/components/CustomMonthPicker";

interface PayrollRecord {
    id: string; // Mongo ID for routing
    customId: string; // Short ID like E-1A2B
    fullName: string;
    contactNo: string;
    designation: string;
    month: string;
    basicSalary: number;
    advance: number;
    status: "Paid" | "Unpaid";
}



export default function PayrollPage() {
    const router = useRouter();
    const [records, setRecords] = useState<PayrollRecord[]>([]);
    const [stats, setStats] = useState({
        totalSalaries: 0,
        paidSalaries: 0,
        pendingSalaries: 0,
        advanceGiven: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isAddAdvanceOpen, setIsAddAdvanceOpen] = useState(false);

    // Filters
    const [search, setSearch] = useState("");
    const [designation, setDesignation] = useState("All");
    const [advanceFilter, setAdvanceFilter] = useState("All");
    const [monthFilter, setMonthFilter] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    const [statusFilter, setStatusFilter] = useState("All");
    const [showFilters, setShowFilters] = useState(true); // Default open based on image

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchRecords();
    }, [monthFilter]);

    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/payroll?month=${monthFilter}`);
            const data = await res.json();
            if (data.success) {
                setRecords(data.data);
                if (data.stats) {
                    setStats(data.stats);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredRecords = records.filter(r => {
        const matchSearch = r.fullName.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
        const matchDes = designation === "All" || r.designation === designation;
        const matchStatus = statusFilter === "All" || r.status === statusFilter;
        // mock filters logic for advance:
        const matchAdvance = advanceFilter === "All" || (advanceFilter === "Has Advance" ? r.advance > 0 : r.advance === 0);

        return matchSearch && matchDes && matchStatus && matchAdvance;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [search, designation, advanceFilter, monthFilter, statusFilter]);

    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const paginatedData = filteredRecords.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const statsCards = [
        { label: "Total Salaries", value: `${stats.totalSalaries.toLocaleString()}/-`, icon: Banknote, sub: "This month" },
        { label: "Salaries Given", value: `${stats.paidSalaries.toLocaleString()}/-`, icon: UserCheck, sub: "Paid out" },
        { label: "Pending Salaries", value: `${stats.pendingSalaries.toLocaleString()}/-`, icon: Receipt, sub: "Awaiting payment" },
        { label: "Advance Given", value: `${stats.advanceGiven.toLocaleString()}/-`, icon: HandCoins, sub: "Currently requested" },
    ];

    // Filter Options
    const designationOptions = [
        { value: "All", label: "All Designations" },
        { value: "Operation Manager", label: "Operation Manager" },
        { value: "Transport Manager", label: "Transport Manager" },
        { value: "Warehouse Supervisor", label: "Warehouse Supervisor" },
        { value: "Labor", label: "Labor" },
        { value: "Driver", label: "Driver" },
        { value: "Admin", label: "Admin" },
    ];

    return (
        <div className="space-y-5 max-w-7xl mx-auto pb-10">
            {/* ── Page Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
                <div className="min-w-0">
                    <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight truncate">
                        Payroll Management
                    </h1>
                    <p className="text-gray-400 text-xs md:text-sm mt-0.5">
                        {records.length} records &bull; {records.filter(r => r.status === "Paid").length} paid
                    </p>
                </div>
                <div className="flex items-center gap-3 self-start sm:self-auto">
                    <motion.button
                        whileHover={{ scale: 1.03, boxShadow: "0 8px 25px rgba(var(--primary-rgb, 181,1,4),0.35)" }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setIsAddAdvanceOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg flex-shrink-0 cursor-pointer"
                        style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                    >
                        <Plus size={15} />
                        <span className="hidden sm:inline">Add Advance</span>
                        <span className="sm:hidden">Advance</span>
                    </motion.button>
                </div>
            </motion.div>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
                        <div className="flex items-start justify-between mt-1">
                            <div className="min-w-0">
                                <p className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
                                    {card.label}
                                </p>
                                <p className="text-2xl md:text-3xl font-black text-gray-900 mt-1 leading-none">
                                    {isLoading && records.length === 0 ? (
                                        <div className="h-8 w-24 bg-gray-100 animate-pulse rounded"></div>
                                    ) : (
                                        card.value
                                    )}
                                </p>
                                <p className="text-[10px] md:text-xs text-gray-400 mt-1">{card.sub}</p>
                            </div>
                            <div
                                className="w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                                style={{ background: "rgba(var(--primary-rgb, 181,1,4),0.08)" }}
                            >
                                <card.icon className="w-4 h-4 md:w-5 md:h-5" style={{ color: "var(--primary)" }} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Area */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col"
            >
                {/* Top Action Bar */}
                <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white z-20">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${showFilters || designation !== "All" || advanceFilter !== "All" || monthFilter !== "All" || statusFilter !== "All"
                                ? "bg-[var(--primary)] text-white shadow-md shadow-red-100"
                                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            <SlidersHorizontal size={16} />
                            Filters
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
                        <motion.div
                            initial={false}
                            animate={{
                                width: showFilters ? "auto" : "0px",
                                opacity: showFilters ? 1 : 0,
                                scaleX: showFilters ? 1 : 0.9,
                            }}
                            className={`flex-1 origin-right md:min-w-[400px] flex flex-wrap justify-end gap-3 w-full md:w-auto mt-4 md:mt-0 ${!showFilters ? 'overflow-hidden' : 'overflow-visible'}`}
                        >
                            <div className="w-full sm:w-44"><CustomDropdown options={designationOptions} value={designation} onChange={setDesignation} placeholder="Designation" /></div>
                            <div className="w-full sm:w-32"><CustomDropdown options={[{ label: "All", value: "All" }, { label: "Has Advance", value: "Has Advance" }, { label: "No Advance", value: "No Advance" }]} value={advanceFilter} onChange={setAdvanceFilter} placeholder="Advance" /></div>
                            <div className="w-full sm:w-40">
                                <CustomMonthPicker
                                    value={monthFilter}
                                    onChange={setMonthFilter}
                                />
                            </div>
                            <div className="w-full sm:w-32"><CustomDropdown options={[{ label: "All", value: "All" }, { label: "Paid", value: "Paid" }, { label: "Unpaid", value: "Unpaid" }]} value={statusFilter} onChange={setStatusFilter} placeholder="Status" /></div>
                        </motion.div>
                        <div className="relative w-full md:w-64 flex-shrink-0">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all placeholder:text-gray-400 font-medium shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Data Table Desktop */}
                <div className="hidden md:block overflow-x-auto relative min-h-[400px]">
                    <table className="w-full min-w-[1000px]">
                        <thead>
                            <tr className="border-b border-gray-100/50">
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 tracking-wider">ID no.</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 tracking-wider">Full Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 tracking-wider">Contact no.</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 tracking-wider">Designation</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 tracking-wider">Month</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 tracking-wider">Basic Salary</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 tracking-wider">Advance</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-800 tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                [...Array(5)].map((_, idx) => (
                                    <tr key={`sk-${idx}`} className="animate-pulse border-b border-gray-50/50">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-28"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-100 rounded-lg w-28 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                                                <Wallet className="w-7 h-7 text-gray-300" />
                                            </div>
                                            <p className="text-gray-400 text-sm font-medium">No payroll records found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((r, i) => (
                                    <motion.tr
                                        key={r.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="hover:bg-gray-50/50 hover:shadow-sm transition-all group"
                                    >
                                        <td className="px-6 py-4"><span className="text-xs font-semibold text-gray-400">{r.customId}</span></td>
                                        <td className="px-6 py-4"><span className="text-xs font-semibold text-gray-400">{r.fullName}</span></td>
                                        <td className="px-6 py-4"><span className="text-xs font-semibold text-gray-400">{r.contactNo}</span></td>
                                        <td className="px-6 py-4"><span className="text-xs font-semibold text-gray-400">{r.designation}</span></td>
                                        <td className="px-6 py-4"><span className="text-xs font-semibold text-gray-400">{r.month}</span></td>
                                        <td className="px-6 py-4"><span className="text-xs font-semibold text-gray-300">{r.basicSalary || "0000"}/-</span></td>
                                        <td className="px-6 py-4"><span className="text-xs font-semibold text-gray-300">{r.advance || "0000"}/-</span></td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold ${r.status === "Paid" ? "text-green-500" : "text-red-500"}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {r.status === "Paid" ? (
                                                <button
                                                    onClick={() => router.push(`/dashboard/payroll/${r.id}?view=receipt`)}
                                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:text-[var(--primary)] hover:bg-red-50 transition-colors border border-gray-200 hover:border-red-100 ml-auto cursor-pointer"
                                                >
                                                    <FileText size={14} />
                                                    View Receipt
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => router.push(`/dashboard/payroll/${r.id}`)}
                                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--primary)] bg-red-50 hover:bg-[var(--primary)] hover:text-white transition-colors border border-red-100 ml-auto"
                                                >
                                                    <Plus size={14} />
                                                    Create Payroll
                                                </button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Data Table Mobile */}
                <div className="md:hidden">
                    {isLoading ? (
                        <div className="divide-y divide-gray-50">
                            {[...Array(3)].map((_, idx) => (
                                <div key={idx} className="px-4 py-4 flex flex-col gap-3 animate-pulse">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100"></div>
                                            <div className="space-y-2">
                                                <div className="h-4 bg-gray-100 rounded w-24"></div>
                                                <div className="h-3 bg-gray-100 rounded w-32"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl">
                                        <div className="h-8 bg-gray-200 rounded"></div>
                                        <div className="h-8 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : paginatedData.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-16">
                            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                                <Wallet className="w-7 h-7 text-gray-300" />
                            </div>
                            <p className="text-gray-400 text-sm font-medium">No payroll records found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {paginatedData.map((r, i) => (
                                <motion.div
                                    key={r.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="px-4 py-4 flex flex-col gap-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                <UserCheck size={16} className="text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{r.fullName}</p>
                                                <p className="text-xs text-gray-400">{r.designation} · {r.customId}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${r.status === "Paid" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                                                {r.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Basic Salary</p>
                                            <p className="text-sm font-black text-gray-800">{r.basicSalary || "0"}/-</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Advance</p>
                                            <p className="text-sm font-black text-gray-800">{r.advance || "0"}/-</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-1">
                                        {r.status === "Paid" ? (
                                            <button
                                                onClick={() => router.push(`/dashboard/payroll/${r.id}?view=receipt`)}
                                                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-500 hover:text-[var(--primary)] hover:bg-red-50 transition-colors border border-gray-200 hover:border-red-100 w-full cursor-pointer"
                                            >
                                                <FileText size={14} />
                                                View Receipt
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => router.push(`/dashboard/payroll/${r.id}`)}
                                                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white shadow-md w-full"
                                                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                                            >
                                                <Plus size={14} />
                                                Create Payroll
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!isLoading && (
                    <>
                        {totalPages > 1 && (
                            <div className="border-t border-gray-100 bg-white">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                        <div className="px-4 md:px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between rounded-b-3xl">
                            <p className="text-xs text-gray-400">
                                Showing{" "}
                                <span className="font-bold text-gray-600">
                                    {paginatedData.length}
                                </span>{" "}
                                of <span className="font-bold text-gray-600">{filteredRecords.length}</span> results
                            </p>
                        </div>
                    </>
                )}
            </motion.div>

            <AddAdvanceModal
                isOpen={isAddAdvanceOpen}
                onClose={() => setIsAddAdvanceOpen(false)}
                onAdd={async (data) => {
                    // Logic is handled internally by the modal's fetch call
                    // We just need to trigger a page refresh here
                    await fetchRecords();
                    setIsAddAdvanceOpen(false);
                }}
            />
        </div>
    );
}
