import { Suspense } from "react";
import InvoicePageContent from "./InvoicePageContent";
import { R1 } from "./InvoiceUtils";

export default function InvoicePage() {
    return (
        <Suspense fallback={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "Montserrat,sans-serif", fontWeight: 900, color: R1, letterSpacing: "0.2em" }}>
                LOADING…
            </div>
        }>
            <InvoicePageContent />
        </Suspense>
    );
}