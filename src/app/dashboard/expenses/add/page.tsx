"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Plus, Settings2 } from "lucide-react";
import CustomDropdown from "@/components/CustomDropdown";
import CustomDatePicker from "@/components/CustomDatePicker";
import Loader from "@/components/Loader";
import ManageCategoriesModal, { CategoryItem } from "@/components/expenses/ManageCategoriesModal";
import ManageExpenseTypesModal from "@/components/expenses/ManageExpenseTypesModal";

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

const inputCls =
    "w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium text-gray-800 placeholder-gray-300 outline-none transition-all focus:border-[var(--primary)] focus:shadow-[0_0_0_4px_rgba(var(--primary-rgb, 181,1,4),0.07)]";

export default function AddExpensePage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [category, setCategory] = useState<string>("Vehicle Expense");
    const [date, setDateVal] = useState("");
    const [expenseType, setExpenseType] = useState("");

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

    // Vehicle fields
    const [vehicleNo, setVehicleNo] = useState("");
    const [driverName, setDriverName] = useState("");
    const [helperName, setHelperName] = useState("");
    const [route, setRoute] = useState("");

    // Office / General fields
    const [amountGivenTo, setAmountGivenTo] = useState("");

    // Shared
    const [remarks, setRemarks] = useState("");

    // Payment
    const [totalAmount, setTotalAmount] = useState("");
    const [paidAmount, setPaidAmount] = useState("");
    const [remainingAmount, setRemainingAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [status, setStatus] = useState<"Paid" | "Unpaid" | "Partial Paid">("Unpaid");

    const fetchCategories = async (selectName?: string) => {
        try {
            const res = await fetch("/api/expenses/categories");
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setCategories(data.data);
                if (selectName) {
                    setCategory(selectName);
                    setExpenseType("");
                } else if (data.data.length > 0) {
                    const exists = data.data.some((c: CategoryItem) => c.name === category);
                    if (!exists) {
                        setCategory(data.data[0].name);
                        setExpenseType("");
                    }
                }
            }
        } catch (error) {
            console.error("Failed to load categories:", error);
        } finally {
            setIsLoadingCategories(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCategoryChange = (val: string) => {
        setCategory(val);
        setExpenseType("");
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
        if (!date || !category || !expenseType || !totalAmount) {
            alert("Date, Category, Expense Type aur Total Amount zaroor fill karein");
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

    const categoryOptions = categories.map((c) => ({
        value: c.name,
        label: c.name,
    }));

    const currentCatObj = categories.find((c) => c.name === category);
    const expenseTypeOptions = (currentCatObj?.subtypes || []).map((t) => ({
        value: t,
        label: t,
    }));

    const isVehicleExpense = category === "Vehicle Expense";

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
                    className="w-9 h-9 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all cursor-pointer flex-shrink-0"
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
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Expense Category
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setIsCategoryModalOpen(true)}
                                        className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer transition-all"
                                    >
                                        <Settings2 size={13} />
                                        <span>Manage / Add</span>
                                    </button>
                                </div>
                                <CustomDropdown
                                    options={categoryOptions}
                                    value={category}
                                    onChange={handleCategoryChange}
                                    isLoading={isLoadingCategories}
                                />
                            </div>
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
                    {isVehicleExpense && (
                        <FormSection label="Vehicle & Route Details" index={1}>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Field label="Vehicle No.">
                                    <input
                                        className={inputCls}
                                        placeholder="e.g. ABC-123"
                                        value={vehicleNo}
                                        onChange={(e) => setVehicleNo(e.target.value)}
                                    />
                                </Field>
                                <Field label="Driver Name">
                                    <input
                                        className={inputCls}
                                        placeholder="Driver name"
                                        value={driverName}
                                        onChange={(e) => setDriverName(e.target.value)}
                                    />
                                </Field>
                                <Field label="Helper Name">
                                    <input
                                        className={inputCls}
                                        placeholder="Helper name"
                                        value={helperName}
                                        onChange={(e) => setHelperName(e.target.value)}
                                    />
                                </Field>
                            </div>
                            <div className="mt-4">
                                <Field label="Route">
                                    <input
                                        className={inputCls}
                                        placeholder="Route details"
                                        value={route}
                                        onChange={(e) => setRoute(e.target.value)}
                                    />
                                </Field>
                            </div>
                        </FormSection>
                    )}

                    {/* ── Section 3: Expense Details ── */}
                    <FormSection label="Expense Details" index={isVehicleExpense ? 2 : 1}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Expense Type *
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setIsTypeModalOpen(true)}
                                        className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer transition-all"
                                    >
                                        <Plus size={13} />
                                        <span>Manage / Add Types</span>
                                    </button>
                                </div>
                                <CustomDropdown
                                    options={expenseTypeOptions}
                                    value={expenseType}
                                    onChange={setExpenseType}
                                    placeholder="Select expense type"
                                />
                            </div>

                            {!isVehicleExpense && (
                                <Field label="Amount Given To">
                                    <input
                                        className={inputCls}
                                        placeholder="Person or vendor name"
                                        value={amountGivenTo}
                                        onChange={(e) => setAmountGivenTo(e.target.value)}
                                    />
                                </Field>
                            )}
                        </div>
                        <div className="mt-4">
                            <Field label="Remarks">
                                <input
                                    className={inputCls}
                                    placeholder="Optional remarks"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </Field>
                        </div>
                    </FormSection>

                    {/* ── Section 4: Payment ── */}
                    <FormSection label="Payment" index={isVehicleExpense ? 3 : 2} isLast>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Field label="Total Amount *">
                                <input
                                    type="number"
                                    className={inputCls}
                                    placeholder="0"
                                    value={totalAmount}
                                    onChange={(e) => handleTotalChange(e.target.value)}
                                    required
                                />
                            </Field>
                            <Field label="Paid Amount">
                                <input
                                    type="number"
                                    className={inputCls}
                                    placeholder="0"
                                    value={paidAmount}
                                    onChange={(e) => handlePaidChange(e.target.value)}
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
                                direction="up"
                            />
                            <CustomDropdown
                                label="Status"
                                options={statusOptions}
                                value={status}
                                onChange={(v) => setStatus(v as any)}
                                direction="up"
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
                        whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(var(--primary-rgb, 181,1,4),0.35)" }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold shadow-lg disabled:opacity-60 cursor-pointer"
                        style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
                    >
                        {isSaving ? (
                            <><Loader size="sm" /> Saving...</>
                        ) : (
                            <><Save size={16} /> Add</>
                        )}
                    </motion.button>
                </motion.div>
            </form>

            {/* Modals */}
            <ManageCategoriesModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                categories={categories}
                onCategoriesChanged={async (newlyCreated) => {
                    await fetchCategories(newlyCreated);
                }}
            />

            <ManageExpenseTypesModal
                isOpen={isTypeModalOpen}
                onClose={() => setIsTypeModalOpen(false)}
                activeCategoryName={category}
                categories={categories}
                onTypesChanged={async (newlyCreated) => {
                    await fetchCategories();
                    if (newlyCreated) {
                        setExpenseType(newlyCreated);
                    }
                }}
            />
        </div>
    );
}

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
            <div className="px-5 py-5 sm:py-6 border-b sm:border-b-0 sm:border-r border-gray-100 flex items-start">
                <span className="text-sm font-bold text-gray-700 leading-tight">{label}</span>
            </div>
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
