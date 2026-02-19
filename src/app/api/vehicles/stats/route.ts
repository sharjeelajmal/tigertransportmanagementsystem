import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Vehicle from '@/models/Vehicle';
import Staff from '@/models/Staff';

export async function GET() {
    try {
        await dbConnect();

        const [totalVehicles, totalDrivers, totalHelpers, availableVehicles] = await Promise.all([
            Vehicle.countDocuments(),
            Staff.countDocuments({ designation: 'Driver' }),
            Staff.countDocuments({ designation: 'Labor' }), // Assuming Labor = Helper
            Vehicle.countDocuments({ status: 'Available' }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                totalVehicles,
                totalDrivers,
                totalHelpers,
                availableVehicles,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
