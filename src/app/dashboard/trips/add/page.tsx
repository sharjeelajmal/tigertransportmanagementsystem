'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import CustomDropdown from '@/components/CustomDropdown';
import CustomDatePicker from '@/components/CustomDatePicker';
import CustomTimePicker from '@/components/CustomTimePicker';

const tripTypeOptions = [
    { value: 'Inbound', label: 'Inbound' },
    { value: 'Outbound', label: 'Outbound' },
    { value: 'Direct Delivery', label: 'Direct Delivery' },
];

const cargoTypeOptions = [
    { value: 'General', label: 'General' },
    { value: 'Fragile', label: 'Fragile' },
    { value: 'Heavy', label: 'Heavy' },
    { value: 'Other', label: 'Other' },
];

const inputClass = "w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100 focus:border-[var(--primary)] rounded-xl text-sm outline-none transition-all font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-medium";

export default function AddTripPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);

    const [form, setForm] = useState({
        tripType: '', date: '', time: '',
        customerName: '', contactNo: '', emergencyContactNo: '', customerRemarks: '',
        cargoNo: '', cargoType: '', cargoWeight: '', cargoRemarks: '',
        pickupLocation: '',
        vehicle: '', driver: '', helper: '', helperName: '',
    });

    useEffect(() => {
        fetch('/api/vehicles').then(r => r.json()).then(d => { if (d.success) setVehicles(d.data || []); }).catch(() => { });
        fetch('/api/staff').then(r => r.json()).then(d => { if (d.success) setStaff(d.data || []); }).catch(() => { });
    }, []);

    const vehicleOptions = vehicles.map(v => ({ value: v._id, label: `${v.vehicleName || v.vehicleNo || v._id}` }));
    const driverOptions = staff.filter(s => s.designation?.toLowerCase().includes('driver')).map(s => ({ value: s._id, label: `${s.firstName} ${s.lastName}` }));
    const helperOptions = [
        { value: 'Yes', label: 'Yes' },
        { value: 'No', label: 'No' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/trips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                router.back();
            } else {
                alert(data.error || 'Failed to add trip');
            }
        } catch {
            alert('Error adding trip');
        } finally {
            setIsSubmitting(false);
        }
    };

    const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

    return (
        <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto pb-20 p-3 sm:p-4 md:p-8">
            {/* Title */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Add New Trip</h1>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => window.location.href = '/dashboard/invoice?type=inbound'}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#800000] text-white rounded-lg shadow-sm hover:bg-black transition-all text-[10px] font-bold cursor-pointer active:scale-95"
                    >
                        <CheckCircle size={14} /> Inbound Invoice
                    </button>
                    <button
                        type="button"
                        onClick={() => window.location.href = '/dashboard/invoice?type=outbound'}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#800000] text-white rounded-lg shadow-sm hover:bg-black transition-all text-[10px] font-bold cursor-pointer active:scale-95"
                    >
                        <CheckCircle size={14} /> Outbound Invoice
                    </button>
                </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] divide-y divide-gray-100">

                {/* ── 1. Trip Details ── */}
                <div className="p-4 md:p-8 flex flex-col md:flex-row gap-4 md:gap-8">
                    <p className="text-sm font-black text-gray-800 md:w-48 flex-shrink-0 pt-1">Trip Details</p>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ overflow: 'visible' }}>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500">Trip Type</label>
                            <CustomDropdown options={tripTypeOptions} value={form.tripType} onChange={(v) => set('tripType', v)} placeholder="Select Trip Type" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500">Date</label>
                            <CustomDatePicker value={form.date} onChange={(date) => {
                                if (date) {
                                    const yyyy = date.getFullYear();
                                    const mm = String(date.getMonth() + 1).padStart(2, '0');
                                    const dd = String(date.getDate()).padStart(2, '0');
                                    set('date', `${yyyy}-${mm}-${dd}`);
                                }
                            }} />
                        </div>
                        <div className="space-y-1.5 relative z-[100]">
                            <label className="block text-xs font-bold text-gray-500">Time</label>
                            <CustomTimePicker value={form.time} onChange={(t) => set('time', t)} placeholder="Select Time" />
                        </div>
                    </div>
                </div>

                {/* ── 2. Customer Details ── */}
                <div className="p-4 md:p-8 flex flex-col md:flex-row gap-4 md:gap-8">
                    <p className="text-sm font-black text-gray-800 md:w-48 flex-shrink-0 pt-1">Customer Details</p>
                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500">Customer Name</label>
                                <input type="text" value={form.customerName} onChange={(e) => set('customerName', e.target.value)} placeholder="Customer Name" className={inputClass} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500">Contact No.</label>
                                <input type="text" value={form.contactNo} onChange={(e) => set('contactNo', e.target.value)} placeholder="Contact No." className={inputClass} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500">Emergency Contact No.</label>
                                <input type="text" value={form.emergencyContactNo} onChange={(e) => set('emergencyContactNo', e.target.value)} placeholder="Emergency Contact No." className={inputClass} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500">Remarks</label>
                            <input type="text" value={form.customerRemarks} onChange={(e) => set('customerRemarks', e.target.value)} placeholder="Any remarks..." className={inputClass} />
                        </div>
                    </div>
                </div>

                {/* ── 3. Cargo Details ── */}
                <div className="p-4 md:p-8 flex flex-col md:flex-row gap-4 md:gap-8">
                    <p className="text-sm font-black text-gray-800 md:w-48 flex-shrink-0 pt-1">Cargo Details</p>
                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500">Cargo No.</label>
                                <input type="text" value={form.cargoNo} onChange={(e) => set('cargoNo', e.target.value)} placeholder="Cargo No." className={inputClass} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500">Cargo Type</label>
                                <CustomDropdown options={cargoTypeOptions} value={form.cargoType} onChange={(v) => set('cargoType', v)} placeholder="Select Cargo Type" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500">Cargo Weight</label>
                                <input type="text" value={form.cargoWeight} onChange={(e) => set('cargoWeight', e.target.value)} placeholder="e.g. 500 KG" className={inputClass} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500">Remarks</label>
                            <input type="text" value={form.cargoRemarks} onChange={(e) => set('cargoRemarks', e.target.value)} placeholder="Any remarks..." className={inputClass} />
                        </div>
                    </div>
                </div>

                {/* ── 4. Pickup Details ── */}
                <div className="p-4 md:p-8 flex flex-col md:flex-row gap-4 md:gap-8">
                    <p className="text-sm font-black text-gray-800 md:w-48 flex-shrink-0 pt-1">Pickup Details</p>
                    <div className="flex-1">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500">Pickup Location</label>
                            <input type="text" value={form.pickupLocation} onChange={(e) => set('pickupLocation', e.target.value)} placeholder="Enter pickup location" className={inputClass} />
                        </div>
                    </div>
                </div>

                {/* ── 5. Vehicle & Driver Details ── */}
                <div className="p-4 md:p-8 flex flex-col md:flex-row gap-4 md:gap-8">
                    <p className="text-sm font-black text-gray-800 md:w-48 flex-shrink-0 pt-1">Vehicle & Driver Details</p>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500">Select Vehicle</label>
                            <CustomDropdown options={vehicleOptions} value={form.vehicle} onChange={(v) => set('vehicle', v)} placeholder="Select Vehicle" searchable />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500">Select Driver</label>
                            <CustomDropdown options={driverOptions} value={form.driver} onChange={(v) => set('driver', v)} placeholder="Select Driver" searchable />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500">Select Helper</label>
                            <CustomDropdown
                                options={helperOptions}
                                value={form.helper}
                                onChange={(v) => {
                                    set('helper', v);
                                    if (v === 'No') set('helperName', '');
                                }}
                                placeholder="Select Helper"
                            />
                        </div>
                        {form.helper === 'Yes' && (
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-500">Helper Name</label>
                                <input
                                    type="text"
                                    value={form.helperName}
                                    onChange={(e) => set('helperName', e.target.value)}
                                    placeholder="Enter Helper Name"
                                    className={inputClass}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="p-4 md:p-8 flex justify-end">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSubmitting}
                        className="px-8 py-3 rounded-xl text-white text-sm font-black shadow-lg shadow-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                        style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}>
                        {isSubmitting ? "Processing..." : <><CheckCircle size={16} /> Add</>}
                    </motion.button>
                </div>
            </form>
        </div>
    );
}
