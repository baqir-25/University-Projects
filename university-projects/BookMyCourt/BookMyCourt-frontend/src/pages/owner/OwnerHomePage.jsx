import { useOutletContext } from "react-router-dom";
import { C } from "../../theme.js";
import { dealRunLabel } from "./ownerUtils.js";

export function OwnerHomePage() {
  const { arena, stats, homeMutateError, updateCourtField, removeOwnerEvent, openAddEvent, openAddDeal } =
    useOutletContext();
  if (!arena) return null;

  return (
    <div style={{ padding: `16px var(--page-pad-x) 24px`, overflowY: "auto", WebkitOverflowScrolling: "touch", flex: 1 }}>
      {homeMutateError ? (
        <div
          style={{
            background: "rgba(232,64,64,0.08)",
            border: "1px solid rgba(232,64,64,0.3)",
            borderRadius: 14,
            padding: "10px 14px",
            marginBottom: 14,
            color: C.red,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {homeMutateError}
        </div>
      ) : null}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          ["Courts open", `${stats.openCourts}/${stats.totalCourts}`],
          ["Bookings today", String(stats.bookingsToday)],
          ["Revenue · sample", `$${stats.revenue}`],
          ["Arena status", arena.open ? "Open" : "Closed"],
        ].map(([a, b]) => (
          <div key={a} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 12 }}>
            <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 800, letterSpacing: 0.4 }}>{a}</div>
            <div style={{ fontWeight: 900, fontSize: 17, marginTop: 6 }}>{b}</div>
          </div>
        ))}
      </div>
      <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 10 }}>Court visibility & bookings</div>
      <div style={{ fontSize: 11, color: C.textDim, marginBottom: 10, lineHeight: 1.45 }}>
        <strong style={{ color: C.textMuted }}>Visible</strong> — listed on the venue.{" "}
        <strong style={{ color: C.textMuted }}>Bookings</strong> — players can reserve (off when closed or in maintenance).
      </div>
      {arena.courts.map((c) => {
        const bookingOpen = c.status === "available";
        const inMaintenance = c.status === "maintenance";
        return (
          <div
            key={c.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              padding: "12px 12px",
              borderRadius: 14,
              background: C.card,
              border: `1px solid ${C.border}`,
              marginBottom: 8,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{c.sport}</div>
              {inMaintenance && (
                <div style={{ fontSize: 10, color: C.orange, fontWeight: 700, marginTop: 4 }}>
                  Maintenance — use Courts tab to reopen
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexShrink: 0, gap: 6 }}>
              <button
                type="button"
                onClick={() => updateCourtField(c.id, "visible", c.visible === false ? true : false)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 50,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: 10,
                  background: c.visible !== false ? C.green : "#1a2e1f",
                  color: c.visible !== false ? "#000" : C.textMuted,
                }}
              >
                {c.visible !== false ? "Listed" : "Hidden"}
              </button>
              <button
                type="button"
                disabled={inMaintenance}
                onClick={() => {
                  if (inMaintenance) return;
                  updateCourtField(c.id, "status", bookingOpen ? "unavailable" : "available");
                }}
                style={{
                  padding: "8px 10px",
                  borderRadius: 50,
                  border: "none",
                  cursor: inMaintenance ? "default" : "pointer",
                  fontWeight: 800,
                  fontSize: 10,
                  background: bookingOpen ? "rgba(34,228,85,0.12)" : "#1a2e1f",
                  color: bookingOpen ? C.green : C.textMuted,
                  opacity: inMaintenance ? 0.45 : 1,
                }}
              >
                {bookingOpen ? "Bookings on" : "Bookings off"}
              </button>
            </div>
          </div>
        );
      })}
      <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 8, marginTop: 20 }}>Discover events</div>
      <div style={{ fontSize: 12, color: C.textDim, marginBottom: 12, lineHeight: 1.45 }}>
        Listed under Events on the player Discover tab for this arena.
      </div>
      {(arena.events || []).length === 0 && (
        <div
          style={{
            fontSize: 12,
            color: C.textMuted,
            marginBottom: 12,
            padding: "12px 14px",
            borderRadius: 14,
            border: `1px dashed ${C.border}`,
            textAlign: "center",
          }}
        >
          No events yet — add one so players can register.
        </div>
      )}
      {(arena.events || []).map((ev) => (
        <div
          key={ev.ownerEventId}
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 10,
            padding: "12px 12px",
            borderRadius: 14,
            background: C.card,
            border: `1px solid ${C.border}`,
            marginBottom: 8,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{ev.title}</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>
              {ev.date} · {ev.spots}/{ev.total} spots left
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeOwnerEvent(ev.ownerEventId)}
            style={{
              flexShrink: 0,
              padding: "6px 10px",
              borderRadius: 50,
              border: `1px solid ${C.red}`,
              background: "transparent",
              color: C.red,
              fontWeight: 700,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={openAddEvent}
        style={{
          width: "100%",
          marginTop: 4,
          marginBottom: 8,
          padding: "12px 14px",
          borderRadius: 50,
          border: `1px dashed ${C.green}`,
          background: "rgba(34,228,85,0.06)",
          color: C.green,
          fontWeight: 800,
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        + Add event
      </button>

      <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 8, marginTop: 20 }}>Discover deals</div>
      <div style={{ fontSize: 12, color: C.textDim, marginBottom: 12, lineHeight: 1.45 }}>
        Discount promotions for players on the Discover tab (when the deal is active and within its dates).
      </div>
      {(arena.deals || []).length === 0 && (
        <div
          style={{
            fontSize: 12,
            color: C.textMuted,
            marginBottom: 12,
            padding: "12px 14px",
            borderRadius: 14,
            border: `1px dashed ${C.border}`,
            textAlign: "center",
          }}
        >
          No deals yet — add a discount window for players.
        </div>
      )}
      {(arena.deals || []).map((dl) => (
        <div
          key={dl.ownerDealId}
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 10,
            padding: "12px 12px",
            borderRadius: 14,
            background: C.card,
            border: `1px solid ${C.border}`,
            marginBottom: 8,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{dl.title}</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>
              {dl.discountPercent}% off · {dealRunLabel(dl.startsAt, dl.endsAt)}
              {dl.isActive === false ? " · inactive" : ""}
            </div>
            {dl.description ? (
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 6, lineHeight: 1.4 }}>{dl.description}</div>
            ) : null}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={openAddDeal}
        style={{
          width: "100%",
          marginTop: 4,
          marginBottom: 8,
          padding: "12px 14px",
          borderRadius: 50,
          border: `1px dashed ${C.green}`,
          background: "rgba(34,228,85,0.06)",
          color: C.green,
          fontWeight: 800,
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        + Add deal
      </button>

      <div style={{ marginTop: 18, background: "#0f1f13", border: `1px solid ${C.border}`, borderRadius: 16, padding: 14 }}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>Today&apos;s schedule</div>
        <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.6 }}>
          Use the Bookings tab to view and manage reservations. Toggle court visibility to hide courts from players.
        </div>
      </div>
    </div>
  );
}
