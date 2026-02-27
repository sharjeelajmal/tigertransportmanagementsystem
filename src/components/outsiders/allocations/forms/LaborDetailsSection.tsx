interface LaborDetailsSectionProps {
    form: any;
    setForm: any;
}

const inputCls = "w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--primary)] font-semibold text-gray-700 transition-colors placeholder:text-gray-400";

export default function LaborDetailsSection({ form, setForm }: LaborDetailsSectionProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row">
                {/* Left: Section Title */}
                <div className="w-full md:w-48 lg:w-56 flex-shrink-0 bg-gray-50/60 border-b md:border-b-0 md:border-r border-gray-100 px-5 py-6 flex items-start">
                    <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest">Labor Details</h2>
                </div>

                {/* Right: Inputs */}
                <div className="flex-1 px-6 py-6 space-y-4">
                    {/* Row 1: No. of Laborers + Names */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500">No. of Laborers</label>
                            <input
                                type="number"
                                value={form.laborQty || ''}
                                onChange={(e) => setForm((p: any) => ({ ...p, laborQty: parseInt(e.target.value) || 0 }))}
                                placeholder="0"
                                min="0"
                                className={inputCls}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500">Names of Laborers</label>
                            <input
                                type="text"
                                value={form.laborNames || ''}
                                onChange={(e) => setForm((p: any) => ({ ...p, laborNames: e.target.value }))}
                                placeholder="Names, comma separated"
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500">Remarks</label>
                        <input
                            type="text"
                            value={form.remarksLabor || ''}
                            onChange={(e) => setForm((p: any) => ({ ...p, remarksLabor: e.target.value }))}
                            placeholder="Remarks"
                            className={inputCls}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
