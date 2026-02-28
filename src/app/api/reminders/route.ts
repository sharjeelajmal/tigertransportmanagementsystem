import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Reminder from '@/models/Reminder';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const filter = searchParams.get('filter'); // 'approaching' or empty

        let query: any = {};
        if (filter === 'approaching') {
            const now = new Date();
            const fifteenDaysFromNow = new Date();
            fifteenDaysFromNow.setDate(now.getDate() + 15);

            // Include past/overdue + today + next 15 days — all incomplete reminders
            query.reminderDate = {
                $lte: new Date(fifteenDaysFromNow.getFullYear(), fifteenDaysFromNow.getMonth(), fifteenDaysFromNow.getDate(), 23, 59, 59)
            };
            query.isCompleted = false;
        }

        const reminders = await Reminder.find(query).sort({ reminderDate: 1, reminderTime: 1 });
        return NextResponse.json({ success: true, data: reminders }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching reminders:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch reminders' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const reminder = await Reminder.create(body);
        return NextResponse.json({ success: true, data: reminder }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating reminder:', error);
        return NextResponse.json({ success: false, error: 'Failed to create reminder' }, { status: 500 });
    }
}
