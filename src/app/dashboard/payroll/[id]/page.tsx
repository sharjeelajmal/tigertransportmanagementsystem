import dbConnect from "@/lib/db";
import Staff from "@/models/Staff";
import Advance from "@/models/Advance";
import Payroll from "@/models/Payroll";
import PayrollForm from "./PayrollForm";
import ReceiptView from "./ReceiptView";

export default async function CreatePayrollPage({ params, searchParams }: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ view?: string }>;
}) {
    await dbConnect();
    const { id } = await params;
    const { view } = await searchParams;

    const staffDoc = await Staff.findById(id).lean();

    if (!staffDoc) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <p className="text-gray-400 text-sm font-medium">Staff member not found.</p>
            </div>
        );
    }

    // If view=receipt, find the payroll record and show receipt using shared component
    if (view === "receipt") {
        const payroll = await Payroll.findOne({ staffId: id }).sort({ createdAt: -1 }).lean() as any;

        if (!payroll) {
            return (
                <div className="flex justify-center items-center h-[60vh]">
                    <p className="text-gray-400 text-sm font-medium">No payroll record found for this employee.</p>
                </div>
            );
        }

        const calcOvertimeEarning = (payroll.overtimeHours || 0) * (payroll.overtimeRate || 0);
        const calcAbsentPenalty = (payroll.absentDays || 0) * (payroll.absentFinePerDay || 0);

        return (
            <ReceiptView data={{
                staffFirstName: staffDoc.firstName,
                staffLastName: staffDoc.lastName,
                staffDesignation: staffDoc.designation,
                staffId: id,
                month: payroll.month,
                basicSalary: payroll.basicSalary || 0,
                calcOvertimeEarning,
                bonus: payroll.bonus || 0,
                allowance: payroll.allowance || 0,
                otherEarnings: payroll.otherEarnings || 0,
                calcAbsentPenalty,
                advanceDeduction: payroll.advanceDeduction || 0,
                fine: payroll.fine || 0,
                otherDeductions: payroll.otherDeductions || 0,
                totalEarnings: payroll.totalEarnings || 0,
                totalDeductions: payroll.totalDeductions || 0,
            }} />
        );
    }

    // Default: show PayrollForm for creating payroll
    const pendingAdvances = await Advance.find({
        staffId: id,
        status: "Pending"
    }).select('_id amount').lean() as { _id: any, amount: number }[];

    const totalAmount = pendingAdvances.reduce((sum, adv) => sum + adv.amount, 0);
    const advanceIds = pendingAdvances.map(adv => adv._id.toString());

    const today = new Date();
    const initialMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const staff = {
        _id: staffDoc._id.toString(),
        firstName: staffDoc.firstName,
        lastName: staffDoc.lastName,
        designation: staffDoc.designation,
        photo: staffDoc.photo || "",
        basicSalary: staffDoc.basicSalary || 0
    };

    return (
        <PayrollForm
            staff={staff}
            staffId={id}
            initialAdvanceDeduction={totalAmount}
            advanceIds={advanceIds}
            initialMonth={initialMonth}
        />
    );
}
