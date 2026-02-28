'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Pencil } from 'lucide-react';
import Loader from '@/components/Loader';
import InfoCard from '@/components/staff/InfoCard';
import EditModal from '@/components/staff/EditModal';

interface AllocationDetailClientProps {
    id: string;
}

export default function AllocationDetailClient({ id }: AllocationDetailClientProps) {
    const router = useRouter();
    const [allocation, setAllocation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editSection, setEditSection] = useState('');
    const [editFields, setEditFields] = useState<any[]>([]);

    const fetchAllocation = async () => {
        try {
            const res = await fetch(`/api/outsiders/allocations/${id}`);
            const data = await res.json();
            if (data.success) setAllocation(data.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAllocation(); }, [id]);

    const handleEdit = (section: string) => {
        setEditSection(section);
        let fields: any[] = [];
        if (section === 'Trip Information') {
            fields = [
                { name: 'customerName', label: 'Customer Name', value: allocation?.customerName },
                { name: 'allocationDate', label: 'Allocation Date', type: 'date', value: allocation?.allocationDate?.split('T')[0] },
            ];
        } else if (section === 'Payment Summary') {
            fields = [
                { name: 'totalAmount', label: 'Total Amount', type: 'number', value: allocation?.totalAmount },
                { name: 'paidAmount', label: 'Paid Amount', type: 'number', value: allocation?.paidAmount },
            ];
        } else if (section === 'Additional Description') {
            fields = [
                { name: 'description', label: 'Description', value: allocation?.description },
            ];
        }
        setEditFields(fields);
        setIsEditModalOpen(true);
    };

    const handleSave = async (updatedData: any) => {
        try {
            const res = await fetch(`/api/outsiders/allocations/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
            if (res.ok) {
                await fetchAllocation();
                setIsEditModalOpen(false);
            } else { alert('Failed to update allocation'); }
        } catch (error) {
            console.error('Error updating allocation:', error);
            alert('Error updating allocation');
        }
    };

    // Parse laborNames string into array of names
    const parseLaborNames = () => {
        if (!allocation) return [];
        // Check labors array first (backward compat)
        if (allocation.labors && allocation.labors.length > 0) {
            return allocation.labors.map((l: any, i: number) => ({
                label: `Laborer ${i + 1}`, value: l.laborName || l.name || l
            }));
        }
        // Check laborNames string field (actual model field)
        if (allocation.laborNames && typeof allocation.laborNames === 'string') {
            const names = allocation.laborNames.split(',').map((n: string) => n.trim()).filter(Boolean);
            if (names.length > 0) {
                return names.map((name: string, i: number) => ({
                    label: `Laborer ${i + 1}`, value: name
                }));
            }
        }
        return [];
    };

    if (loading) return <Loader fullScreen />;
    if (!allocation) return <div className="p-8 text-center text-red-500 font-bold">Allocation not found</div>;

    const isVehicle = allocation.outsider?.category === 'Vehicle Outsider' || allocation.outsider?.category === 'Both';
    const isLabor = allocation.outsider?.category === 'Labor Outsider' || allocation.outsider?.category === 'Both';
    const statusBg = allocation.paymentStatus === 'Paid' ? 'bg-green-500' : allocation.paymentStatus === 'Partial Paid' ? 'bg-sky-500' : 'bg-red-500';
    const StatusIcon = allocation.paymentStatus === 'Paid' ? CheckCircle : allocation.paymentStatus === 'Partial Paid' ? AlertCircle : XCircle;

    const laborItems = parseLaborNames();

    return (
        <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto pb-20 p-3 sm:p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-3 md:gap-4 border-b border-gray-100 pb-4 md:pb-6 mb-4 md:mb-6">
                <button onClick={() => router.back()}
                    className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm border border-gray-100 transition-all cursor-pointer flex-shrink-0">
                    <ArrowLeft size={18} />
                </button>
                <div className="min-w-0 flex-1">
                    <h1 className="text-lg md:text-2xl font-black text-gray-900 tracking-tight">Allocation Details</h1>
                    <p className="text-xs md:text-sm font-semibold text-gray-400 uppercase tracking-wider mt-1 flex items-center gap-2 flex-wrap">
                        <span className="truncate">{allocation.outsider?.outsiderName} - {allocation.customerName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] text-white ${statusBg} flex items-center gap-0.5 flex-shrink-0`}>
                            <StatusIcon size={10} /> {allocation.paymentStatus}
                        </span>
                    </p>
                </div>
                {/* Edit Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push(`/dashboard/outsiders/allocations/add?outsiderId=${allocation.outsider?._id}&category=${encodeURIComponent(allocation.outsider?.category || '')}&editId=${id}`)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg flex-shrink-0 cursor-pointer"
                    style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", boxShadow: "0 4px 15px rgba(var(--primary-rgb,181,1,4),0.35)" }}
                >
                    <Pencil size={14} />
                    <span className="hidden sm:inline">Edit</span>
                </motion.button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    <InfoCard title="Trip Information" columns={2} delay={0.1}
                        onEdit={() => handleEdit('Trip Information')}
                        items={[
                            { label: 'Outsider Name', value: allocation.outsider?.outsiderName || '-' },
                            { label: 'Category', value: allocation.outsider?.category || '-' },
                            { label: 'Customer Name', value: allocation.customerName || '-' },
                            { label: 'Allocation Date', value: new Date(allocation.allocationDate).toLocaleDateString('en-GB') },
                        ]} />

                    <InfoCard title="Payment Summary" columns={2} delay={0.2}
                        onEdit={() => handleEdit('Payment Summary')}
                        items={[
                            { label: 'Total Amount', value: `PKR ${allocation.totalAmount.toLocaleString()}` },
                            { label: 'Paid Amount', value: `PKR ${allocation.paidAmount.toLocaleString()}` },
                            { label: 'Remaining', value: `PKR ${(allocation.totalAmount - allocation.paidAmount).toLocaleString()}` },
                            { label: 'Payment Status', value: allocation.paymentStatus },
                        ]} />

                    {isVehicle && (
                        <div className="md:col-span-2">
                            <InfoCard title={`Vehicle Details (${allocation.vehicleQty})`} columns={2} delay={0.3}
                                items={allocation.vehicles?.length > 0
                                    ? allocation.vehicles.map((v: any, i: number) => ({ label: `Vehicle ${i + 1}`, value: `${v.vehicleName} (${v.vehicleNo})${v.driverName ? ` — ${v.driverName}` : ''}` }))
                                    : [{ label: 'Vehicles', value: 'No details provided' }]} />
                        </div>
                    )}

                    {isLabor && (
                        <div className="md:col-span-2">
                            <InfoCard title={`Labor Details (${allocation.laborQty})`} columns={3} delay={0.4}
                                items={laborItems.length > 0
                                    ? laborItems
                                    : [{ label: 'Labors', value: 'No details provided' }]} />
                        </div>
                    )}

                    {allocation.description && (
                        <div className="md:col-span-2">
                            <InfoCard title="Additional Description" columns={1} delay={0.5}
                                onEdit={() => handleEdit('Additional Description')}
                                items={[{ label: 'Notes', value: allocation.description }]} />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <EditModal isOpen={isEditModalOpen} title={editSection} fields={editFields}
                onClose={() => setIsEditModalOpen(false)} onSave={handleSave} />
        </div>
    );
}
