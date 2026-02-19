import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Vehicle from '@/models/Vehicle';

// GET - Fetch single vehicle
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    try {
        await dbConnect();
        const vehicle = await Vehicle.findById(id);

        if (!vehicle) {
            return NextResponse.json(
                { success: false, error: 'Vehicle not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: vehicle });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch vehicle' },
            { status: 500 }
        );
    }
}

// DELETE - Delete vehicle
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    try {
        await dbConnect();
        const deletedVehicle = await Vehicle.findByIdAndDelete(id);

        if (!deletedVehicle) {
            return NextResponse.json(
                { success: false, error: 'Vehicle not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: {} });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete vehicle' },
            { status: 500 }
        );
    }
}

// PUT - Update vehicle
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    try {
        await dbConnect();
        const body = await request.json();

        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            id,
            { ...body },
            { new: true, runValidators: true }
        );

        if (!updatedVehicle) {
            return NextResponse.json(
                { success: false, error: 'Vehicle not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: updatedVehicle });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update vehicle' },
            { status: 500 }
        );
    }
}
