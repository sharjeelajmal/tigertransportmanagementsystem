'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Loader from '@/components/Loader';
import TripDetailsSection from '@/components/outsiders/allocations/forms/TripDetailsSection';
import VehicleDetailsSection from '@/components/outsiders/allocations/forms/VehicleDetailsSection';
import LaborDetailsSection from '@/components/outsiders/allocations/forms/LaborDetailsSection';
import PaymentDetailsSection from '@/components/outsiders/allocations/forms/PaymentDetailsSection';

function resolveCategory(raw: string): string {
    const lower = raw.toLowerCase();
    if (lower === 'both') return 'Both';
    if (lower.includes('vehicle')) return 'Vehicle Outsider';
    if (lower.includes('labor')) return 'Labor Outsider';
    return '';
}

interface OutsiderOption {
    _id: string;
    outsiderName: string;
    category: string;
}

export default function AddAllocationClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const outsiderId = searchParams.get('outsiderId') || '';
    const categoryQuery = searchParams.get('category') || '';

    const [isLoadingInit, setIsLoadingInit] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [outsiderDetails, setOutsiderDetails] = useState<any>(null);
    const [resolvedCategory, setResolvedCategory] = useState(resolveCategory(categoryQuery));

    // For manual outsider selection when no outsiderId in URL
    const [outsidersList, setOutsidersList] = useState<OutsiderOption[]>([]);
    const [selectedOutsiderId, setSelectedOutsiderId] = useState(outsiderId);

    const [form, setForm] = useState({
        outsider: outsiderId,
        customerName: '',
        tripDate: new Date().toISOString().split('T')[0],
        tripTime: '',
        pickupLocation: '',
        dropLocation: '',
        vehicleQty: 0,
        laborQty: 0,
        vehicles: [{ vehicleName: '', vehicleNo: '', driverName: '' }],
        laborNames: '',
        totalAmount: 0,
        paidAmount: 0,
        remarksVehicle: '',
        remarksLabor: '',
        remarksPayment: '',
        showLaborInVehicle: false
    });

    useEffect(() => {
        if (outsiderId) {
            fetchOutsiderDetails(outsiderId);
        } else {
            // No outsiderId — load outsiders list for dropdown
            fetchOutsidersList();
        }
    }, [outsiderId]);

    const fetchOutsidersList = async () => {
        try {
            const res = await fetch('/api/outsiders');
            const data = await res.json();
            if (data.success) {
                setOutsidersList(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingInit(false);
        }
    };

    const fetchOutsiderDetails = async (id: string) => {
        try {
            const res = await fetch(`/api/outsiders/${id}`);
            const data = await res.json();
            if (data.success) {
                setOutsiderDetails(data.data);
                setForm(prev => ({ ...prev, outsider: id }));
                if (!resolvedCategory && data.data?.category) {
                    setResolvedCategory(resolveCategory(data.data.category));
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingInit(false);
        }
    };

    const handleOutsiderSelect = (id: string) => {
        setSelectedOutsiderId(id);
        const selected = outsidersList.find(o => o._id === id);
        if (selected) {
            setOutsiderDetails(selected);
            setResolvedCategory(resolveCategory(selected.category));
            setForm(prev => ({ ...prev, outsider: id }));
        }
    };

    const isVehicle = resolvedCategory === 'Vehicle Outsider';
    const isLabor = resolvedCategory === 'Labor Outsider';
    const isBoth = resolvedCategory === 'Both';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...form,
                vehicleQty: form.vehicles?.length || 0,
            };
            const res = await fetch('/api/outsiders/allocations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                router.push('/dashboard/outsiders/allocations');
            } else {
                alert(data.error || 'Failed to save allocation.');
            }
        } catch (error) {
            console.error(error);
            alert('Error processing allocation.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingInit) return <Loader fullScreen />;

    return (
        <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto pb-20 px-2 md:px-0">
            {/* Red Banner Header */}
            <div className="bg-[var(--primary)] text-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-lg">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-all cursor-pointer backdrop-blur-md"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase">
                            {outsiderDetails?.outsiderName || 'New Allocation'}
                        </h1>
                        <p className="text-xs md:text-sm font-semibold text-white/80 uppercase tracking-wider mt-1">
                            {resolvedCategory || outsiderDetails?.category || 'Select Outsider Below'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                {/* Outsider Dropdown (only if no outsiderId in URL) */}
                {!outsiderId && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                            <div className="w-full md:w-48 lg:w-56 flex-shrink-0 bg-gray-50/60 border-b md:border-b-0 md:border-r border-gray-100 px-5 py-6 flex items-start">
                                <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest">Select Outsider</h2>
                            </div>
                            <div className="flex-1 px-6 py-6">
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">Outsider</label>
                                <select
                                    value={selectedOutsiderId}
                                    onChange={(e) => handleOutsiderSelect(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--primary)] font-semibold text-gray-700 transition-colors cursor-pointer"
                                    required
                                >
                                    <option value="">-- Select Outsider --</option>
                                    {outsidersList.map(o => (
                                        <option key={o._id} value={o._id}>{o.outsiderName} ({o.category})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <TripDetailsSection form={form} setForm={setForm} />

                {(isVehicle || isBoth) && <VehicleDetailsSection form={form} setForm={setForm} showAddLabor={isBoth} />}
                {isLabor && <LaborDetailsSection form={form} setForm={setForm} />}
                {isBoth && <LaborDetailsSection form={form} setForm={setForm} />}

                <PaymentDetailsSection form={form} setForm={setForm} />

                {/* Footer Actions */}
                <div className="flex items-center justify-end pt-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting || !form.customerName || form.totalAmount <= 0 || !form.outsider}
                        className="px-8 md:px-10 py-3 md:py-3.5 rounded-lg text-white text-sm font-black shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}
                    >
                        {isSubmitting ? 'Processing...' : (
                            <>
                                <CheckCircle size={18} />
                                Allocate
                            </>
                        )}
                    </motion.button>
                </div>
            </form>
        </div>
    );
}
