'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OutsiderProfileHeader from '@/components/outsiders/OutsiderProfileHeader';
import Loader from '@/components/Loader';
import { IOutsider } from '@/models/Outsider';
import AllocationsStats from '@/components/outsiders/allocations/AllocationsStats';
import AllocationsFilters from '@/components/outsiders/allocations/AllocationsFilters';
import AllocationsTable from '@/components/outsiders/allocations/AllocationsTable';
import DeleteModal from '@/components/DeleteModal';

export default function OutsiderAllocationsClient({ outsiderId }: { outsiderId: string }) {
    const router = useRouter();
    const [outsider, setOutsider] = useState<IOutsider | null>(null);
    const [allocations, setAllocations] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalAllocations: 0, totalAmount: 0, paidAmount: 0, remainingAmount: 0 });

    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [search, setSearch] = useState("");
    const [monthFilter, setMonthFilter] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    const [statusFilter, setStatusFilter] = useState("All");
    const [showFilters, setShowFilters] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchOutsider = async () => {
        try {
            const res = await fetch(`/api/outsiders/${outsiderId}`);
            if (res.ok) {
                const data = await res.json();
                setOutsider(data.data || data);
            }
        } catch (error) {
            console.error('Error fetching outsider:', error);
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const fetchAllocations = async () => {
        setIsLoadingData(true);
        try {
            const res = await fetch(`/api/outsiders/allocations?month=${monthFilter}&outsiderId=${outsiderId}`);
            const data = await res.json();
            if (data.success) {
                setAllocations(data.data);
                if (data.stats) setStats(data.stats);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => { fetchOutsider(); }, [outsiderId]);
    useEffect(() => { fetchAllocations(); }, [monthFilter, outsiderId]);

    const filtered = allocations.filter((a) => {
        const matchSearch = a.customerName.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "All" || a.paymentStatus === statusFilter;
        return matchSearch && matchStatus;
    });

    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/outsiders/allocations/${deleteId}`, { method: 'DELETE' });
            if (res.ok) {
                setDeleteId(null);
                fetchAllocations();
            } else { alert('Failed to delete allocation'); }
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Error deleting allocation');
        } finally { setIsDeleting(false); }
    };

    if (isLoadingProfile) return <Loader fullScreen />;
    if (!outsider) return <div className="text-center text-red-500">Outsider not found.</div>;

    return (
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 max-w-7xl mx-auto relative">
            <OutsiderProfileHeader
                outsider={outsider}
                activeTab="allocations"
                outsiderId={outsiderId}
            />

            <AllocationsStats stats={stats} isLoading={isLoadingData} />

            <div className="bg-white rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                <AllocationsFilters
                    showFilters={showFilters} setShowFilters={setShowFilters}
                    monthFilter={monthFilter} setMonthFilter={setMonthFilter}
                    statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                    search={search} setSearch={setSearch}
                    totalResults={filtered.length}
                />
            </div>

            <AllocationsTable
                isLoading={isLoadingData}
                paginated={paginated}
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                setCurrentPage={setCurrentPage}
                confirmDelete={setDeleteId}
            />

            <DeleteModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                title="Remove Allocation"
                description="Are you sure you want to remove this allocation? It will be permanently deleted from the system."
            />
        </div>
    );
}
