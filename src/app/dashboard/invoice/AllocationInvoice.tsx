import React from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InvoiceItem, Meta, PageData, fmt } from "./InvoiceUtils";

const INK = "#111111";
const MUTED = "#444444";
const LINE = "#222222";
const HAIR = "#cccccc";
const FONT = "'Montserrat',sans-serif";
const LOGO = "/Images/invoice-logo.jpg";

interface Props {
    page: PageData; pageIdx: number; isLast: boolean; meta: Meta; MAX_ROWS: number;
    updItem: (pid: string, iid: string, k: keyof InvoiceItem, v: any) => void;
    delRow: (pid: string, iid: string) => void; addRow: (pid: string) => void;
    sm: (k: keyof Meta, v: any) => void; subtotal: number; remaining: number;
    delPage: (pid: string) => void; pagesCount: number;
}

export default function AllocationInvoice({ page, pageIdx, isLast, meta, MAX_ROWS, updItem, delRow, addRow, sm, subtotal, remaining, delPage, pagesCount }: Props) {
    const onEnter = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addRow(page.id);
        }
    };

    return (
        <div className="inv-outer" style={{ position: "relative" }}>
            {pagesCount > 1 && <button className="no-print" onClick={() => delPage(page.id)} style={delPSt}>✕ Remove Page</button>}
            <div className="inv-page-wrap" style={{ width: 794, height: 1123, fontFamily: FONT, background: "#fff", color: INK, fontWeight: 700, overflow: "hidden", position: "relative" }}>

                {/* ── HEADER ── */}
                <div style={{ padding: "28px 40px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
                        <img src={LOGO} alt="Tiger Transports" style={{ height: 52, width: "auto", maxWidth: 190, objectFit: "contain", objectPosition: "left center", display: "block" }} />
                        <div style={{ fontSize: 10, color: MUTED, fontWeight: 700, lineHeight: 1.5, letterSpacing: "0.01em" }}>
                            PLOT NO. W2/1/42, PORT QASIM, KARACHI &nbsp;·&nbsp; +92 300 9280276
                        </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "0.12em", lineHeight: 1, color: INK }}>INVOICE</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.22em", textTransform: "uppercase", marginTop: 8 }}>Outsider</div>
                    </div>
                </div>

                <div style={{ margin: "18px 40px 0", borderTop: `1.5px solid ${LINE}` }} />

                {/* ── INVOICE META ── */}
                <div style={{ margin: "0 40px", padding: "14px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, borderBottom: `1px solid ${HAIR}` }}>
                    <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                        <MetaField label="Invoice Number" value={meta.invoiceNo} onChange={v => sm("invoiceNo", v)} />
                        <MetaField label="Invoice Date" value={meta.invoiceDate} onChange={v => sm("invoiceDate", v)} />
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, border: `1.5px solid ${LINE}`, padding: "10px 16px", minWidth: 150 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>Remaining Due</div>
                        <div style={{ fontSize: 18, fontWeight: 800, marginTop: 3, letterSpacing: "-0.01em" }}>Rs. {fmt(remaining)}</div>
                    </div>
                </div>

                {/* ── PARTY + VEHICLE ── */}
                <div style={{ padding: "16px 40px 0", display: "flex", gap: 14 }}>
                    <div style={{ flex: 1.4, border: `1px solid ${LINE}`, padding: "16px 18px" }}>
                        <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${HAIR}` }}>Party / Outsider</div>
                        <FieldLabel>Name</FieldLabel>
                        <input type="text" value={meta.partyName} onChange={e => sm("partyName", e.target.value)} placeholder="Outsider name"
                            style={{ ...valueInp, fontSize: 14, fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div>
                                <FieldLabel>Pickup</FieldLabel>
                                <textarea value={meta.pickupFrom} onChange={e => sm("pickupFrom", e.target.value)} placeholder="Enter pickup…" rows={2}
                                    style={{ ...valueInp, resize: "none", lineHeight: 1.45 }} />
                            </div>
                            <div>
                                <FieldLabel>Destination</FieldLabel>
                                <textarea value={meta.deliverTo} onChange={e => sm("deliverTo", e.target.value)} placeholder="Enter destination…" rows={2}
                                    style={{ ...valueInp, resize: "none", lineHeight: 1.45 }} />
                            </div>
                        </div>
                    </div>
                    <div style={{ flex: 1, border: `1px solid ${LINE}`, padding: "16px 18px" }}>
                        <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${HAIR}` }}>Vehicle Info</div>
                        <FieldLabel>Vehicle No.</FieldLabel>
                        <input type="text" value={meta.vehicleNo} onChange={e => sm("vehicleNo", e.target.value)} placeholder="Enter vehicle no."
                            style={{ ...valueInp, fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }} />
                        <FieldLabel>Detail</FieldLabel>
                        <input type="text" value={meta.vehicleDetail} onChange={e => sm("vehicleDetail", e.target.value)} placeholder="Enter detail"
                            style={{ ...valueInp, fontWeight: 700, textTransform: "uppercase" }} />
                    </div>
                </div>

                {/* ── ITEMS TABLE ── */}
                <div style={{ padding: "16px 40px 0" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", border: `1.5px solid ${LINE}` }}>
                        <thead>
                            <tr style={{ height: 38, background: "#fff" }}>
                                {["Sr", "Description", "Total"].map((h, i) => (
                                    <th key={h} style={{
                                        fontSize: 10, fontWeight: 800, color: INK, padding: "0 12px",
                                        textAlign: i === 0 || i === 2 ? "center" : "left",
                                        textTransform: "uppercase", letterSpacing: "0.08em",
                                        borderBottom: `1.5px solid ${LINE}`,
                                        borderRight: i < 2 ? `1px solid ${HAIR}` : "none",
                                        width: ["52px", "auto", "140px"][i],
                                        background: "#fff",
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {page.items.map((item, i) => (
                                    <motion.tr layout key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: 34, background: "#fff" }}>
                                        <td style={tdc}>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                                                <span style={{ fontSize: 10, color: MUTED, fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</span>
                                                <button onClick={() => delRow(page.id, item.id)} className="no-print" style={delRSt}>✕</button>
                                            </div>
                                        </td>
                                        <td style={tdl}>
                                            <input type="text" value={item.cargoDetails} onChange={e => updItem(page.id, item.id, "cargoDetails", e.target.value)} onKeyDown={onEnter} placeholder="Enter details…"
                                                style={inp} />
                                        </td>
                                        <td style={{ ...tdc, borderRight: "none" }}>
                                            <input type="number" value={item.amount || ""} onChange={e => updItem(page.id, item.id, "amount", +e.target.value || 0)} onKeyDown={onEnter} placeholder="Amount"
                                                style={{ ...inp, textAlign: "center", fontWeight: 700 }} />
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                    {page.items.length < MAX_ROWS && (
                        <button className="no-print" onClick={() => addRow(page.id)} style={addSt}>
                            <Plus size={11} /> Add Row ({page.items.length}/{MAX_ROWS})
                        </button>
                    )}
                </div>

                {/* ── SUMMARY ── */}
                {isLast && (
                    <div className="inv-summary" style={{ padding: "16px 40px 0", display: "flex", justifyContent: "flex-end" }}>
                        <div style={{ width: 270, border: `1.5px solid ${LINE}` }}>
                            <SummaryRow label="Subtotal" value={`Rs. ${fmt(subtotal)}`} />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", borderBottom: `1px solid ${HAIR}`, fontSize: 11 }}>
                                <span style={{ fontWeight: 700, color: MUTED }}>Advance Paid</span>
                                <div style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 700, color: INK }}>
                                    - Rs. <input type="number" value={meta.advance || ""} onChange={e => sm("advance", +e.target.value || 0)} placeholder="0"
                                        style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: INK, background: "transparent", border: "none", outline: "none", textAlign: "right", width: 70, cursor: "pointer" }} />
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", background: "#fff", borderTop: `1.5px solid ${LINE}` }}>
                                <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>Remaining</span>
                                <span style={{ fontSize: 17, fontWeight: 800 }}>Rs. {fmt(remaining)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── FOOTER ── */}
                {isLast && (
                    <div className="inv-footer" style={{ position: "absolute", bottom: 36, left: 40, right: 40 }}>
                        <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Payment Method</div>
                                <div style={{ fontSize: 10, color: MUTED, lineHeight: 1.7 }}>Bank: Tiger Transports<br />Account: 1234567890</div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Terms</div>
                                <div style={{ fontSize: 10, color: MUTED, lineHeight: 1.7 }}>Payment within 30 days.</div>
                            </div>
                            <div style={{ flex: 1, textAlign: "right" }}>
                                <div style={{ width: 140, borderTop: `1px solid ${LINE}`, marginBottom: 8, marginLeft: "auto" }} />
                                <div style={{ fontSize: 11, fontWeight: 700 }}>Tiger Transports</div>
                                <div style={{ fontSize: 9, color: MUTED, marginTop: 2 }}>Authorized Signature</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <div style={{ fontSize: 8, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{children}</div>;
}

function MetaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div>
            <div style={{ fontSize: 8, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
            <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="—" style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: INK, background: "transparent", border: "none", outline: "none", cursor: "pointer", width: 110, marginTop: 2 }} />
        </div>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 16px", borderBottom: `1px solid ${HAIR}`, fontSize: 11 }}>
            <span style={{ fontWeight: 700, color: MUTED }}>{label}</span>
            <span style={{ fontWeight: 700 }}>{value}</span>
        </div>
    );
}

const valueInp: React.CSSProperties = { fontFamily: FONT, fontSize: 11, fontWeight: 700, color: INK, background: "transparent", border: "none", outline: "none", width: "100%", cursor: "pointer", display: "block" };
const delPSt: React.CSSProperties = { position: "absolute", top: -38, right: 0, zIndex: 50, display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: INK, border: `1px solid ${LINE}`, background: "#fff", cursor: "pointer" };
const tdl: React.CSSProperties = { fontSize: 10, color: INK, padding: "0 12px", borderBottom: `1px solid ${HAIR}`, borderRight: `1px solid ${HAIR}`, verticalAlign: "middle" };
const tdc: React.CSSProperties = { ...tdl, textAlign: "center", position: "relative" };
const inp: React.CSSProperties = { width: "100%", background: "transparent", border: "none", outline: "none", fontFamily: FONT, fontSize: 11, fontWeight: 700, color: INK, cursor: "pointer" };
const addSt: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, marginTop: 10, padding: "5px 12px", border: `1px dashed ${LINE}`, background: "none", cursor: "pointer", fontSize: 10, fontWeight: 700, color: MUTED, fontFamily: FONT };
const delRSt: React.CSSProperties = { background: "#fff", border: `1px solid ${LINE}`, color: INK, cursor: "pointer", fontSize: 9, padding: "1px 5px", fontWeight: 700 };
