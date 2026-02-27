import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Staff from "@/models/Staff";
import Payroll from "@/models/Payroll";
import Advance from "@/models/Advance";

// Helper function to format month as YYYY-MM
const getCurrentMonthString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export async function GET(req: Request) {
    console.log("[API/PAYROLL] Starting request...");
    try {
        console.log("[API/PAYROLL] Connecting to DB...");
        await connectDB();
        console.log("[API/PAYROLL] Connected to DB!");

        const { searchParams } = new URL(req.url);
        const monthParam = searchParams.get("month");
        const targetMonth = monthParam || getCurrentMonthString();

        console.log(`[API/PAYROLL] Fetching remote DB data in parallel for month: ${targetMonth}...`);
        const [staffList, payrolls, pendingAdvances] = await Promise.all([
            Staff.find({ status: "On Duty" }).select('_id firstName lastName mobile designation basicSalary').lean(),
            Payroll.find({ month: targetMonth }).select('staffId netSalary').lean(),
            Advance.find({ status: "Pending" }).select('staffId amount').lean()
        ]);
        console.log(`[API/PAYROLL] Parallel fetch complete. Staff: ${staffList.length}, Payrolls: ${payrolls.length}, Advances: ${pendingAdvances.length}`);

        const payrollMap = new Map((payrolls as any[]).map(p => [p.staffId.toString(), p]));

        // Group advances by staffId
        const advanceMap = pendingAdvances.reduce((acc, adv) => {
            const sid = adv.staffId.toString();
            acc[sid] = (acc[sid] || 0) + adv.amount;
            return acc;
        }, {} as Record<string, number>);

        // 4. Combine data for the payroll list page
        const result = staffList.map(staff => {
            const payroll = payrollMap.get(staff._id.toString());
            const pendingAdvance = advanceMap[staff._id.toString()] || 0;

            return {
                id: staff._id.toString(), // Using DB id for navigation
                customId: `E-${staff._id.toString().slice(-3).toUpperCase()}`, // Display ID (e.g., E-A3F)
                fullName: `${staff.firstName} ${staff.lastName}`,
                contactNo: staff.mobile,
                designation: staff.designation,
                month: targetMonth,
                basicSalary: staff.basicSalary || 0,
                advance: pendingAdvance,
                status: payroll ? "Paid" : "Unpaid",
            };
        });

        // 5. Calculate Stats
        let totalSalaries = 0;
        let paidSalaries = 0;
        let pendingSalaries = 0;
        let advanceGiven = 0;

        staffList.forEach(staff => {
            const basic = staff.basicSalary || 0;
            const payroll = payrollMap.get(staff._id.toString());
            const sid = staff._id.toString();

            totalSalaries += basic;

            if (payroll) {
                paidSalaries += payroll.netSalary; // Use net salary as actual amount paid
            }
        });

        pendingSalaries = totalSalaries - paidSalaries;

        // Sum all pending advances for the Advance Given stat
        advanceGiven = pendingAdvances.reduce((sum, adv) => sum + adv.amount, 0);

        const stats = {
            totalSalaries,
            paidSalaries,
            pendingSalaries,
            advanceGiven
        };

        return NextResponse.json({ success: true, data: result, stats });
    } catch (error) {
        console.error("Error fetching payroll list:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch payroll list" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        const newPayroll = await Payroll.create(body);

        // Mark linked advances as Deducted
        if (body.advanceIds && body.advanceIds.length > 0) {
            await Advance.updateMany(
                { _id: { $in: body.advanceIds } },
                { $set: { status: "Deducted" } }
            );
        }

        return NextResponse.json({ success: true, data: newPayroll }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating payroll:", error);
        // Handle duplicate month error
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, error: "Payroll already exists for this employee and month" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: "Failed to create payroll" },
            { status: 500 }
        );
    }
}
