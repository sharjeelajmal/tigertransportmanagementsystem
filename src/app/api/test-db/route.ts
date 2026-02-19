import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

export async function GET() {
    try {
        await dbConnect();
        return NextResponse.json(
            { status: 'success', message: 'Connected to MongoDB successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Database connection error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to connect to MongoDB', error: (error as Error).message },
            { status: 500 }
        );
    }
}
