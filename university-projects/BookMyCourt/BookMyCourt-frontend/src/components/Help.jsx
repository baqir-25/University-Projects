import { useState } from "react";
import { C } from "../theme.js";
import { FAQ_ITEMS } from "../data/constants.js";
import { Icon } from "./Ui.jsx";

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: C.card, borderRadius: 14, marginBottom: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <button type="button" onClick={() => setOpen(!open)} style={{ padding: `14px var(--page-pad-x)`, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", width: "100%", background: "none", border: "none", color: C.text }}>
        <span style={{ fontWeight: 700, fontSize: 13, flex: 1, paddingRight: 8, textAlign: "left" }}>{q}</span>
        <span style={{ color: C.green, fontSize: 18, fontWeight: 300, flexShrink: 0 }}>{open ? "−" : "+"}</span>
      </button>
      {open && <div style={{ padding: `0 var(--page-pad-x) 14px`, color: C.textDim, fontSize: 13, lineHeight: 1.6, borderTop: `1px solid ${C.border}` }}>{a}</div>}
    </div>
  );
}

export function HelpScreen({ onBack }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg }}>
      <div style={{ padding: `16px var(--page-pad-x)`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
        <button type="button" onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <Icon n="back" color={C.text} size={22} />
        </button>
        <span style={{ fontWeight: 800, fontSize: 17 }}>Help & Support</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: `var(--page-pad-x)` }}>
        {FAQ_ITEMS.map((item, i) => (
          <FaqItem key={i} {...item} />
        ))}
        <div style={{ marginTop: 16, background: C.card, borderRadius: 14, padding: "16px", border: `1px solid ${C.border}`, textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📬</div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Still need help?</div>
          <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 12 }}>Our support team is available 24/7</div>
          <button type="button" style={{ padding: "10px 24px", borderRadius: 50, background: C.green, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", color: "#000" }}>
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
