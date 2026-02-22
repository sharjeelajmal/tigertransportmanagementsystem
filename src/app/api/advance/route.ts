import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Advance from "@/models/Advance";

export async function POST(req: Request) {
    try {
        await connectDB();
        const data = await req.json();

        // data expectation: { staffId, date, amount, reason }
        const newAdvance = new Advance({
            staffId: data.employee, // mapped from frontend form
            date: new Date(data.date),
            amount: Number(data.amount),
            reason: data.reason,
            status: "Pending"
        });

        await newAdvance.save();

        return NextResponse.json({ success: true, data: newAdvance }, { status: 201 });
    } catch (error) {
        console.error("Error creating advance:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create advance" },
            { status: 500 }
        );
    }
}
