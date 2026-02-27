import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Advance from "@/models/Advance";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const staffId = searchParams.get("staffId");

        if (!staffId) {
            return NextResponse.json(
                { success: false, error: "staffId is required" },
                { status: 400 }
            );
        }

        const pendingAdvances = await Advance.find({
            staffId,
            status: "Pending"
        }).select('_id amount').lean();

        const totalAmount = pendingAdvances.reduce((sum, adv) => sum + adv.amount, 0);
        const advanceIds = pendingAdvances.map(adv => adv._id.toString());

        return NextResponse.json({
            success: true,
            totalAmount,
            advanceIds,
            count: pendingAdvances.length
        });
    } catch (error) {
        console.error("Error fetching advances:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch advances" },
            { status: 500 }
        );
    }
}
