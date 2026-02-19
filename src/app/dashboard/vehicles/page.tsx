"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Truck,
    Users,
    HardHat,
    CheckCircle2,
    XCircle,
    Search,
    SlidersHorizontal,
    Eye,
    Plus,
    X,
    Trash2
} from "lucide-react";
import CustomDropdown from "@/components/CustomDropdown";
import Loader from "@/components/Loader";
import DeleteModal from "@/components/DeleteModal";

interface Vehicle {
    _id: string;
    plateNumber: string;
    vehicleName: string;
    modelYear: number;
    status: string;
}

interface Stats {
    totalVehicles: number;
    totalDrivers: number;
    totalHelpers: number;
    availableVehicles: number;
}

const statusOptions = [
    { value: "All", label: "All Statuses" },
    { value: "Available", label: "Available" },
    { value: "On Route", label: "On Route" },
    { value: "Under Maintenance", label: "Under Maintenance" },
    { value: "Out of Service", label: "Out of Service" },
];

const modelYearOptions = [
    { value: "All", label: "All Years" },
    { value: "2026", label: "2026" },
    { value: "2025", label: "2025" },
    { value: "2024", label: "2024" },
    { value: "2023", label: "2023" },
    { value: "2022", label: "2022" },
    { value: "2021", label: "2021" },
    { value: "2020", label: "2020" },
];

const statusBadgeStyle = (status: string) => {
    switch (status) {
        case "Available":
            return { bg: "rgba(5,150,105,0.1)", color: "#059669" }; // Green
        case "On Route":
            return { bg: "rgba(8,145,178,0.1)", color: "#0891B2" }; // Cyan
        case "Under Maintenance":
            return { bg: "rgba(181,1,4,0.08)", color: "#B50104" }; // Red
        case "Out of Service":
            return { bg: "rgba(107,114,128,0.1)", color: "#6B7280" }; // Gray
        default:
            return { bg: "rgba(107,114,128,0.1)", color: "#6B7280" };
    }
};

