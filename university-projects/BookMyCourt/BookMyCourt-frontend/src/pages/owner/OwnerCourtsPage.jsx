import { useOutletContext } from "react-router-dom";
import { C } from "../../theme.js";

export function OwnerCourtsPage() {
  const { arena, openAddCourt, updateCourtField } = useOutletContext();
  if (!arena) return null;

  return (
    <div style={{ padding: `16px var(--page-pad-x) 24px`, overflowY: "auto", WebkitOverflowScrolling: "touch", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
        <div style={{ fontWeight: 900, fontSize: 15 }}>Courts & status</div>
        <button
          type="button"
          onClick={openAddCourt}
          style={{
            flexShrink: 0,
            padding: "8px 14px",
            borderRadius: 50,
            border: `1px dashed ${C.green}`,
            background: "rgba(34,228,85,0.08)",
            color: C.green,
            fontWeight: 800,
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          + Add court
        </button>
      </div>
      <div style={{ fontSize: 12, color: C.textDim, marginBottom: 14, lineHeight: 1.45 }}>
        New courts appear for players on venue detail and booking. Vanguard syncs to the live court picker automatically.
      </div>
      {arena.courts.map((c) => (
        <div key={c.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 14, marginBottom: 10 }}>
          <div style={{ fontWeight: 900 }}>{c.name}</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>{c.sport}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {c.amenities?.map((m) => (
              <span key={m} style={{ fontSize: 10, padding: "4px 8px", borderRadius: 8, background: "#1a2e1f", color: C.textDim }}>
                {m}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            <button
              type="button"
              disabled={c.status === "maintenance"}
              onClick={() => {
                if (c.status === "maintenance") return;
                updateCourtField(c.id, "status", c.status === "available" ? "unavailable" : "available");
              }}
              style={{
                flex: 1,
                minWidth: 120,
                padding: "10px 8px",
                borderRadius: 50,
                border: `1px solid ${c.status === "available" ? C.green : C.border}`,
                background: c.status === "available" ? "rgba(34,228,85,0.1)" : "#1a2e1f",
                color: c.status === "available" ? C.green : C.text,
                fontWeight: 700,
                fontSize: 11,
                cursor: c.status === "maintenance" ? "default" : "pointer",
                opacity: c.status === "maintenance" ? 0.45 : 1,
              }}
            >
              {c.status === "maintenance" ? "Bookings (maintenance)" : c.status === "available" ? "Bookings: open" : "Bookings: closed"}
            </button>
            <button
              type="button"
              onClick={() => updateCourtField(c.id, "status", c.status === "maintenance" ? "available" : "maintenance")}
              style={{
                flex: 1,
                minWidth: 120,
                padding: "10px 8px",
                borderRadius: 50,
                border: `1px solid ${C.border}`,
                background: "#1a2e1f",
                color: C.text,
                fontWeight: 700,
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              {c.status === "maintenance" ? "End maintenance" : "Maintenance"}
            </button>
            <button
              type="button"
              onClick={() => updateCourtField(c.id, "visible", c.visible === false ? true : false)}
              style={{
                flex: 1,
                minWidth: 120,
                padding: "10px 8px",
                borderRadius: 50,
                border: "none",
                background: c.visible !== false ? "rgba(34,228,85,0.12)" : "#1a2e1f",
                color: c.visible !== false ? C.green : C.textMuted,
                fontWeight: 700,
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              {c.visible !== false ? "Visible" : "Hidden"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
