interface PaymentDetailsSectionProps {
    form: any;
    setForm: any;
}

const inputCls = "w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--primary)] font-semibold text-gray-700 transition-colors placeholder:text-gray-400";

export default function PaymentDetailsSection({ form, setForm }: PaymentDetailsSectionProps) {
    const total = form.totalAmount || 0;
    const paid = form.paidAmount || 0;
    const remaining = total - paid;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row">
                {/* Left: Section Title */}
                <div className="w-full md:w-48 lg:w-56 flex-shrink-0 bg-gray-50/60 border-b md:border-b-0 md:border-r border-gray-100 px-5 py-6 flex items-start">
                    <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest">Payment details</h2>
                </div>

                {/* Right: Inputs */}
                <div className="flex-1 px-6 py-6 space-y-4">
                    {/* Row 1: Total, Paid, Remaining */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500">Total Amount</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={form.totalAmount || ''}
                                    onChange={(e) => setForm((p: any) => ({ ...p, totalAmount: parseFloat(e.target.value) || 0 }))}
                                    placeholder=""
                                    required
                                    className={`${inputCls} pr-12`}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-gray-400 pointer-events-none">PKR</span>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500">Paid Amount</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={form.paidAmount || ''}
                                    onChange={(e) => setForm((p: any) => ({ ...p, paidAmount: parseFloat(e.target.value) || 0 }))}
                                    placeholder=""
                                    className={`${inputCls} pr-12`}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-gray-400 pointer-events-none">PKR</span>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500">Remaining Amount</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={remaining}
                                    disabled
                                    placeholder=""
                                    className="w-full px-3 py-2.5 bg-red-50/50 border border-red-100 rounded-lg text-sm outline-none font-semibold text-red-500 cursor-not-allowed pr-12"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-red-400 pointer-events-none">PKR</span>
                            </div>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500">Remarks</label>
                        <input
                            type="text"
                            value={form.remarksPayment || ''}
                            onChange={(e) => setForm((p: any) => ({ ...p, remarksPayment: e.target.value }))}
                            placeholder="Remarks"
                            className={inputCls}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
