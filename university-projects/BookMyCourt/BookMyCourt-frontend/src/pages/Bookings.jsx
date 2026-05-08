import { useMemo, useState } from "react";
import { C } from "../theme.js";
import { Icon } from "../components/Ui.jsx";
import { RatingModal } from "../components/RatingModal.jsx";

export function Bookings({ bookings, onCancelBooking, submitReview, reviewError, onDismissReviewError }) {
  const [tab, setTab] = useState("upcoming");
  const [cancelId, setCancelId] = useState(null);
  const [rateBooking, setRateBooking] = useState(null);

  const lists = useMemo(() => {
    const up = bookings.filter((b) => b.status === "upcoming");
    const past = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");
    return { up, past };
  }, [bookings]);

  const shown = tab === "upcoming" ? lists.up : lists.past;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg, position: "relative" }}>
      <div style={{ padding: `16px var(--page-pad-x) 12px`, borderBottom: `1px solid ${C.border}`, flexShrink: 0, background: "#0c1a10" }}>
        <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 12 }}>My Bookings</div>
        <div style={{ display: "flex", background: "#0f1f13", borderRadius: 50, padding: 4, border: `1px solid ${C.border}` }}>
          {[
            { k: "upcoming", l: "Upcoming" },
            { k: "past", l: "Past" },
          ].map((t) => (
            <button
              key={t.k}
              type="button"
              onClick={() => setTab(t.k)}
              style={{
                flex: 1,
                padding: "10px 8px",
                borderRadius: 50,
                border: "none",
                cursor: "pointer",
                fontWeight: 800,
                fontSize: 12,
                background: tab === t.k ? C.green : "transparent",
                color: tab === t.k ? "#000" : C.textMuted,
              }}
            >
              {t.l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: `16px var(--page-pad-x) 24px` }}>
        {reviewError ? (
          <div
            style={{
              marginBottom: 14,
              padding: "10px 12px",
              borderRadius: 12,
              background: "rgba(232,64,64,0.1)",
              border: `1px solid rgba(232,64,64,0.35)`,
              color: C.red,
              fontSize: 13,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <span style={{ flex: 1, lineHeight: 1.4 }}>{reviewError}</span>
            {onDismissReviewError ? (
              <button type="button" onClick={onDismissReviewError} style={{ flexShrink: 0, background: "none", border: "none", color: C.red, fontWeight: 800, fontSize: 12, cursor: "pointer", padding: 0 }}>
                Dismiss
              </button>
            ) : null}
          </div>
        ) : null}
        {shown.length === 0 && <div style={{ textAlign: "center", color: C.textMuted, padding: `48px var(--page-pad-x)`, fontSize: 14 }}>No bookings here yet.</div>}
        {shown.map((b) => (
          <div key={b.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "14px 14px 12px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 15, lineHeight: 1.2 }}>{b.arena}</div>
                {b.isEvent && b.eventTitle ? (
                  <div style={{ fontSize: 11, color: C.green, marginTop: 4, fontWeight: 700 }}>{b.eventTitle}</div>
                ) : null}
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon n="ticket" color={C.green} size={14} />
                  {b.court}
                </div>
              </div>
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: 50,
                  fontSize: 10,
                  fontWeight: 900,
                  background: b.status === "upcoming" ? "rgba(34,228,85,0.12)" : b.status === "completed" ? "rgba(245,158,11,0.12)" : "rgba(232,64,64,0.1)",
                  color: b.status === "upcoming" ? C.green : b.status === "completed" ? C.orange : C.red,
                  textTransform: "uppercase",
                }}
              >
                {b.status}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textDim }}>
                <Icon n="cal" color={C.textMuted} size={14} />
                {b.date}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textDim }}>
                <Icon n="sun" color={C.textMuted} size={14} />
                {b.time}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
              <div style={{ fontWeight: 900, fontSize: 16 }}>{b.isEvent && !b.amt ? "Event" : `$${b.amt}`}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {b.status === "upcoming" && (
                  <button
                    type="button"
                    onClick={() => setCancelId(b.id)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 50,
                      border: `1px solid ${C.red}`,
                      background: "transparent",
                      color: C.red,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                )}
                {b.status === "completed" && (
                  <button
                    type="button"
                    onClick={() => setRateBooking(b)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 50,
                      border: `1px solid ${C.green}`,
                      background: "rgba(34,228,85,0.08)",
                      color: C.green,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Rate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {cancelId && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 80, padding: `max(16px, var(--page-pad-x))` }} onClick={() => setCancelId(null)} role="presentation">
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" style={{ width: "100%", maxWidth: "min(340px, calc(100vw - 32px))", background: C.card, borderRadius: 18, padding: "20px 18px 18px", border: `1px solid ${C.border}`, boxSizing: "border-box" }}>
            <div style={{ fontWeight: 900, fontSize: 17, marginBottom: 8 }}>Cancel booking?</div>
            <div style={{ color: C.textDim, fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>Cancellations at least 2 hours before start may be fully refunded.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={() => setCancelId(null)} style={{ flex: 1, padding: "12px", borderRadius: 50, border: `1px solid ${C.border}`, background: "#1a2e1f", color: C.text, fontWeight: 700, cursor: "pointer" }}>
                Keep
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onCancelBooking(cancelId);
                  setCancelId(null);
                }}
                style={{ flex: 1, padding: "12px", borderRadius: 50, border: "none", background: C.red, color: "#fff", fontWeight: 800, cursor: "pointer" }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {rateBooking && (
        <RatingModal
          booking={rateBooking}
          onClose={() => setRateBooking(null)}
          onSubmit={(bookingRow, stars, comment) => {
            submitReview(bookingRow, stars, comment);
          }}
        />
      )}
    </div>
  );
}
