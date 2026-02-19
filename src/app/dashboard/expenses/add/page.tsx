"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Receipt, Save } from "lucide-react";
import CustomDropdown from "@/components/CustomDropdown";
import CustomDatePicker from "@/components/CustomDatePicker";
import Loader from "@/components/Loader";

const categoryOptions = [
    { value: "Vehicle Expense", label: "Vehicle Expense" },
    { value: "Office Expense", label: "Office Expense" },
];

const vehicleExpenseTypes = [
    { value: "Fuel", label: "Fuel" },
    { value: "Tire Change", label: "Tire Change" },
    { value: "Maintenance", label: "Maintenance" },
    { value: "Repair", label: "Repair" },
    { value: "Washing", label: "Washing" },
    { value: "Other", label: "Other" },
];

const officeExpenseTypes = [
    { value: "Electricity Bill", label: "Electricity Bill" },
    { value: "Water Bill", label: "Water Bill" },
    { value: "Rent", label: "Rent" },
    { value: "Stationery", label: "Stationery" },
    { value: "Internet", label: "Internet" },
    { value: "Other", label: "Other" },
];

const paymentMethodOptions = [
    { value: "Cash", label: "Cash" },
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "Cheque", label: "Cheque" },
    { value: "Online", label: "Online" },
];

const statusOptions = [
    { value: "Paid", label: "Paid" },
    { value: "Unpaid", label: "Unpaid" },
    { value: "Partial Paid", label: "Partial Paid" },
];

type Category = "Vehicle Expense" | "Office Expense";

const inputCls =
    "w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium text-gray-800 placeholder-gray-300 outline-none transition-all focus:border-[#B50104] focus:shadow-[0_0_0_4px_rgba(181,1,4,0.07)]";

