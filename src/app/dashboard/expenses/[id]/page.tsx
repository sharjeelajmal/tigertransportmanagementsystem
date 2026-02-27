"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import Loader from "@/components/Loader";
import InfoCard from "@/components/staff/InfoCard";
import EditModal from "@/components/staff/EditModal";
import DeleteModal from "@/components/DeleteModal";
import ProfileHeader from "@/components/staff/ProfileHeader";
import { useAuth } from "@/context/AuthContext";

interface Expense {
    _id: string;
    date: string;
    category: "Vehicle Expense" | "Office Expense";
    expenseType: string;
    vehicleNo?: string;
    driverName?: string;
    helperName?: string;
    route?: string;
    amountGivenTo?: string;
    remarks?: string;
    totalAmount: number;
    paidAmount?: number;
    remainingAmount?: number;
    paymentMethod?: string;
    status: "Paid" | "Unpaid" | "Partial Paid";
}

function fmt(d?: string) {
    if (!d) return "—";
    const parts = d.split("-");
    if (parts.length !== 3) return d;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Status badge — always white text (readable on red bg AND on white bg)
function StatusBadge({ status }: { status: string }) {
    const bgMap: Record<string, string> = {
        Paid: "rgba(255,255,255,0.25)",
        Unpaid: "rgba(255,255,255,0.15)",
        "Partial Paid": "rgba(255,255,255,0.20)",
    };
    return (
        <span
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-white border border-white/30"
            style={{ background: bgMap[status] || bgMap["Unpaid"], backdropFilter: "blur(4px)" }}
        >
            {status}
        </span>
    );
}

export default function ExpenseProfilePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const { isManager } = useAuth();

    const [expense, setExpense] = useState<Expense | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editSection, setEditSection] = useState("");
    const [editFields, setEditFields] = useState<any[]>([]);

    const fetchExpense = async () => {
        try {
            const res = await fetch(`/api/expenses/${id}`);
            const data = await res.json();
            if (data.success) setExpense(data.data);
            else router.push("/dashboard/expenses");
        } catch { router.push("/dashboard/expenses"); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { if (id) fetchExpense(); }, [id]);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) router.push("/dashboard/expenses");
            else alert("Delete failed");
        } catch { alert("Network error"); }
        finally { setIsDeleting(false); }
    };

    const handleEdit = (section: string) => {
        setEditSection(section);
        let fields: any[] = [];
        if (section === "Expense Details") {
            fields = [
                { name: "date", label: "Date", type: "date", value: expense?.date },
                { name: "expenseType", label: "Expense Type", value: expense?.expenseType },
                { name: "remarks", label: "Remarks", value: expense?.remarks },
            ];
        } else if (section === "Vehicle & Route Details") {
            fields = [
                { name: "vehicleNo", label: "Vehicle No.", value: expense?.vehicleNo },
                { name: "driverName", label: "Driver Name", value: expense?.driverName },
                { name: "helperName", label: "Helper Name", value: expense?.helperName },
                { name: "route", label: "Route", value: expense?.route },
            ];
        } else if (section === "Office Expense Details") {
            fields = [
                { name: "amountGivenTo", label: "Amount Given To", value: expense?.amountGivenTo },
                { name: "remarks", label: "Remarks", value: expense?.remarks },
            ];
        } else if (section === "Payment Details") {
            fields = [
                { name: "totalAmount", label: "Total Amount", type: "number", value: expense?.totalAmount },
                { name: "paidAmount", label: "Paid Amount", type: "number", value: expense?.paidAmount },
                { name: "remainingAmount", label: "Remaining Amount", type: "number", value: expense?.remainingAmount },
                { name: "paymentMethod", label: "Payment Method", type: "select", options: ["Cash", "Bank Transfer", "Cheque", "Online"], value: expense?.paymentMethod },
                { name: "status", label: "Status", type: "select", options: ["Paid", "Unpaid", "Partial Paid"], value: expense?.status },
            ];
        }
        setEditFields(fields);
        setIsEditModalOpen(true);
    };

    const handleSave = async (updatedData: any) => {
        const res = await fetch(`/api/expenses/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
        });
        if (res.ok) { await fetchExpense(); setIsEditModalOpen(false); }
    };

    if (isLoading) return <Loader fullScreen />;
    if (!expense) return null;

    const isVehicle = expense.category === "Vehicle Expense";

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto relative">
            {/* ProfileHeader — same as staff/vehicle */}
            <div className="relative">
                <ProfileHeader
                    firstName={expense.expenseType}
                    lastName=""
                    designation={expense.category}
                    photo={undefined}
                />
                {/* Delete button overlayed on header top-right */}
                {!isManager && (
                    <button
                        onClick={() => setShowDelete(true)}
                        className="absolute top-6 right-6 md:top-8 md:right-8 z-20 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500/40 transition-all cursor-pointer border border-white/20"
                    >
                        <Trash2 size={16} />
                    </button>
                )}

                {/* Status badge + Amount overlayed bottom-right */}
                <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-20 flex flex-col items-end gap-2">
                    <StatusBadge status={expense.status} />
                    <p className="text-white font-black text-2xl md:text-3xl leading-none">
                        {expense.totalAmount.toLocaleString()}/-
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Expense Details */}
                <InfoCard
                    title="Expense Details"
                    columns={1}
                    delay={0.1}
                    onEdit={() => handleEdit("Expense Details")}
                    items={[
                        { label: "Date", value: fmt(expense.date) },
                        { label: "Category", value: expense.category },
                        { label: "Expense Type", value: expense.expenseType },
                        { label: "Remarks", value: expense.remarks || "—" },
                    ]}
                />

                {/* Payment Details */}
                <InfoCard
                    title="Payment Details"
                    columns={1}
                    delay={0.2}
                    onEdit={() => handleEdit("Payment Details")}
                    items={[
                        { label: "Total Amount", value: `${expense.totalAmount.toLocaleString()} PKR` },
                        { label: "Paid Amount", value: `${(expense.paidAmount || 0).toLocaleString()} PKR` },
                        { label: "Remaining Amount", value: `${(expense.remainingAmount || 0).toLocaleString()} PKR` },
                        { label: "Payment Method", value: expense.paymentMethod || "—" },
                        { label: "Status", value: expense.status },
                    ]}
                />
            </div>

            {/* Vehicle & Route Details */}
            {isVehicle && (
                <InfoCard
                    title="Vehicle & Route Details"
                    columns={2}
                    delay={0.3}
                    onEdit={() => handleEdit("Vehicle & Route Details")}
                    items={[
                        { label: "Vehicle No.", value: expense.vehicleNo || "—" },
                        { label: "Driver Name", value: expense.driverName || "—" },
                        { label: "Helper Name", value: expense.helperName || "—" },
                        { label: "Route", value: expense.route || "—" },
                    ]}
                />
            )}

            {/* Office Expense Details */}
            {!isVehicle && (
                <InfoCard
                    title="Office Expense Details"
                    columns={2}
                    delay={0.3}
                    onEdit={() => handleEdit("Office Expense Details")}
                    items={[
                        { label: "Amount Given To", value: expense.amountGivenTo || "—" },
                        { label: "Remarks", value: expense.remarks || "—" },
                    ]}
                />
            )}

            <EditModal
                isOpen={isEditModalOpen}
                title={editSection}
                fields={editFields}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSave}
            />

            <DeleteModal
                isOpen={showDelete}
                title="Delete Expense"
                description={`"${expense.expenseType}" expense permanently delete karna chahte hain? Yeh action undo nahi ho sakta.`}
                onClose={() => setShowDelete(false)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
}
