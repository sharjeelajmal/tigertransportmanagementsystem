'use client';

import { motion } from 'framer-motion';
import { LayoutDashboard, Eye, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Pagination from '@/components/Pagination';

interface Allocation {
    _id: string;
    outsider: { _id: string; outsiderName: string; category: string; };
    customerName: string;
    allocationDate: string;
    vehicleQty: number;
    laborQty: number;
    vehicles?: { vehicleName: string; vehicleNo: string; driverName: string }[];
    paymentStatus: string;
}

interface AllocationsTableProps {
    isLoading: boolean;
    paginated: Allocation[];
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    setCurrentPage: (page: number) => void;
    confirmDelete: (id: string) => void;
}

const statusColor = (s: string) => {
    if (s === 'Paid') return 'text-green-500 bg-green-50';
    if (s === 'Partial Paid') return 'text-sky-500 bg-sky-50';
    return 'text-red-500 bg-red-50';
};

// 100% Bulletproof QTY Function
function getQtyDisplay(a: Allocation) {
    // 1. Safe category fetch with lowercasing and trimming
    const cat = (a.outsider?.category || '').toLowerCase().trim();

    // 2. Boolean checks using 'includes' to avoid exact match failures
    const isLabor = cat.includes('labor');
    const isVehicle = cat.includes('vehicle');
    const isBoth = cat.includes('both');

    const lQty = a.laborQty || 0;
    const lStr = `L-${String(lQty).padStart(2, '0')}`;

    // 3. Real vehicle data check
    const hasRealVehicleData = a.vehicles && a.vehicles.length > 0 && !!a.vehicles[0]?.vehicleName;

    // 4. Strict Labor condition: If category is labor OR (labor exist but no vehicle name typed)
    if ((isLabor && !isBoth) || (!hasRealVehicleData && lQty > 0)) {
        return lStr; // Returns ONLY L-xx (Completely hides V-)
    }

    const vQty = hasRealVehicleData ? (a.vehicleQty || a.vehicles!.length) : (a.vehicleQty || 0);
    const vStr = `V-${String(vQty).padStart(2, '0')}`;

    // 5. Strict Vehicle condition
    if ((isVehicle && !isBoth) || (hasRealVehicleData && lQty === 0)) {
        return vStr; // Returns ONLY V-xx (Completely hides L-)
    }

    // 6. Fallback for 'Both' or corrupted data
    return `${vStr}, ${lStr}`;
}

function getCategoryLabel(cat: string) {
    if (!cat) return '-';
    const lower = cat.toLowerCase();
    if (lower.includes('vehicle')) return 'Vehicle';
    if (lower.includes('labor')) return 'Labor';
    if (lower.includes('both')) return 'Both';
    return cat;
}

export default function AllocationsTable({
    isLoading, paginated, currentPage, totalPages, itemsPerPage, setCurrentPage, confirmDelete
}: AllocationsTableProps) {
    const router = useRouter();
    const { isManager } = useAuth();

    return (
        <div className="bg-white rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto min-h-[300px]">
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
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={8} className="px-6 py-5"><div className="h-4 bg-gray-50 rounded-lg w-full" /></td>
                                </tr>
                            ))
                        ) : paginated.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-30">
                                        <LayoutDashboard size={48} />
                                        <p className="font-black text-xs uppercase tracking-widest">No records found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginated.map((a, i) => (
                                <motion.tr key={a._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-[#FFF8F8] group transition-all">
                                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap"><span className="text-xs font-medium text-gray-400">{String((currentPage - 1) * itemsPerPage + i + 1).padStart(2, '0')}</span></td>
                                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap"><span className="text-sm font-semibold text-gray-700">{a.outsider?.outsiderName || '-'}</span></td>
                                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-gray-400">{getCategoryLabel(a.outsider?.category)}</span></td>
                                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-gray-400">{a.customerName || '-'}</span></td>
                                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-gray-400">{new Date(a.allocationDate).toLocaleDateString('en-GB')}</span></td>

                                    {/* Updated QTY Column */}
                                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap"><span className="text-sm font-bold text-gray-800">{getQtyDisplay(a)}</span></td>

                                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                        <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${statusColor(a.paymentStatus)}`}>{a.paymentStatus}</span>
                                    </td>
                                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center gap-2 justify-end">
                                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => router.push(`/dashboard/outsiders/allocations/${a._id}`)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold cursor-pointer"
                                                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", boxShadow: "0 2px 8px rgba(var(--primary-rgb,181,1,4),0.3)" }}>
                                                <Eye size={13} /> View
                                            </motion.button>
                                            {!isManager && (
                                                <button onClick={() => confirmDelete(a._id)} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer" title="Delete">
                                                    <Trash2 size={15} />
                                                </button>
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
                            <div className="h-3 bg-gray-100 rounded w-1/3" />
                        </div>
                    ))
                ) : paginated.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 opacity-30 py-16">
                        <LayoutDashboard size={48} />
                        <p className="font-black text-xs uppercase tracking-widest">No records found</p>
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
                                <div><span className="text-gray-400 block">Category</span><span className="font-semibold text-gray-700">{getCategoryLabel(a.outsider?.category)}</span></div>
                                <div><span className="text-gray-400 block">Date</span><span className="font-semibold text-gray-700">{new Date(a.allocationDate).toLocaleDateString('en-GB')}</span></div>
                                <div><span className="text-gray-400 block">Qty</span><span className="font-bold text-gray-900">{getQtyDisplay(a)}</span></div>
                            </div>
                            <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                                <motion.button whileTap={{ scale: 0.95 }} onClick={() => router.push(`/dashboard/outsiders/allocations/${a._id}`)}
                                    className="flex-1 py-2 rounded-lg text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                                    style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}>
                                    <Eye size={12} /> View
                                </motion.button>
                                {!isManager && (
                                    <button onClick={() => confirmDelete(a._id)} className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                                        <Trash2 size={15} />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Completely Centered Pagination Footer */}
            <div className="px-4 py-5 bg-gray-50 flex flex-col items-center justify-center w-full border-t border-gray-100">
                {totalPages > 1 && (
                    <div className="flex justify-center w-full mb-3">
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                )}
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                    Page {currentPage} of {totalPages || 1}
                </p>
            </div>
        </div>
    );
}