"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { InvoiceItem, Meta, PageData, makeItem, today, genNo, PRINT_CSS } from "./InvoiceUtils";
import InvoiceActions from "./InvoiceActions";
import InboundInvoice from "./InboundInvoice";
import OutboundInvoice from "./OutboundInvoice";
import AllocationInvoice from "./AllocationInvoice";

interface SavedInvoicePayload {
    _id: string;
    invoiceNo: string;
    billingDate: string;
    invoiceDate: string;
    clientName?: string;
    clientPhone?: string;
    clientAddress?: string;
    remarks?: string;
    discount?: number;
    advance?: number;
    partyName?: string;
    vehicleNo?: string;
    vehicleDetail?: string;
    pickupFrom?: string;
    deliverTo?: string;
    items: InvoiceItem[];
}

export default function InvoicePageContent() {
    const sp = useSearchParams();
    const type = sp.get("type") || "inbound";
    const invoiceId = sp.get("id");
    const isInbound = type === "inbound", isOutbound = type === "outbound", isAllocation = type === "allocation";
    const MAX_ROWS = isAllocation ? 5 : isOutbound ? 7 : 12;

    const [ready, setReady] = useState(false);
    const [pages, setPages] = useState<PageData[]>([]);
    const [meta, setMeta] = useState<Meta>({ invoiceNo: "", billingDate: "", invoiceDate: "", clientName: "", clientPhone: "", clientAddress: "", remarks: "", discount: 0, advance: 0, partyName: "", vehicleNo: "", vehicleDetail: "", pickupFrom: "", deliverTo: "" });
    const [saving, setSaving] = useState(false), [saved, setSaved] = useState(false);
    const [screenScale, setScreenScale] = useState(1);

    const PAGE_WIDTH = 794;
    const PAGE_HEIGHT = 1123;

    useEffect(() => {
        const s = document.createElement("style"); s.innerHTML = PRINT_CSS; document.head.appendChild(s);
        return () => { document.head.removeChild(s); };
    }, []);

    useEffect(() => {
        setReady(true);
        if (invoiceId) {
            fetch("/api/invoices").then(r => r.json()).then(data => {
                if (!data.success) return;
                const f = (data.data as SavedInvoicePayload[]).find((x) => x._id === invoiceId);
                if (!f) return;
                setMeta({ invoiceNo: f.invoiceNo, billingDate: f.billingDate, invoiceDate: f.invoiceDate, clientName: f.clientName || "", clientPhone: f.clientPhone || "", clientAddress: f.clientAddress || "", remarks: f.remarks || "", discount: f.discount || 0, advance: f.advance || 0, partyName: f.partyName || "", vehicleNo: f.vehicleNo || "", vehicleDetail: f.vehicleDetail || "", pickupFrom: f.pickupFrom || "", deliverTo: f.deliverTo || "" });
                setPages([{ id: "p1", items: f.items.length ? f.items : [makeItem()] }]);

                // Handle auto-download from list page
                if (sp.get("download") === "true") {
                    setTimeout(() => {
                        import("./InvoiceUtils").then(({ downloadInvoicePDF }) => {
                            const filename = `${type.toUpperCase()}_INVOICE_${f.invoiceNo}.pdf`;
                            downloadInvoicePDF(filename).then(() => {
                                window.close();
                            });
                        });
                    }, 800);
                }
            });
            return;
        }
        const nameParam = sp.get("name");
        const phoneParam = sp.get("phone");
        const addressParam = sp.get("address");

        setMeta(m => ({
            ...m,
            billingDate: today(),
            invoiceDate: today(),
            invoiceNo: genNo(),
            clientName: nameParam || m.clientName,
            clientPhone: phoneParam || m.clientPhone,
            clientAddress: addressParam || m.clientAddress
        }));
        setPages([{ id: "p1", items: [makeItem()] }]);
    }, [invoiceId, sp, type]);

    useEffect(() => {
        const updateScale = () => {
            const viewportWidth = window.innerWidth;
            const availableWidth = viewportWidth - 32;
            const next = Math.min(1, Math.max(0.48, availableWidth / PAGE_WIDTH));
            setScreenScale(next);
        };

        updateScale();
        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    }, []);

    const subtotal = useMemo(() => pages.reduce((a, p) => a + p.items.reduce((b, it) => b + (it.amount || it.rate * it.qty || 0), 0), 0), [pages]);
    const netTotal = useMemo(() => subtotal - (meta.discount || 0), [subtotal, meta.discount]);
    const remaining = useMemo(() => netTotal - (meta.advance || 0), [netTotal, meta.advance]);

    const sm = <K extends keyof Meta>(k: K, v: Meta[K]) => setMeta(m => ({ ...m, [k]: v }));
    const addPage = () => setPages(p => [...p, { id: `p${Date.now()}`, items: [makeItem()] }]);
    const delPage = (pid: string) => pages.length > 1 && setPages(p => p.filter(x => x.id !== pid));
    const addRow = (pid: string) => setPages(ps => ps.map(p => {
        if (p.id !== pid) return p;
        if (p.items.length >= MAX_ROWS) { alert(`Max ${MAX_ROWS} rows.`); return p; }
        return { ...p, items: [...p.items, makeItem()] };
    }));
    const delRow = (pid: string, iid: string) => setPages(ps => ps.map(p => p.id === pid && p.items.length > 1 ? { ...p, items: p.items.filter(i => i.id !== iid) } : p));
    const updItem = <K extends keyof InvoiceItem>(pid: string, iid: string, k: K, v: InvoiceItem[K]) => setPages(ps => ps.map(p => {
        if (p.id !== pid) return p;
        return {
            ...p,
            items: p.items.map(i => {
                if (i.id !== iid) return i;
                const updated = { ...i, [k]: v };
                if (k === "rate" || k === "qty") {
                    const r = k === "rate" ? (v as number) : i.rate;
                    const q = k === "qty" ? (v as number) : i.qty;
                    updated.amount = (r || 0) * (q || 0);
                }
                return updated;
            })
        };
    }));

    const handleSave = async () => {
        if (invoiceId) {
            setSaving(true);
            setSaved(true);
            setTimeout(() => {
                import("./InvoiceUtils").then(({ downloadInvoicePDF }) => {
                    const filename = `${type.toUpperCase()}_INVOICE_${meta.invoiceNo}.pdf`;
                    downloadInvoicePDF(filename).then(() => {
                        setSaved(false);
                        setSaving(false);
                    });
                });
            }, 500);
            return;
        }

        setSaving(true);
        try {
            const items = pages.flatMap(p => p.items).filter(i => i.cargoDetails || i.rate || i.amount);
            const body = { type, ...meta, items, subtotal, totalAmount: isAllocation ? remaining : netTotal, remainingAmount: isAllocation ? remaining : 0 };
            const res = await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            if (res.ok) {
                setSaved(true);

                // Trigger background PDF download automatically
                setTimeout(() => {
                    import("./InvoiceUtils").then(({ downloadInvoicePDF }) => {
                        const filename = `${type.toUpperCase()}_INVOICE_${meta.invoiceNo}.pdf`;
                        downloadInvoicePDF(filename).then(() => {
                            setSaved(false);
                        });
                    });
                }, 500); // slight delay to ensure 'Saving...' UI is gone before taking snapshot

            } else {
                alert((await res.json()).error);
                setSaved(false);
            }
        } catch {
            alert("Save failed");
            setSaved(false);
        }
        setSaving(false);
    };

    if (!ready) return null;

    return (
        <div className="invoice-print-root" style={{ minHeight: "100vh", background: "#c9c9c9", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16, paddingBottom: 40, paddingLeft: 12, paddingRight: 12, fontFamily: "'Montserrat', sans-serif" }}>
            <InvoiceActions type={type} addPage={addPage} handleSave={handleSave} saving={saving} saved={saved} />
            <div className="inv-pages-container" style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%", alignItems: "center" }}>
                {pages.map((page, idx) => (
                    <div
                        key={page.id}
                        className="inv-screen-scale-holder"
                        style={{ width: PAGE_WIDTH * screenScale, height: PAGE_HEIGHT * screenScale }}
                    >
                        <div
                            className="inv-screen-scale-wrap"
                            style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT, transform: `scale(${screenScale})`, transformOrigin: "top left" }}
                        >
                            {isInbound ? <InboundInvoice page={page} pageIdx={idx} isLast={idx === pages.length - 1} meta={meta} MAX_ROWS={MAX_ROWS} updItem={updItem} delRow={delRow} addRow={addRow} sm={sm} subtotal={subtotal} netTotal={netTotal} delPage={delPage} pagesCount={pages.length} /> :
                                isOutbound ? <OutboundInvoice page={page} pageIdx={idx} isLast={idx === pages.length - 1} meta={meta} MAX_ROWS={MAX_ROWS} updItem={updItem} delRow={delRow} addRow={addRow} sm={sm} subtotal={subtotal} netTotal={netTotal} delPage={delPage} pagesCount={pages.length} /> :
                                    <AllocationInvoice page={page} pageIdx={idx} isLast={idx === pages.length - 1} meta={meta} MAX_ROWS={MAX_ROWS} updItem={updItem} delRow={delRow} addRow={addRow} sm={sm} subtotal={subtotal} remaining={remaining} delPage={delPage} pagesCount={pages.length} />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
