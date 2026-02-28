"use client";

import { useRouter } from "next/navigation";
import PayrollSlipPreview, { PayrollSlipData, handleSlipPrint } from "@/components/payroll/PayrollSlipPreview";

export default function ReceiptView({ data }: { data: PayrollSlipData }) {
    const router = useRouter();

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <PayrollSlipPreview
                data={data}
                onPrint={() => handleSlipPrint(data)}
                onBack={() => router.push('/dashboard/payroll')}
            />
        </div>
    );
}
