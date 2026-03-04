import React from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InvoiceItem, Meta, PageData, GRAD, R1, fmt } from "./InvoiceUtils";

interface Props {
    page: PageData; pageIdx: number; isLast: boolean; meta: Meta; MAX_ROWS: number;
    updItem: (pid: string, iid: string, k: keyof InvoiceItem, v: any) => void;
    delRow: (pid: string, iid: string) => void; addRow: (pid: string) => void;
    sm: (k: keyof Meta, v: any) => void; subtotal: number; remaining: number;
    delPage: (pid: string) => void; pagesCount: number;
}

export default function AllocationInvoice({ page, pageIdx, isLast, meta, MAX_ROWS, updItem, delRow, addRow, sm, subtotal, remaining, delPage, pagesCount }: Props) {
    return (
        <div className="inv-outer" style={{ position: "relative" }}>
            {pagesCount > 1 && <button className="no-print" onClick={() => delPage(page.id)} style={delPSt}>✕ Remove Page</button>}
            <div className="inv-page-wrap" style={{ width: 794, height: 1123, fontFamily: "'Montserrat',sans-serif", background: "#fff", overflow: "hidden", boxShadow: "0 20px 70px rgba(0,0,0,0.28)", borderRadius: 8, position: "relative", display: "flex" }}>

                {/* ── LEFT SIDEBAR ── */}
                <div style={{ width: 130, background: GRAD, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 28, paddingBottom: 28, position: "relative", flexShrink: 0, overflow: "hidden", gap: 40 }}>
                    {/* Sidebar circles pattern */}
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} style={{ position: "absolute", top: 120 + i * 110, left: -28, width: 100, height: 100, borderRadius: "50%", border: "22px solid rgba(255,255,255,0.07)" }} />
                    ))}
                    {/* Vertical OUTSIDER text only */}
                    <span style={{ writingMode: "vertical-rl" as any, transform: "rotate(180deg)", fontSize: 44, fontWeight: 900, color: "rgba(255,255,255,0.13)", letterSpacing: "0.35em", textTransform: "uppercase", userSelect: "none" }}>OUTSIDER</span>
                    {/* Company name vertical */}
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.8)", letterSpacing: "0.15em" }}>TIGER</div>
                        <div style={{ fontSize: 7.5, fontWeight: 500, color: "rgba(255,255,255,0.55)", letterSpacing: "0.12em" }}>TRANSPORTS</div>
                    </div>
                </div>

                {/* ── MAIN CONTENT ── */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "30px 36px 56px 30px", position: "relative" }}>
                    {/* BG decoration */}
                    <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(107,12,16,0.04)", pointerEvents: "none" }} />

                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                            {/* Logo on white background naturally */}
                            <img src="/Images/logo.jpg" alt="Tiger" style={{ width: 90, height: 90, objectFit: "contain", flexShrink: 0 }} />
                            <div>
                                <div style={{ fontSize: 42, fontWeight: 900, color: R1, lineHeight: 1, letterSpacing: -1 }}>OUTSIDER</div>
                                <div style={{ fontSize: 22, fontWeight: 900, color: "#333", lineHeight: 1.2, letterSpacing: 1 }}>INVOICE</div>
                                <div style={{ width: 60, height: 4, background: GRAD, borderRadius: 3, marginTop: 8 }} />
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                            {[["Inv No.", "invoiceNo", "INV-000"], ["Date", "invoiceDate", "DD/MM/YYYY"]].map(([lbl, k, ph]) => (
                                <div key={k} style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 7, padding: "5px 12px", minWidth: 150 }}>
                                    <div style={{ fontSize: 8, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.1em" }}>{lbl}</div>
                                    <input type="text" value={(meta as any)[k]} onChange={e => sm(k as any, e.target.value)} placeholder={ph}
                                        style={{ fontFamily: "inherit", fontSize: 12, fontWeight: 700, color: R1, background: "transparent", border: "none", outline: "none", width: "100%", cursor: "pointer" }} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ height: 2, background: "#eee", borderRadius: 2, marginBottom: 14 }} />

                    {/* Party + Vehicle Info */}
                    <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                        {/* Party */}
                        <div style={{ flex: 1, border: `2px solid ${R1}`, borderRadius: 10, padding: "12px 16px", position: "relative" }}>
                            <div style={{ position: "absolute", top: -9, left: 12, background: "#fff", padding: "0 6px", fontSize: 9, fontWeight: 800, color: R1, textTransform: "uppercase", letterSpacing: "0.1em" }}>Party / Outsider</div>
                            <input type="text" value={meta.partyName} onChange={e => sm("partyName", e.target.value)} placeholder="ENTER OUTSIDER NAME"
                                style={{ fontFamily: "inherit", fontSize: 20, fontWeight: 900, color: "#333", textTransform: "uppercase", background: "transparent", border: "none", outline: "none", width: "100%", cursor: "pointer", marginBottom: 10 }} />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                {[["Pickup", "pickupFrom"], ["Destination", "deliverTo"]].map(([lbl, k]) => (
                                    <div key={k} style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 7, padding: "7px 10px" }}>
                                        <div style={{ fontSize: 8, fontWeight: 800, color: R1, textTransform: "uppercase", marginBottom: 3 }}>{lbl}</div>
                                        <textarea value={(meta as any)[k]} onChange={e => sm(k as any, e.target.value)} placeholder={`Enter ${lbl}…`} rows={2}
                                            style={{ fontFamily: "inherit", fontSize: 10, fontWeight: 500, color: "#333", width: "100%", resize: "none", outline: "none", border: "none", background: "transparent", cursor: "pointer" }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Vehicle Info */}
                        <div style={{ width: "36%", border: "1.5px solid #e5e5e5", borderRadius: 10, padding: "12px 16px", background: "#fafafa", position: "relative" }}>
                            <div style={{ position: "absolute", top: -9, left: 12, background: "#fafafa", padding: "0 6px", fontSize: 9, fontWeight: 800, color: "#555", textTransform: "uppercase" }}>Vehicle Info</div>
                            {[["Veh. No.", "vehicleNo", "Enter Vehicle No."], ["Detail", "vehicleDetail", "Enter Detail"]].map(([lbl, k, ph], i) => (
                                <div key={k} style={{ ...(i === 0 ? { borderBottom: "1px solid #eee", paddingBottom: 8, marginBottom: 8 } : {}) }}>
                                    <div style={{ fontSize: 8, fontWeight: 700, color: "#aaa", textTransform: "uppercase", marginBottom: 2 }}>{lbl}</div>
                                    <input type="text" value={(meta as any)[k]} onChange={e => sm(k as any, e.target.value)} placeholder={ph}
                                        style={{ fontFamily: "inherit", fontSize: 12, fontWeight: 700, color: "#333", textTransform: "uppercase", background: "transparent", border: "none", outline: "none", width: "100%", cursor: "pointer" }} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── TABLE ── */}
                    <div style={{ border: "1px solid #eee", borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
                        <div style={{ display: "flex", background: GRAD, color: "#fff", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            <div style={{ width: "9%", textAlign: "center", padding: "9px 0", borderRight: "1px solid rgba(255,255,255,0.15)" }}>Sr.</div>
                            <div style={{ flex: 1, padding: "9px 14px", borderRight: "1px solid rgba(255,255,255,0.15)" }}>Cargo Details</div>
                            <div style={{ width: "20%", textAlign: "center", padding: "9px 0" }}>Total</div>
                        </div>
                        <AnimatePresence mode="popLayout">
                            {page.items.map((item, i) => (
                                <motion.div layout key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    style={{ display: "flex", borderBottom: "1px solid #f0f0f0", minHeight: 34, background: i % 2 === 1 ? "#f9f9f9" : "#fff" }}>
                                    <div style={{ width: "9%", textAlign: "center", borderRight: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "#ccc", position: "relative" }}>
                                        {String(i + 1).padStart(2, "0")}
                                        <button onClick={() => delRow(page.id, item.id)} className="no-print"
                                            style={{ position: "absolute", left: -24, top: "50%", transform: "translateY(-50%)", background: "#fee2e2", border: "none", borderRadius: 4, padding: "1px 4px", color: R1, cursor: "pointer", fontSize: 13 }}>×</button>
                                    </div>
                                    <div style={{ flex: 1, borderRight: "1px solid #f0f0f0", padding: "0 14px", display: "flex", alignItems: "center" }}>
                                        <input type="text" value={item.cargoDetails} onChange={e => updItem(page.id, item.id, "cargoDetails", e.target.value)} placeholder="Enter details…"
                                            style={{ fontFamily: "inherit", fontSize: 11, fontWeight: 500, color: "#333", background: "transparent", border: "none", outline: "none", width: "100%", cursor: "pointer" }} />
                                    </div>
                                    <div style={{ width: "20%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <input type="number" value={item.amount || ""} onChange={e => updItem(page.id, item.id, "amount", +e.target.value || 0)} placeholder="Amount"
                                            style={{ fontFamily: "inherit", fontSize: 11, fontWeight: 700, color: "#333", background: "transparent", border: "none", outline: "none", textAlign: "center", width: "90%", cursor: "pointer" }} />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {page.items.length < MAX_ROWS && (
                        <button className="no-print" onClick={() => addRow(page.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", border: "1.5px dashed #ddd", borderRadius: 7, background: "none", cursor: "pointer", fontSize: 10, fontWeight: 700, color: "#bbb", fontFamily: "'Montserrat',sans-serif", marginBottom: 10 }}>
                            <Plus size={11} /> Add Row ({page.items.length}/{MAX_ROWS})
                        </button>
                    )}

                    <div style={{ flex: 1 }} />

                    {/* ── SUMMARY ── */}
                    {isLast && (
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <div style={{ width: "45%", borderRadius: 12, overflow: "hidden", border: "1px solid #eee", boxShadow: "0 3px 14px rgba(0,0,0,0.1)" }}>
                                <div style={{ padding: "10px 16px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                                    <span style={{ fontWeight: 600, color: "#666" }}>Subtotal</span>
                                    <span style={{ fontWeight: 700 }}>Rs. {fmt(subtotal)}</span>
                                </div>
                                <div style={{ padding: "10px 16px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                                    <span style={{ fontWeight: 600, color: "#666" }}>Advance Paid</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 700, color: R1 }}>
                                        - Rs. <input type="number" value={meta.advance || ""} onChange={e => sm("advance", +e.target.value || 0)} placeholder="0"
                                            style={{ fontFamily: "inherit", fontSize: 12, fontWeight: 700, color: R1, background: "transparent", border: "none", outline: "none", textAlign: "right", width: 70, cursor: "pointer" }} />
                                    </div>
                                </div>
                                <div style={{ padding: "13px 16px", background: GRAD, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase" }}>Remaining</span>
                                    <span style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>Rs. {fmt(remaining)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── FOOTER BAR (absolute to page) ── */}
                </div>

                {/* Footer absolute to the page wrapper */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 44, background: GRAD, zIndex: 3, display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 34, paddingRight: 34 }}>
                    <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.75)", letterSpacing: "0.08em" }}>TIGER TRANSPORTS · PORT QASIM, KARACHI</span>
                    <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>+92 300 9280276</span>
                </div>
            </div>
        </div>
    );
}

const delPSt: React.CSSProperties = { position: "absolute", top: -36, right: 0, zIndex: 50, display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: "#6B0C10", border: "1.5px solid rgba(107,12,16,0.25)", background: "#fff", borderRadius: 8, cursor: "pointer" };
