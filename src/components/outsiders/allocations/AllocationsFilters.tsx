'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import CustomDropdown from '@/components/CustomDropdown';
import CustomMonthPicker from '@/components/CustomMonthPicker';

interface AllocationsFiltersProps {
    showFilters: boolean;
    setShowFilters: (val: boolean) => void;
    monthFilter: string;
    setMonthFilter: (val: string) => void;
    statusFilter: string;
    setStatusFilter: (val: string) => void;
    search: string;
    setSearch: (val: string) => void;
    totalResults: number;
}

const statusOptions = [
    { value: "All", label: "All Status" },
    { value: "Paid", label: "Paid" },
    { value: "Unpaid", label: "Unpaid" },
    { value: "Partial Paid", label: "Partial Paid" },
];

export default function AllocationsFilters({
    showFilters, setShowFilters, monthFilter, setMonthFilter,
    statusFilter, setStatusFilter, search, setSearch, totalResults
}: AllocationsFiltersProps) {
    return (
        <div className="px-4 md:px-6 py-4 md:py-6 border-b border-gray-50 bg-white space-y-3">
            {/* Top Row: Filter toggle + count + search */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${showFilters ? "bg-[var(--primary)] text-white shadow-lg shadow-red-100" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                    >
                        <SlidersHorizontal size={14} />
                        Filters
                    </button>
                    <div className="h-6 w-px bg-gray-100 hidden sm:block" />
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{totalResults} found</span>
                </div>

                <div className="relative w-full sm:w-56 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search Name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 md:py-2.5 bg-gray-50 border-2 border-transparent focus:border-[var(--primary)] focus:bg-white rounded-xl text-sm outline-none transition-all placeholder:text-gray-400 font-bold text-gray-800"
                    />
                </div>
            </div>

            {/* Filter Dropdowns (stacked on mobile) */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col sm:flex-row gap-3 overflow-hidden"
                    >
                        <div className="w-full sm:w-44">
                            <CustomMonthPicker value={monthFilter} onChange={setMonthFilter} />
                        </div>
                        <div className="w-full sm:w-40">
                            <CustomDropdown options={statusOptions} value={statusFilter} onChange={setStatusFilter} placeholder="Status" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
