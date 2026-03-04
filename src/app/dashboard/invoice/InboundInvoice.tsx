import React from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InvoiceItem, Meta, PageData, fmt } from "./InvoiceUtils";

const M = "#6B0C10";
const ML = "#9B1520";
const GRAD = `linear-gradient(135deg, ${M} 0%, ${ML} 100%)`;

interface Props {
    page: PageData; pageIdx: number; isLast: boolean; meta: Meta; MAX_ROWS: number;
    updItem: (pid: string, iid: string, k: keyof InvoiceItem, v: any) => void;
    delRow: (pid: string, iid: string) => void; addRow: (pid: string) => void;
    sm: (k: keyof Meta, v: any) => void; subtotal: number; netTotal: number;
    delPage: (pid: string) => void; pagesCount: number;
}

export default function InboundInvoice({ page, pageIdx, isLast, meta, MAX_ROWS, updItem, delRow, addRow, sm, subtotal, netTotal, delPage, pagesCount }: Props) {
    return (
        <div className="inv-outer" style={{ position: "relative" }}>
            {pagesCount > 1 && <button className="no-print" onClick={() => delPage(page.id)} style={delPSt}>✕ Remove Page</button>}
            <div className="inv-page-wrap" style={{ width: 794, height: 1123, fontFamily: "'Montserrat',sans-serif", background: "#fff", overflow: "hidden", position: "relative" }}>

                {/* ░░ BG DECORATION — top-right dot grid ░░ */}
                <div style={{ position: "absolute", top: 0, right: 0, width: 220, height: 200, zIndex: 0, pointerEvents: "none" }}>
                    {Array.from({ length: 42 }).map((_, i) => {
                        const col = i % 6, row = Math.floor(i / 6);
                        return <div key={i} style={{ position: "absolute", left: col * 30 + 8, top: row * 28 + 8, width: 5, height: 5, borderRadius: "50%", background: M, opacity: 0.12 }} />;
                    })}
                </div>
                {/* ░░ BG DECORATION — bottom-left large arc ░░ */}
                <div style={{ position: "absolute", bottom: -100, left: -100, width: 380, height: 380, borderRadius: "50%", border: `50px solid rgba(107,12,16,0.06)`, zIndex: 0, pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, borderRadius: "50%", border: `30px solid rgba(107,12,16,0.08)`, zIndex: 0, pointerEvents: "none" }} />

                {/* ░░ LEFT ACCENT STRIP ░░ */}
                <div style={{ position: "absolute", top: 0, left: 0, width: 7, height: "100%", background: GRAD, zIndex: 3 }} />

                {/* ░░ HEADER AREA (white bg, logo here naturally) ░░ */}
                <div style={{ paddingLeft: 36, paddingRight: 34, paddingTop: 28, paddingBottom: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 2 }}>
                    {/* Left: Logo on white + Company info */}
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                        <img src="/Images/logo.jpg" alt="Tiger Transports" style={{ width: 100, height: 100, objectFit: "contain", flexShrink: 0 }} />
                        <div>
                            <div style={{ fontSize: 24, fontWeight: 900, color: M, letterSpacing: 1, lineHeight: 1 }}>TIGER TRANSPORTS</div>
                            <div style={{ width: 70, height: 3, background: GRAD, borderRadius: 2, margin: "6px 0 5px 0" }} />
                            <div style={{ fontSize: 10, color: "#777", fontWeight: 500 }}>PLOT NO. W2/1/42, PORT QASIM, KARACHI</div>
                            <div style={{ fontSize: 10, color: "#777", fontWeight: 500 }}>+92 300 9280276</div>
                        </div>
                    </div>
                    {/* Right: INVOICE heading */}
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 58, fontWeight: 900, color: "#f0e8e8", lineHeight: 1, letterSpacing: 1, position: "relative" }}>
                            <span style={{ position: "relative", zIndex: 1, color: M }}>INVOICE</span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "#aaa", letterSpacing: "0.3em", textTransform: "uppercase", marginTop: 2 }}>INBOUND</div>
                    </div>
                </div>

                {/* ░░ MAROON SEPARATOR BAND ░░ */}
                <div style={{ marginLeft: 7, background: GRAD, height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 34px", marginTop: 18, position: "relative", zIndex: 2 }}>
                    <div style={{ display: "flex", gap: 24 }}>
                        <MBandField label="Invoice No" value={meta.invoiceNo} onChange={v => sm("invoiceNo", v)} />
                        <MBandField label="Billing Date" value={meta.billingDate} onChange={v => sm("billingDate", v)} />
                        <MBandField label="Invoice Date" value={meta.invoiceDate} onChange={v => sm("invoiceDate", v)} />
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total Due</div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>Rs. {fmt(netTotal)}</div>
                    </div>
                </div>

                {/* ░░ CLIENT INFO ROW ░░ */}
                <div style={{ paddingLeft: 36, paddingRight: 34, paddingTop: 16, paddingBottom: 12, display: "flex", gap: 12, position: "relative", zIndex: 2 }}>
                    <div style={{ flex: 1.8, borderLeft: `4px solid ${M}`, paddingLeft: 14 }}>
                        <div style={{ fontSize: 9, fontWeight: 800, color: M, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 3 }}>Invoice To</div>
                        <input type="text" value={meta.clientName} onChange={e => sm("clientName", e.target.value)} placeholder="CLIENT NAME"
                            style={{ fontFamily: "inherit", fontSize: 18, fontWeight: 900, color: "#111", background: "transparent", border: "none", outline: "none", width: "100%", cursor: "pointer", display: "block" }} />
                        <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                            <CField icon="📞" value={meta.clientPhone} onChange={v => sm("clientPhone", v)} />
                            <CField icon="📍" value={meta.clientAddress} onChange={v => sm("clientAddress", v)} wide />
                        </div>
                    </div>
                    <div style={{ flex: 1.5, background: "#fafafa", borderRadius: 10, padding: "10px 14px", border: "1px solid #eee" }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Remarks</div>
                        <input type="text" value={meta.remarks} onChange={e => sm("remarks", e.target.value)} placeholder="Notes or special instructions..."
                            style={{ fontFamily: "inherit", fontSize: 10, color: "#555", background: "transparent", border: "none", outline: "none", width: "100%", cursor: "pointer" }} />
                    </div>
                </div>

                {/* ░░ TABLE ░░ */}
                <div style={{ paddingLeft: 36, paddingRight: 34, position: "relative", zIndex: 2 }}>
                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 14px rgba(107,12,16,0.12)" }}>
                        <thead>
                            <tr style={{ background: GRAD, height: 40 }}>
                                {["Sr. #", "Description", "Vehicle", "Price", "Qty", "Total"].map((h, i) => (
                                    <th key={h} style={{ fontSize: 10, fontWeight: 700, color: "#fff", padding: "0 12px", textAlign: (i === 0 || i >= 3) ? "center" : "left" as any, textTransform: "uppercase", letterSpacing: "0.07em", borderRight: i < 5 ? "1px solid rgba(255,255,255,0.12)" : "none", width: ["42px", "auto", "88px", "70px", "52px", "80px"][i] }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {page.items.map((it: any, idx: number) => (
                                    <motion.tr layout key={it.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: 36, background: idx % 2 === 1 ? `rgba(107,12,16,0.03)` : "#fff" }}>
                                        <td style={tdc}><span style={{ fontSize: 10, color: "#ccc", fontWeight: 700 }}>{(idx + 1).toString().padStart(2, "0")}</span><button onClick={() => delRow(page.id, it.id)} className="no-print" style={delRSt}>×</button></td>
                                        <td style={tdl}><input style={inp} value={it.cargoDetails} onChange={e => updItem(page.id, it.id, "cargoDetails", e.target.value)} placeholder="Cargo description..." /></td>
                                        <td style={tdc}><input style={{ ...inp, textAlign: "center" }} value={it.vehicle} onChange={e => updItem(page.id, it.id, "vehicle", e.target.value)} /></td>
                                        <td style={tdc}><input style={{ ...inp, textAlign: "center" }} type="number" value={it.rate || ""} onChange={e => updItem(page.id, it.id, "rate", +e.target.value)} /></td>
                                        <td style={tdc}><input style={{ ...inp, textAlign: "center" }} type="number" value={it.qty || ""} onChange={e => updItem(page.id, it.id, "qty", +e.target.value)} /></td>
                                        <td style={{ ...tdc, borderRight: "1px solid #eee" }}><input style={{ ...inp, textAlign: "center", fontWeight: 800, color: M }} type="number" value={it.amount || ""} onChange={e => updItem(page.id, it.id, "amount", +e.target.value)} /></td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                    {page.items.length < MAX_ROWS && <button className="no-print" onClick={() => addRow(page.id)} style={addSt}><Plus size={11} /> Add Row ({page.items.length}/{MAX_ROWS})</button>}
                </div>

                {/* ░░ SUMMARY ░░ */}
                {isLast && (
                    <div style={{ paddingLeft: 36, paddingRight: 34, paddingTop: 16, display: "flex", justifyContent: "flex-end", position: "relative", zIndex: 2 }}>
                        <div style={{ width: 270, borderRadius: 10, overflow: "hidden", boxShadow: "0 3px 16px rgba(107,12,16,0.15)", border: `1px solid rgba(107,12,16,0.15)` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid #f0f0f0", fontSize: 11 }}>
                                <span style={{ fontWeight: 600, color: "#777" }}>Sub-total</span>
                                <span style={{ fontWeight: 700 }}>Rs. {fmt(subtotal)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #f0f0f0", fontSize: 11 }}>
                                <span style={{ fontWeight: 600, color: "#777" }}>Discount</span>
                                <div style={{ display: "flex", gap: 3, fontWeight: 700, color: M }}>- Rs.<input type="number" value={meta.discount || ""} onChange={e => sm("discount", +e.target.value)} style={{ background: "transparent", border: "none", outline: "none", fontSize: 11, fontWeight: 700, textAlign: "right", width: 64, cursor: "pointer", color: M }} /></div>
                            </div>
                            <div style={{ background: GRAD, padding: "13px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "0.07em" }}>TOTAL</span>
                                <span style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>Rs. {fmt(netTotal)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ░░ FOOTER SECTION ░░ */}
                {isLast && (
                    <div style={{ position: "absolute", bottom: 52, left: 36, right: 34, display: "flex", justifyContent: "space-between", alignItems: "flex-end", zIndex: 2 }}>
                        <div>
                            <div style={{ fontSize: 9, fontWeight: 800, color: "#333", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Payment Method</div>
                            <div style={{ fontSize: 9, color: "#888", lineHeight: 1.9 }}>Bank: Tiger Transports<br />Account: 1234567890</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 9, fontWeight: 800, color: "#333", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Terms</div>
                            <div style={{ fontSize: 9, color: "#888", lineHeight: 1.9 }}>Payment within 30 days.</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ width: 130, height: 1, background: "#ddd", marginBottom: 7, marginLeft: "auto" }} />
                            <div style={{ fontSize: 11, fontWeight: 800, color: "#1a1a1a" }}>Tiger Transports</div>
                            <div style={{ fontSize: 9, color: "#aaa", marginTop: 1 }}>Authorized Signatory</div>
                        </div>
                    </div>
                )}

                {/* ░░ FOOTER BAR ░░ */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 44, background: GRAD, zIndex: 4, display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 36, paddingRight: 34 }}>
                    <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.8)", letterSpacing: "0.1em" }}>TIGER TRANSPORTS · PORT QASIM, KARACHI</span>
                    <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>+92 300 9280276</span>
                </div>
            </div>
        </div>
    );
}

function MBandField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return <div><div style={{ fontSize: 8, fontWeight: 600, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div><input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="—" style={{ fontFamily: "inherit", fontSize: 11, fontWeight: 800, color: "#fff", background: "transparent", border: "none", outline: "none", cursor: "pointer", width: 100 }} /></div>;
}
function CField({ icon, value, onChange, wide }: { icon: string; value: string; onChange: (v: string) => void; wide?: boolean }) {
    return <div style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ fontSize: 10 }}>{icon}</span><input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="—" style={{ fontFamily: "inherit", fontSize: 10, color: "#555", background: "transparent", border: "none", borderBottom: "1px dashed #ddd", outline: "none", width: wide ? 160 : 110, cursor: "pointer" }} /></div>;
}

const delPSt: React.CSSProperties = { position: "absolute", top: -38, right: 0, zIndex: 50, display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: "#6B0C10", border: "1.5px solid rgba(107,12,16,0.25)", background: "#fff", borderRadius: 8, cursor: "pointer" };
const tdl: React.CSSProperties = { fontSize: 10, color: "#444", padding: "0 12px", borderBottom: "1px solid #eee", borderRight: "1px solid #eee", verticalAlign: "middle" };
const tdc: React.CSSProperties = { ...tdl, textAlign: "center", position: "relative", borderLeft: "1px solid #eee" };
const inp: React.CSSProperties = { width: "100%", background: "transparent", border: "none", outline: "none", fontFamily: "'Montserrat',sans-serif", fontSize: 10, color: "#444", cursor: "pointer" };
const addSt: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, marginTop: 9, padding: "5px 12px", border: "1.5px dashed rgba(107,12,16,0.25)", borderRadius: 7, background: "none", cursor: "pointer", fontSize: 10, fontWeight: 700, color: "#ccc" };
const delRSt: React.CSSProperties = { position: "absolute", left: -22, top: "50%", transform: "translateY(-50%)", background: "#fee2e2", border: "none", borderRadius: 4, color: "#6B0C10", cursor: "pointer", fontSize: 13, padding: "1px 4px" };
