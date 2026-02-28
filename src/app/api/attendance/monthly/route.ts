import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';

// GET /api/attendance/monthly?staffId=X&month=YYYY-MM
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const staffId = searchParams.get('staffId');
        const month = searchParams.get('month'); // YYYY-MM

        if (!staffId || !month) {
            return NextResponse.json({ success: false, error: 'staffId and month are required' }, { status: 400 });
        }

        const [year, mo] = month.split('-').map(Number);
        const daysInMonth = new Date(year, mo, 0).getDate();

        // Build date range for the month
        const dates: string[] = [];
        for (let d = 1; d <= daysInMonth; d++) {
            dates.push(`${year}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
        }

        // Fetch all attendance records for this month
        const attendanceRecords = await Attendance.find({
            date: { $in: dates }
        }).lean();

        let absentCount = 0;
        let presentCount = 0;
        let notMarkedCount = 0;

        for (const dateStr of dates) {
            const dayRecord = attendanceRecords.find((a: any) => a.date === dateStr);
            if (dayRecord) {
                const staffRecord = (dayRecord as any).records?.find((r: any) => r.staffId === staffId);
                if (staffRecord) {
                    if (staffRecord.status === 'Absent') {
                        absentCount++;
                    } else {
                        presentCount++;
                    }
                } else {
                    notMarkedCount++;
                }
            } else {
                notMarkedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                totalDays: daysInMonth,
                present: presentCount,
                absent: absentCount,
                notMarked: notMarkedCount,
            }
        });
    } catch (error: any) {
        console.error('Error fetching monthly attendance:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch monthly attendance' }, { status: 500 });
    }
}
