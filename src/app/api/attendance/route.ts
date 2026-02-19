import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Attendance from "@/models/Attendance";
import Staff from "@/models/Staff";

// GET /api/attendance?date=YYYY-MM-DD
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const date = request.nextUrl.searchParams.get("date");
        if (!date) {
            return NextResponse.json({ success: false, error: "Date is required" }, { status: 400 });
        }

        // Check if attendance already exists for this date
        const existing = await Attendance.findOne({ date });
        if (existing) {
            return NextResponse.json({ success: true, data: existing, isNew: false });
        }

        // No attendance yet — return staff list with default "Present"
        const staffList = await Staff.find({}).sort({ createdAt: 1 });
        const records = staffList.map((s) => ({
            staffId: s._id.toString(),
            firstName: s.firstName,
            lastName: s.lastName,
            designation: s.designation,
            status: "Present",
        }));

        return NextResponse.json({ success: true, data: { date, records }, isNew: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}

// POST /api/attendance  — upsert attendance for a date
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { date, records } = body;

        if (!date || !records) {
            return NextResponse.json({ success: false, error: "Date and records required" }, { status: 400 });
        }

        const attendance = await Attendance.findOneAndUpdate(
            { date },
            { date, records },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, data: attendance }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