export default function AddExpensePage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const [category, setCategory] = useState<Category>("Vehicle Expense");
    const [date, setDateVal] = useState("");
    const [expenseType, setExpenseType] = useState("");

    // Vehicle fields
    const [vehicleNo, setVehicleNo] = useState("");
    const [driverName, setDriverName] = useState("");
    const [helperName, setHelperName] = useState("");
    const [route, setRoute] = useState("");

    // Office fields
    const [amountGivenTo, setAmountGivenTo] = useState("");

    // Shared
    const [remarks, setRemarks] = useState("");

    // Payment
    const [totalAmount, setTotalAmount] = useState("");
    const [paidAmount, setPaidAmount] = useState("");
    const [remainingAmount, setRemainingAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [status, setStatus] = useState<"Paid" | "Unpaid" | "Partial Paid">("Unpaid");

    const handleCategoryChange = (val: string) => {
        setCategory(val as Category);
        setExpenseType(""); // reset type on change
    };

    const handleTotalChange = (val: string) => {
        setTotalAmount(val);
        const total = Number(val) || 0;
        const paid = Number(paidAmount) || 0;
        setRemainingAmount(String(total - paid));
    };

    const handlePaidChange = (val: string) => {
        setPaidAmount(val);
        const total = Number(totalAmount) || 0;
        const paid = Number(val) || 0;
        setRemainingAmount(String(total - paid));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !expenseType || !totalAmount) {
            alert("Date, Expense Type aur Total Amount zaroor fill karein");
            return;
        }
        setIsSaving(true);
        try {
            const payload: any = {
                date,
                category,
                expenseType,
                remarks,
                totalAmount: Number(totalAmount),
                paidAmount: Number(paidAmount) || 0,
                remainingAmount: Number(remainingAmount) || 0,
                paymentMethod,
                status,
            };
            if (category === "Vehicle Expense") {
                payload.vehicleNo = vehicleNo;
                payload.driverName = driverName;
                payload.helperName = helperName;
                payload.route = route;
            } else {
                payload.amountGivenTo = amountGivenTo;
            }

            const res = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                router.push("/dashboard/expenses");
            } else {
                alert(data.error || "Save karne mein error");
            }
        } catch {
            alert("Network error");
        } finally {
            setIsSaving(false);
        }
    };

    const expenseTypes = category === "Vehicle Expense" ? vehicleExpenseTypes : officeExpenseTypes;

    return (
        <div className="max-w-4xl mx-auto pb-10 space-y-0">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-6"
            >
                <button
                    onClick={() => router.back()}
                    className="w-9 h-9 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#B50104] hover:text-[#B50104] transition-all cursor-pointer flex-shrink-0"
                    style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                >
                    <ArrowLeft size={17} />
                </button>
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                        Add New Expense
                    </h1>
                    <p className="text-gray-400 text-xs mt-0.5">Fill in the details below</p>
                </div>
            </motion.div>

            <form onSubmit={handleSubmit}>
                {/* Main Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="bg-white rounded-2xl border border-gray-100"
                    style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}
                >
                    {/* ── Section 1: Expense Category ── */}
                    <FormSection label="Expense Category" index={0}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CustomDropdown
                                label="Expense Category"
                                options={categoryOptions}
                                value={category}
                                onChange={handleCategoryChange}
                            />
                            <div>
                                <CustomDatePicker
                                    label="Date"
                                    required
                                    value={date}
                                    onChange={(d: Date) => {
                                        const yyyy = d.getFullYear();
                                        const mm = String(d.getMonth() + 1).padStart(2, "0");
                                        const dd = String(d.getDate()).padStart(2, "0");
                                        setDateVal(`${yyyy}-${mm}-${dd}`);
                                    }}
                                />
                            </div>
                        </div>
                    </FormSection>

                    {/* ── Section 2: Vehicle & Route Details (Vehicle Expense only) ── */}
                    {category === "Vehicle Expense" && (
                        <FormSection label="Vehicle & Route Details" index={1}>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Field label="Vehicle No.">
                                    <input className={inputCls} placeholder="e.g. ABC-123" value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} />
                                </Field>
                                <Field label="Driver Name">
                                    <input className={inputCls} placeholder="Driver name" value={driverName} onChange={e => setDriverName(e.target.value)} />
                                </Field>
                                <Field label="Helper Name">
                                    <input className={inputCls} placeholder="Helper name" value={helperName} onChange={e => setHelperName(e.target.value)} />
                                </Field>
                            </div>
                            <div className="mt-4">
                                <Field label="Route">
                                    <input className={inputCls} placeholder="Route details" value={route} onChange={e => setRoute(e.target.value)} />
                                </Field>
                            </div>
                        </FormSection>
                    )}

                    {/* ── Section 3: Expense Details ── */}
                    <FormSection label="Expense Details" index={category === "Vehicle Expense" ? 2 : 1}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CustomDropdown
                                label="Expense"
                                options={expenseTypes}
                                value={expenseType}
                                onChange={setExpenseType}
                            />
                            {category === "Office Expense" && (
                                <Field label="Amount Given To">
                                    <input className={inputCls} placeholder="Person/vendor name" value={amountGivenTo} onChange={e => setAmountGivenTo(e.target.value)} />
                                </Field>
                            )}
                        </div>
                        <div className="mt-4">
                            <Field label="Remarks">
                                <input className={inputCls} placeholder="Optional remarks" value={remarks} onChange={e => setRemarks(e.target.value)} />
                            </Field>
                        </div>
                    </FormSection>

                    {/* ── Section 4: Payment ── */}
                    <FormSection label="Payment" index={category === "Vehicle Expense" ? 3 : 2} isLast>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Field label="Total Amount *">
                                <input
                                    type="number"
                                    className={inputCls}
                                    placeholder="0"
                                    value={totalAmount}
                                    onChange={e => handleTotalChange(e.target.value)}
                                    required
                                />
                            </Field>
                            <Field label="Paid Amount">
                                <input
                                    type="number"
                                    className={inputCls}
                                    placeholder="0"
                                    value={paidAmount}
                                    onChange={e => handlePaidChange(e.target.value)}
                                />
                            </Field>
                            <Field label="Remaining Amount">
                                <input
                                    type="number"
                                    className={inputCls}
                                    placeholder="0"
                                    value={remainingAmount}
                                    readOnly
                                    style={{ background: "#F9FAFB", color: "#6B7280" }}
                                />
                            </Field>
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CustomDropdown
                                label="Payment Method"
                                options={paymentMethodOptions}
                                value={paymentMethod}
                                onChange={setPaymentMethod}
                            />
                            <CustomDropdown
                                label="Status"
                                options={statusOptions}
                                value={status}
                                onChange={(v) => setStatus(v as any)}
                            />
                        </div>
                    </FormSection>
                </motion.div>

                {/* Submit Row */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="flex justify-end mt-5"
                >
                    <motion.button
                        type="submit"
                        disabled={isSaving}
                        whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(181,1,4,0.35)" }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold shadow-lg disabled:opacity-60 cursor-pointer"
                        style={{ background: "linear-gradient(135deg, #B50104, #8B0003)" }}
                    >
                        {isSaving ? (
                            <><Loader size="sm" /> Saving...</>
                        ) : (
                            <><Save size={16} /> Add</>
                        )}
                    </motion.button>
                </motion.div>
            </form>
        </div>
    );
}

// ── Helper components ──
function FormSection({
    label, children, index, isLast,
}: { label: string; children: React.ReactNode; index: number; isLast?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.06 }}
            className={`grid grid-cols-1 sm:grid-cols-[170px_1fr] ${!isLast ? "border-b border-gray-100" : ""}`}
        >
            {/* Label */}
            <div className="px-5 py-5 sm:py-6 border-b sm:border-b-0 sm:border-r border-gray-100 flex items-start">
                <span className="text-sm font-bold text-gray-700 leading-tight">{label}</span>
            </div>
            {/* Content */}
            <div className="px-5 py-5 sm:py-6">{children}</div>
        </motion.div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                {label}
            </label>
            {children}
        </div>
    );
}
