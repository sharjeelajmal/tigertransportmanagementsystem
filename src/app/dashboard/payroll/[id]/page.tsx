import dbConnect from "@/lib/db";
import Staff from "@/models/Staff";
import Advance from "@/models/Advance";
import PayrollForm from "./PayrollForm";

export default async function CreatePayrollPage({ params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;

    const staffDoc = await Staff.findById(id).lean();

    if (!staffDoc) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <p className="text-gray-400 text-sm font-medium">Staff member not found.</p>
            </div>
        );
    }

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
