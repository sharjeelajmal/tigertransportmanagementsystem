import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        // Next.js 15 requires unboxing params
        const params = await context.params;
        const id = params.id;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Invoice ID is required' },
                { status: 400 }
            );
        }

        const deletedInvoice = await Invoice.findByIdAndDelete(id);

        if (!deletedInvoice) {
            return NextResponse.json(
                { success: false, error: 'Invoice not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: 'Invoice deleted successfully' });
    } catch (error: any) {
        console.error('DELETE API Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete invoice' },
            { status: 500 }
        );
    }
}
