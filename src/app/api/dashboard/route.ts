import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Staff from "@/models/Staff";
import Vehicle from "@/models/Vehicle";
import Expense from "@/models/Expense";
import OutsiderAllocation from "@/models/OutsiderAllocation";
import Reminder from "@/models/Reminder";
import Attendance from "@/models/Attendance";
import Payroll from "@/models/Payroll";

export async function GET() {
    try {
        await connectDB();

        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
        const lastDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-31`;

        const fifteenDaysFromNow = new Date();
        fifteenDaysFromNow.setDate(now.getDate() + 15);

        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const [
            totalStaff,
            activeVehicles,
            totalVehicles,
            monthExpenses,
            monthPayroll,
            allocations,
            recentAllocations,
            reminders,
            todayAttendance,
            expenseBreakdown,
            vehicleStatusBreakdown,
        ] = await Promise.all([
            Staff.countDocuments(),
            Vehicle.countDocuments({ status: { $ne: "Out of Service" } }),
            Vehicle.countDocuments(),
            Expense.aggregate([
                { $match: { date: { $gte: firstDay, $lte: lastDay } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" }, paid: { $sum: "$paidAmount" } } },
            ]),
            Payroll.aggregate([
                { $match: { paymentDate: { $gte: monthStart, $lte: monthEnd } } },
                { $group: { _id: null, total: { $sum: "$netSalary" } } },
            ]),
            OutsiderAllocation.find({ paymentStatus: { $ne: "Paid" } }).lean(),
            OutsiderAllocation.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("outsider", "outsiderName category")
                .lean(),
            Reminder.find({
                reminderDate: { $lte: new Date(fifteenDaysFromNow.getFullYear(), fifteenDaysFromNow.getMonth(), fifteenDaysFromNow.getDate(), 23, 59, 59) },
                isCompleted: false,
            }).sort({ reminderDate: 1 }).limit(5).lean(),
            Attendance.findOne({ date: todayStr }).lean(),
            // Expense breakdown by category for pie chart
            Expense.aggregate([
                { $match: { date: { $gte: firstDay, $lte: lastDay } } },
                { $group: { _id: "$category", total: { $sum: "$totalAmount" } } },
            ]),
            // Vehicle status breakdown for pie chart
            Vehicle.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
        ]);

        const totalExpenses = monthExpenses.length > 0 ? monthExpenses[0].total : 0;
        const totalPayroll = monthPayroll.length > 0 ? monthPayroll[0].total : 0;

        // Cash In = Allocations paidAmount (this month)
        const cashIn = (allocations as any[]).reduce((s: number, a: any) => s + (a.paidAmount || 0), 0);

        // Total Payables
        const totalPayables = (allocations as any[]).reduce((s: number, a: any) => s + ((a.totalAmount || 0) - (a.paidAmount || 0)), 0);

        // Present today count
        let presentToday = 0;
        if (todayAttendance && (todayAttendance as any).records) {
            presentToday = (todayAttendance as any).records.filter((r: any) => r.status === "Present").length;
        }

        const formattedAllocations = (recentAllocations as any[]).map((a: any) => ({
            _id: a._id.toString(),
            outsiderName: a.outsider?.outsiderName || "Unknown",
            category: a.outsider?.category || "N/A",
            customerName: a.customerName,
            totalAmount: a.totalAmount,
            paymentStatus: a.paymentStatus,
            createdAt: a.createdAt,
        }));

        const formattedReminders = (reminders as any[]).map((r: any) => ({
            _id: r._id.toString(),
            details: r.details,
            reminderDate: r.reminderDate,
            reminderTime: r.reminderTime,
        }));

        return NextResponse.json({
            success: true,
            data: {
                totalStaff,
                presentToday,
                activeVehicles,
                totalVehicles,
                totalExpenses,
                totalPayroll,
                totalPayables,
                cashIn,
                recentAllocations: formattedAllocations,
                reminders: formattedReminders,
                expenseBreakdown: (expenseBreakdown as any[]).map((e: any) => ({ name: e._id || 'Other', value: e.total })),
                vehicleStatusBreakdown: (vehicleStatusBreakdown as any[]).map((v: any) => ({ name: v._id || 'Unknown', value: v.count })),
            },
        });
    } catch (error) {
        console.error("Dashboard API error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch dashboard data" }, { status: 500 });
    }
}
