import React from "react";
import { FilePlus, Save, CheckCircle2, Printer } from "lucide-react";
import { R1 } from "./InvoiceUtils";

interface Props {
    type: string;
    addPage: () => void;
    handleSave: () => void;
    saving: boolean;
    saved: boolean;
}

export default function InvoiceActions({ type, addPage, handleSave, saving, saved }: Props) {
    return (
        <div className="action-bar no-print" style={{ display: "flex", gap: 8, flexWrap: "nowrap", overflowX: "auto", overflowY: "hidden", justifyContent: "flex-start", alignItems: "center", background: "#fff", padding: "10px 14px", borderRadius: 14, boxShadow: "0 4px 24px rgba(0,0,0,0.13)", marginBottom: 20, position: "sticky", top: 8, zIndex: 100, maxWidth: "100%", whiteSpace: "nowrap" }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: R1, background: "rgba(107,12,16,0.08)", padding: "3px 11px", borderRadius: 20, letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>{type}</span>
            <div style={{ width: 1, height: 26, background: "#eee", flexShrink: 0 }} />
            <ABtn icon={<FilePlus size={13} />} label="Add Page" onClick={addPage} />
            <div style={{ width: 1, height: 26, background: "#eee", flexShrink: 0 }} />
            <ABtn
                icon={saved ? <CheckCircle2 size={13} /> : <Save size={13} />}
                label={saved ? "Saved!" : saving ? "Saving…" : "Save"}
                onClick={handleSave}
                variant={saved ? "green" : "dark"}
                disabled={saving}
                style={{ minWidth: 95 }}
            />
            <ABtn icon={<Printer size={13} />} label="Print" onClick={() => window.print()} variant="red" />
        </div>
    );
}

function ABtn({ icon, label, onClick, variant = "outline", disabled = false, style }: { icon: React.ReactNode; label: string; onClick: () => void; variant?: "outline" | "dark" | "red" | "green"; disabled?: boolean; style?: React.CSSProperties; }) {
    const vs: Record<string, React.CSSProperties> = {
        outline: { background: "transparent", color: "#6B0C10", border: "2px solid rgba(107,12,16,0.22)" },
        dark: { background: "#1a1a1a", color: "#fff", border: "2px solid transparent" },
        red: { background: "#6B0C10", color: "#fff", border: "2px solid transparent" },
        green: { background: "#dcfce7", color: "#16a34a", border: "2px solid transparent" },
    };
    return (
        <button onClick={onClick} disabled={disabled} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px 14px", borderRadius: 9, fontFamily: "'Montserrat',sans-serif", fontSize: 11, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, flexShrink: 0, ...vs[variant], ...style } as React.CSSProperties}>
            {icon}{label}
        </button>
    );
}
