import { C } from "../theme.js";
import { Btn, Icon } from "../components/Ui.jsx";

export function Confirmed({ arena: a, slot, onHome, onBookings, bookingId }) {
  const savings = slot?.savings || 0;
  const id = bookingId || slot?.bookingId || "#BMC-88291";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
      <div style={{ padding: `16px var(--page-pad-x) 0`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <button type="button" onClick={onHome} style={{ width: 34, height: 34, borderRadius: "50%", background: "#1a2e1f", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon n="x" color={C.text} size={16} />
        </button>
        <span style={{ fontWeight: 800, fontSize: 15 }}>Booking Confirmed</span>
        <div style={{ width: 34 }} />
      </div>
      <div style={{ flex: 1, padding: `24px var(--page-pad-x) 0`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 76, height: 76, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: `0 0 36px ${C.green}55` }}>
          <Icon n="check" color="#000" size={34} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 6, textAlign: "center" }}>Reservation Successful!</h2>
        <p style={{ color: C.textDim, textAlign: "center", lineHeight: 1.5, marginBottom: 20, maxWidth: "min(260px, 100%)", fontSize: 13 }}>
          Your court at <span style={{ color: C.green, fontWeight: 700 }}>BookMyCourt</span> has been reserved. Check your email for the receipt.
        </p>
        <div style={{ width: "100%", background: "#0f1f13", borderRadius: 16, padding: "16px", border: `1px solid ${C.border}`, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
            <div>
              <div style={{ color: C.textMuted, fontSize: 10, fontWeight: 600, letterSpacing: 0.5 }}>BOOKING ID</div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{id}</div>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "#1a2e1f", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon n="ticket" color={C.green} size={16} />
            </div>
          </div>
          {[
            ["pin", "Arena & Court", `${a.name} — ${slot?.courtName || "Court"}`],
            ["cal", "Date", slot?.date || "—"],
            ["sun", "Time Slot", slot?.label || "—"],
            ["ticket", "Duration", `${slot?.hours || 1} hr${(slot?.hours || 1) > 1 ? "s" : ""} · $${slot?.total ?? a.price}.00`],
            ...(savings > 0 ? [["star", "Deal Savings", `You saved $${savings}.00! 🎉`]] : []),
          ].map(([ic, lb, vl]) => (
            <div key={lb} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "#1a2e1f", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon n={ic} color={C.green} size={14} />
              </div>
              <div>
                <div style={{ color: C.textMuted, fontSize: 10 }}>{lb}</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{vl}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: `0 var(--page-pad-x) max(24px, env(safe-area-inset-bottom, 0px))`, flexShrink: 0 }}>
        <Btn onClick={onBookings} style={{ marginBottom: 10 }}>
          View My Bookings
        </Btn>
        <Btn onClick={onHome} style={{ background: "#0f1f13", border: `1px solid ${C.border}`, color: C.text }}>
          Go to Home
        </Btn>
        <p style={{ textAlign: "center", fontSize: 11, color: C.textMuted, marginTop: 10 }}>ⓘ CANCEL AT LEAST 2 HOURS BEFORE THE SLOT FOR FULL REFUND</p>
      </div>
    </div>
  );
}
