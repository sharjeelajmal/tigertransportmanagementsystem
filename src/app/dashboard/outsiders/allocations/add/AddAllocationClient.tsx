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
    if (lower.includes('vehicle')) return 'Vehicle Outsider';
    if (lower.includes('labor')) return 'Labor Outsider';
    return '';
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
        if (!outsiderId) {
            alert('Invalid Outsider ID');
            router.back();
            return;
        }
        fetchOutsiderDetails();
    }, [outsiderId]);

    const fetchOutsiderDetails = async () => {
        try {
            const res = await fetch(`/api/outsiders/${outsiderId}`);
            const data = await res.json();
            if (data.success) {
                setOutsiderDetails(data.data);
                // Auto-fill customer name
                setForm(prev => ({ ...prev, customerName: data.data?.outsiderName || '' }));
                // Fallback category from fetched outsider if URL param was empty
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

    const isVehicle = resolvedCategory === 'Vehicle Outsider';
    const isLabor = resolvedCategory === 'Labor Outsider';

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
                            {outsiderDetails?.outsiderName || 'Loading...'}
                        </h1>
                        <p className="text-xs md:text-sm font-semibold text-white/80 uppercase tracking-wider mt-1">
                            {resolvedCategory || outsiderDetails?.category || 'Outsider Allocation'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <TripDetailsSection form={form} setForm={setForm} />

                {isVehicle && <VehicleDetailsSection form={form} setForm={setForm} />}
                {isLabor && <LaborDetailsSection form={form} setForm={setForm} />}

                <PaymentDetailsSection form={form} setForm={setForm} />

                {/* Footer Actions */}
                <div className="flex items-center justify-end pt-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting || !form.customerName || form.totalAmount <= 0}
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

