import { Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpecializedDetailsSectionProps {
    form: any;
    setForm: any;
    category: string;
}

export default function SpecializedDetailsSection({ form, setForm, category }: SpecializedDetailsSectionProps) {
    const isVehicle = category === 'Vehicle Outsider' || category === 'Both';
    const isLabor = category === 'Labor Outsider' || category === 'Both';

    const addVehicle = () => {
        setForm({
            ...form,
            vehicles: [...form.vehicles, { vehicleName: '', vehicleNo: '' }],
            vehicleQty: form.vehicleQty + 1
        });
    };

    const removeVehicle = (index: number) => {
        const newVehicles = [...form.vehicles];
        newVehicles.splice(index, 1);
        setForm({ ...form, vehicles: newVehicles, vehicleQty: form.vehicleQty - 1 });
    };

    const updateVehicle = (index: number, field: string, value: string) => {
        const newVehicles = [...form.vehicles];
        newVehicles[index][field] = value;
        setForm({ ...form, vehicles: newVehicles });
    };

    const addLabor = () => {
        setForm({
            ...form,
            labors: [...form.labors, { laborName: '' }],
            laborQty: form.laborQty + 1
        });
    };

    const removeLabor = (index: number) => {
        const newLabors = [...form.labors];
        newLabors.splice(index, 1);
        setForm({ ...form, labors: newLabors, laborQty: form.laborQty - 1 });
    };

    const updateLabor = (index: number, value: string) => {
        const newLabors = [...form.labors];
        newLabors[index].laborName = value;
        setForm({ ...form, labors: newLabors });
    };

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 space-y-6">
            <h2 className="text-lg font-black text-gray-800 border-b border-gray-100 pb-4">
                2. Specialized Details
            </h2>

            {isVehicle && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Vehicle Details</label>
                        <button
                            type="button"
                            onClick={addVehicle}
                            className="text-[var(--primary)] text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            <Plus size={14} /> Add Vehicle
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <AnimatePresence>
                            {form.vehicles.map((v: any, index: number) => (
                                <motion.div
                                    key={`v-${index}`}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex gap-4 items-center bg-gray-50 p-3 rounded-xl border border-gray-100"
                                >
                                    <div className="flex-1 space-y-1">
                                        <input
                                            type="text"
                                            placeholder="Vehicle Name / Type"
                                            value={v.vehicleName}
                                            onChange={(e) => updateVehicle(index, 'vehicleName', e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--primary)] font-semibold text-gray-800"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <input
                                            type="text"
                                            placeholder="Vehicle No (e.g. ABC-123)"
                                            value={v.vehicleNo}
                                            onChange={(e) => updateVehicle(index, 'vehicleNo', e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--primary)] font-semibold text-gray-800"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeVehicle(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {isLabor && (
                <div className="space-y-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center justify-between">
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Labor Details</label>
                        <button
                            type="button"
                            onClick={addLabor}
                            className="text-[var(--primary)] text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            <Plus size={14} /> Add Labor
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <AnimatePresence>
                            {form.labors.map((l: any, index: number) => (
                                <motion.div
                                    key={`l-${index}`}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex gap-2 items-center bg-gray-50 p-2 rounded-xl border border-gray-100"
                                >
                                    <input
                                        type="text"
                                        placeholder={`Laborer ${index + 1} Name`}
                                        value={l.laborName}
                                        onChange={(e) => updateLabor(index, e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--primary)] font-semibold text-gray-800"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeLabor(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
}
