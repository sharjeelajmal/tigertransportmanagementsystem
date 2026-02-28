import { Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VehicleDetailsSectionProps {
    form: any;
    setForm: any;
    showAddLabor?: boolean;
}

const inputCls = "w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--primary)] font-semibold text-gray-700 transition-colors placeholder:text-gray-400";

export default function VehicleDetailsSection({ form, setForm, showAddLabor = false }: VehicleDetailsSectionProps) {
    const vehicles = form.vehicles || [];

    const addVehicle = () => {
        const updated = [...vehicles, { vehicleName: '', vehicleNo: '', driverName: '' }];
        setForm((p: any) => ({ ...p, vehicles: updated }));
    };

    const removeVehicle = (index: number) => {
        const updated = vehicles.filter((_: any, i: number) => i !== index);
        setForm((p: any) => ({ ...p, vehicles: updated }));
    };

    const updateVehicle = (index: number, field: string, value: string) => {
        const updated = vehicles.map((v: any, i: number) => i === index ? { ...v, [field]: value } : v);
        setForm((p: any) => ({ ...p, vehicles: updated }));
    };

    const toggleLabor = () => {
        setForm((p: any) => ({ ...p, showLaborInVehicle: !p.showLaborInVehicle }));
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row">
                {/* Left: Section Title */}
                <div className="w-full md:w-48 lg:w-56 flex-shrink-0 bg-gray-50/60 border-b md:border-b-0 md:border-r border-gray-100 px-5 py-6 flex items-start">
                    <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest">Vehicle Details</h2>
                </div>

                {/* Right: Inputs */}
                <div className="flex-1 px-6 py-6 space-y-4">
                    <AnimatePresence>
                        {vehicles.map((v: any, index: number) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                className="space-y-2"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="space-y-1.5">
                                        {index === 0 && <label className="block text-xs font-bold text-gray-500">Vehicle Name</label>}
                                        <input
                                            type="text"
                                            placeholder="Vehicle Name"
                                            value={v.vehicleName}
                                            onChange={(e) => updateVehicle(index, 'vehicleName', e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        {index === 0 && <label className="block text-xs font-bold text-gray-500">Vehicle Plate No.</label>}
                                        <input
                                            type="text"
                                            placeholder="Vehicle Plate No."
                                            value={v.vehicleNo}
                                            onChange={(e) => updateVehicle(index, 'vehicleNo', e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        {index === 0 && <label className="block text-xs font-bold text-gray-500">Driver Name</label>}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Driver Name"
                                                value={v.driverName || ''}
                                                onChange={(e) => updateVehicle(index, 'driverName', e.target.value)}
                                                className={`${inputCls} flex-1`}
                                            />
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeVehicle(index)}
                                                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Add More / Add Labor Buttons */}
                    <div className="flex items-center justify-between pt-1">
                        <button
                            type="button"
                            onClick={addVehicle}
                            className="bg-[var(--primary)] text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-all flex items-center gap-1 cursor-pointer"
                        >
                            <Plus size={14} /> Add More
                        </button>
                        {showAddLabor && (
                            <button
                                type="button"
                                onClick={toggleLabor}
                                className="bg-[var(--primary)] text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-all flex items-center gap-1 cursor-pointer"
                            >
                                <Plus size={14} /> Add Labor
                            </button>
                        )}
                    </div>

                    {/* Optional Labor Section */}
                    {form.showLaborInVehicle && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-1.5 pt-2"
                        >
                            <label className="block text-xs font-bold text-gray-500">Names of Laborers</label>
                            <input
                                type="text"
                                value={form.laborNames || ''}
                                onChange={(e) => setForm((p: any) => ({ ...p, laborNames: e.target.value }))}
                                placeholder="Enter names, comma separated"
                                className={inputCls}
                            />
                        </motion.div>
                    )}

                    {/* Remarks */}
                    <div className="space-y-1.5 pt-1">
                        <label className="block text-xs font-bold text-gray-500">Remarks</label>
                        <input
                            type="text"
                            value={form.remarksVehicle || ''}
                            onChange={(e) => setForm((p: any) => ({ ...p, remarksVehicle: e.target.value }))}
                            placeholder="Remarks"
                            className={inputCls}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
