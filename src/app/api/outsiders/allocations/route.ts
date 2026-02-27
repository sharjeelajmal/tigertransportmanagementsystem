import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import OutsiderAllocation from '@/models/OutsiderAllocation';
import Outsider from '@/models/Outsider';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const month = searchParams.get('month'); // Expecting YYYY-MM
        const outsiderId = searchParams.get('outsiderId');

        let query: any = {};
        if (month) {
            const [year, mm] = month.split('-');
            const startDate = new Date(parseInt(year), parseInt(mm) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(mm), 0, 23, 59, 59);
            query.allocationDate = { $gte: startDate, $lte: endDate };
        }
        if (outsiderId) {
            query.outsider = outsiderId;
        }

        const allocations = await OutsiderAllocation.find(query)
            .populate('outsider')
            .sort({ allocationDate: -1 });

        // Calculate Stats
        const stats = allocations.reduce((acc, curr) => {
            acc.totalAllocations += 1;

            // Count actual vehicle count from the vehicles array length
            if (curr.vehicles && curr.vehicles.length > 0) {
                acc.vehicleAllocations += curr.vehicles.length;
            } else if (curr.vehicleQty > 0) {
                acc.vehicleAllocations += curr.vehicleQty;
            }

            // Count actual labor count from laborQty
            if (curr.laborQty > 0) {
                acc.laborAllocations += curr.laborQty;
            }

            if (curr.paymentStatus === 'Unpaid') {
                acc.unpaidAllocations += 1;
            }

            acc.totalAmount += curr.totalAmount;
            acc.paidAmount += curr.paidAmount;
            return acc;
        }, {
            totalAllocations: 0,
            vehicleAllocations: 0,
            laborAllocations: 0,
            unpaidAllocations: 0,
            totalAmount: 0,
            paidAmount: 0
        });

        return NextResponse.json({
            success: true,
            data: allocations,
            stats: {
                ...stats,
                remainingAmount: stats.totalAmount - stats.paidAmount
            }
        }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching allocations:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch allocations' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        // Calculate status automatically if not provided accurately
        let paymentStatus = 'Unpaid';
        if (body.paidAmount >= body.totalAmount) {
            paymentStatus = 'Paid';
        } else if (body.paidAmount > 0) {
            paymentStatus = 'Partial Paid';
        }

        const allocation = await OutsiderAllocation.create({
            ...body,
            paymentStatus: body.paymentStatus || paymentStatus
        });

        return NextResponse.json({ success: true, data: allocation }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating allocation:', error);
        return NextResponse.json({ success: false, error: 'Failed to create allocation' }, { status: 500 });
    }
}