export default function VehiclePage() {
    const router = useRouter();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalVehicles: 0,
        totalDrivers: 0,
        totalHelpers: 0,
        availableVehicles: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterModelYear, setFilterModelYear] = useState("All");
    const [filterStatus, setFilterStatus] = useState("All");
    const [showFilters, setShowFilters] = useState(false);

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const confirmDelete = (id: string) => {
        setDeleteId(id);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/vehicles/${deleteId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setVehicles(prev => prev.filter(v => v._id !== deleteId));
                setStats(prev => ({
                    ...prev,
                    totalVehicles: prev.totalVehicles - 1,
                    // Assuming we simply decrement total, logic could be more complex given statuses
                }));
                setDeleteId(null);
            } else {
                alert('Failed to delete vehicle');
            }
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            alert('Error deleting vehicle');
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [vehiclesRes, statsRes] = await Promise.all([
                fetch("/api/vehicles"),
                fetch("/api/vehicles/stats"),
            ]);

            const vehiclesData = await vehiclesRes.json();
            const statsData = await statsRes.json();

            if (vehiclesData.success) setVehicles(vehiclesData.data);
            if (statsData.success) setStats(statsData.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredVehicles = vehicles.filter((v) => {
        const matchesSearch =
            v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
            v.vehicleName.toLowerCase().includes(search.toLowerCase());
        const matchesYear =
            filterModelYear === "All" || v.modelYear.toString() === filterModelYear;
        const matchesStatus = filterStatus === "All" || v.status === filterStatus;
        return matchesSearch && matchesYear && matchesStatus;
    });

    const activeFilters = filterModelYear !== "All" || filterStatus !== "All";

    const statsCards = [
        { label: "Total Vehicles", value: stats.totalVehicles, icon: Truck, sub: "Fleet size" },
        { label: "Total Drivers", value: stats.totalDrivers, icon: Users, sub: "Assigned drivers" },
        { label: "Total Helpers", value: stats.totalHelpers, icon: HardHat, sub: "Support staff" },
        { label: "Available", value: stats.availableVehicles, icon: CheckCircle2, sub: "Ready for dispatch" },
    ];

    return (
        <div className="space-y-5 max-w-7xl mx-auto overflow-x-hidden">
            {/* ── Page Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3"
            >
                <div className="min-w-0">
                    <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight truncate">
                        Vehicle Management
                    </h1>
                    <p className="text-gray-400 text-xs md:text-sm mt-0.5">
                        {vehicles.length} vehicles &bull;{" "}
                        {vehicles.filter((v) => v.status === "Available").length} available
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 8px 25px rgba(181,1,4,0.35)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => router.push("/dashboard/vehicles/add")}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg flex-shrink-0 cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #B50104, #8B0003)" }}
                >
                    <Plus size={15} />
                    <span className="hidden sm:inline">Add Vehicle</span>
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
                            placeholder="Search name or plate..."
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
                        <span className="font-bold text-gray-700">{filteredVehicles.length}</span> results
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
                                    label="Model Year"
                                    options={modelYearOptions}
                                    value={filterModelYear}
                                    onChange={setFilterModelYear}
                                    className="w-full sm:w-48"
                                />
                                <CustomDropdown
                                    label="Status"
                                    options={statusOptions}
                                    value={filterStatus}
                                    onChange={setFilterStatus}
                                    className="w-full sm:w-44"
                                />
                                {activeFilters && (
                                    <button
                                        onClick={() => {
                                            setFilterModelYear("All");
                                            setFilterStatus("All");
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
                                {["Sr.#", "Plate No.", "Vehicle Name", "Model Year", "Status", "Action"].map((h) => (
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
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader size="md" />
                                            <p className="text-gray-400 text-sm">Loading vehicles...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredVehicles.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                                                <Truck className="w-7 h-7 text-gray-300" />
                                            </div>
                                            <p className="text-gray-400 text-sm font-medium">No vehicles found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredVehicles.map((v, i) => {
                                    const badge = statusBadgeStyle(v.status);
                                    return (
                                        <motion.tr
                                            key={v._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="border-b border-gray-50 hover:bg-[#FFF8F8] transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-gray-400">
                                                    {String(i + 1).padStart(2, "0")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                                    {v.plateNumber}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-800 font-bold">{v.vehicleName}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-500">{v.modelYear}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap inline-flex items-center gap-1.5"
                                                    style={{ background: badge.bg, color: badge.color }}
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                    {v.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => router.push(`/dashboard/vehicles/${v._id}`)}
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
                                                        onClick={() => confirmDelete(v._id)}
                                                        className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                                        title="Delete Vehicle"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Mobile Card List ── */}
                <div className="md:hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-3 py-16">
                            <Loader size="md" />
                            <p className="text-gray-400 text-sm">Loading vehicles...</p>
                        </div>
                    ) : filteredVehicles.length === 0 ? (
                        <div className="py-16 flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                                <Truck className="w-7 h-7 text-gray-300" />
                            </div>
                            <p className="text-gray-400 text-sm font-medium">No vehicles found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filteredVehicles.map((v, i) => {
                                const badge = statusBadgeStyle(v.status);
                                return (
                                    <motion.div
                                        key={v._id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="px-4 py-4 flex items-center gap-3 min-w-0"
                                    >
                                        {/* Icon */}
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-black flex-shrink-0"
                                            style={{ background: "#B50104" }}
                                        >
                                            <Truck size={20} />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate">
                                                {v.vehicleName}
                                            </p>
                                            <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">{v.plateNumber}</p>
                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                                    {v.modelYear}
                                                </span>
                                                <span
                                                    className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                                                    style={{ background: badge.bg, color: badge.color }}
                                                >
                                                    {v.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <div className="flex items-center gap-2">
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => router.push(`/dashboard/vehicles/${v._id}`)}
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
                                                onClick={() => confirmDelete(v._id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 md:px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                        Showing{" "}
                        <span className="font-bold text-gray-600">{filteredVehicles.length}</span> of{" "}
                        <span className="font-bold text-gray-600">{vehicles.length}</span> vehicles
                    </p>
                </div>
            </motion.div>

            <DeleteModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                title="Remove Vehicle"
                description="Are you sure you want to remove this vehicle? This action cannot be undone."
            />
        </div>
    );
}
