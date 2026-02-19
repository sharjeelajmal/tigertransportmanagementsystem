import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Vehicle from '@/models/Vehicle';

// GET - Fetch all vehicles
export async function GET() {
    try {
        await dbConnect();
        const vehicles = await Vehicle.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: vehicles });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch vehicles' },
            { status: 500 }
        );
    }
}

// POST - Create new vehicle
export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();

        // Destructure and validate
        const {
            plateNumber,
            vehicleName,
            modelYear,
            status,
            engineNumber,
            chassisNumber,
            ownerName,
            routePermitExpiry,
            tokenTaxExpiry,
            insuranceExpiry,
            fitnessExpiry,
            trackerExpiry
        } = body;

        // Basic validation
        if (!plateNumber || !vehicleName || !modelYear) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const vehicle = await Vehicle.create({
            plateNumber,
            vehicleName,
            modelYear,
            status: status || 'Available',
            engineNumber,
            chassisNumber,
            ownerName,
            routePermitExpiry,
            tokenTaxExpiry,
            insuranceExpiry,
            fitnessExpiry,
            trackerExpiry
        });

        return NextResponse.json({ success: true, data: vehicle }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create vehicle' },
            { status: 400 }
        );
    }
}
