import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Outsider from '@/models/Outsider';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // Use aggregation with $lookup to get lastAllocationDate
        const outsiders = await Outsider.aggregate([
            {
                $lookup: {
                    from: 'outsiderallocations',
                    localField: '_id',
                    foreignField: 'outsider',
                    as: 'allocations'
                }
            },
            {
                $addFields: {
                    lastAllocationDate: {
                        $max: {
                            $map: {
                                input: '$allocations',
                                as: 'alloc',
                                in: { $ifNull: ['$$alloc.tripDate', '$$alloc.createdAt'] }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    outsiderName: 1,
                    category: 1,
                    contactNo: 1,
                    contactPersonName: 1,
                    mobileNo: 1,
                    emergencyContactNo: 1,
                    address: 1,
                    balanceStatus: 1,
                    lastAllocationDate: 1,
                    createdAt: 1,
                    updatedAt: 1,
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        return NextResponse.json({ success: true, data: outsiders }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching outsiders:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch outsiders' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const newOutsider = await Outsider.create(body);
        return NextResponse.json({ success: true, data: newOutsider }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating outsider:', error);
        return NextResponse.json({ success: false, error: 'Failed to create outsider' }, { status: 500 });
    }
}
