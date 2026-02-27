import CustomDatePicker from '@/components/CustomDatePicker';
import CustomTimePicker from '@/components/CustomTimePicker';

interface TripDetailsSectionProps {
    form: any;
    setForm: any;
}

const inputCls = "w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[var(--primary)] font-semibold text-gray-700 transition-colors placeholder:text-gray-400";

export default function TripDetailsSection({ form, setForm }: TripDetailsSectionProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col md:flex-row">
                {/* Left: Section Title */}
                <div className="w-full md:w-48 lg:w-56 flex-shrink-0 bg-gray-50/60 border-b md:border-b-0 md:border-r border-gray-100 px-5 py-6 flex items-start">
                    <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest">Trip Details</h2>
                </div>

                {/* Right: Inputs */}
                <div className="flex-1 px-6 py-6 space-y-4">
                    {/* Row 1: Customer Name, Trip Date, Trip Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500">Customer Name</label>
                            <input
                                type="text"
                                value={form.customerName}
                                onChange={(e) => setForm((p: any) => ({ ...p, customerName: e.target.value }))}
                                placeholder="Customer Name"
                                className={inputCls}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500">Trip Date</label>
                            <CustomDatePicker
                                value={form.tripDate}
                                onChange={(date) => {
                                    if (date) {
                                        const yyyy = date.getFullYear();
                                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                                        const dd = String(date.getDate()).padStart(2, '0');
                                        setForm((p: any) => ({ ...p, tripDate: `${yyyy}-${mm}-${dd}` }));
                                    }
                                }}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500">Trip Time</label>
                            <CustomTimePicker
                                value={form.tripTime || ''}
                                onChange={(time) => setForm((p: any) => ({ ...p, tripTime: time }))}
                                placeholder="00 : 00"
                            />
                        </div>
                    </div>

                    {/* Row 2: Pickup Location */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500">Pickup Location</label>
                        <input
                            type="text"
                            value={form.pickupLocation || ''}
                            onChange={(e) => setForm((p: any) => ({ ...p, pickupLocation: e.target.value }))}
                            placeholder="Pickup Location"
                            className={inputCls}
                        />
                    </div>

                    {/* Row 3: Drop Location */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500">Drop Location</label>
                        <input
                            type="text"
                            value={form.dropLocation || ''}
                            onChange={(e) => setForm((p: any) => ({ ...p, dropLocation: e.target.value }))}
                            placeholder="Drop Location"
                            className={inputCls}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
