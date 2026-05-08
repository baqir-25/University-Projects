import { useOutletContext } from "react-router-dom";
import { C } from "../../theme.js";

export function OwnerBookingsPage() {
  const {
    arena,
    ownerBookingsDateFilter,
    setOwnerBookingsDateFilter,
    ownerBookingsStatusFilter,
    setOwnerBookingsStatusFilter,
    ownerBookingsLoading,
    ownerBookingsError,
    ownerBookings,
    markOwnerBookingComplete,
    bookingStatusPendingIds,
  } = useOutletContext();
  if (!arena) return null;

  return (
    <div style={{ padding: `16px var(--page-pad-x) 24px`, overflowY: "auto", WebkitOverflowScrolling: "touch", flex: 1 }}>
      <div style={{ fontSize: 12, color: C.textDim, marginBottom: 14, lineHeight: 1.45 }}>
        Reservations for the selected venue (newest first on the server). Use filters to narrow by calendar day or booking
        status.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, display: "block", marginBottom: 6 }}>
            Filter by day (YYYY-MM-DD)
          </label>
          <input
            type="date"
            value={ownerBookingsDateFilter}
            onChange={(e) => setOwnerBookingsDateFilter(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              background: "#0a130d",
              color: C.text,
              fontSize: 14,
              boxSizing: "border-box",
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, display: "block", marginBottom: 6 }}>Status</label>
          <select
            value={ownerBookingsStatusFilter}
            onChange={(e) => setOwnerBookingsStatusFilter(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              background: "#0a130d",
              color: C.text,
              fontSize: 14,
              boxSizing: "border-box",
              cursor: "pointer",
            }}
          >
            <option value="">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => {
              setOwnerBookingsDateFilter("");
              setOwnerBookingsStatusFilter("");
            }}
            style={{
              padding: "10px 14px",
              borderRadius: 50,
              border: `1px solid ${C.border}`,
              background: "#1a2e1f",
              color: C.textMuted,
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Clear filters
          </button>
        </div>
      </div>

      {ownerBookingsLoading ? (
        <div style={{ textAlign: "center", color: C.textMuted, fontWeight: 600, padding: 24 }}>Loading bookings…</div>
      ) : ownerBookingsError ? (
        <div
          style={{
            background: "rgba(232,64,64,0.08)",
            border: "1px solid rgba(232,64,64,0.3)",
            borderRadius: 14,
            padding: "12px 14px",
            color: C.red,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {ownerBookingsError}
        </div>
      ) : ownerBookings.length === 0 ? (
        <div
          style={{
            fontSize: 13,
            color: C.textMuted,
            textAlign: "center",
            padding: "28px 12px",
            border: `1px dashed ${C.border}`,
            borderRadius: 14,
          }}
        >
          No bookings for this arena with the current filters.
        </div>
      ) : (
        ownerBookings.map((b) => {
          const st = b.status;
          const canMarkComplete = st === "confirmed";
          const markingComplete = bookingStatusPendingIds?.has?.(String(b.id)) === true;
          const statusColor =
            st === "confirmed" ? C.green : st === "cancelled" ? C.red : st === "completed" ? C.orange : C.textMuted;
          return (
            <div key={b.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 900 }}>{b.court}</div>
                  {b.sport ? <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{b.sport}</div> : null}
                  <div style={{ fontSize: 12, color: C.textDim, marginTop: 6 }}>
                    {b.date} · {b.time}
                  </div>
                  <div style={{ fontSize: 12, color: C.textDim, marginTop: 4, wordBreak: "break-word" }}>{b.by}</div>
                </div>
                <div style={{ fontWeight: 900, flexShrink: 0 }}>${b.amt}</div>
              </div>
              <div style={{ marginTop: 10, fontSize: 11, fontWeight: 900, color: statusColor }}>{st.toUpperCase()}</div>
              {canMarkComplete ? (
                <button
                  type="button"
                  onClick={() => markOwnerBookingComplete?.(b.id)}
                  disabled={markingComplete}
                  style={{
                    marginTop: 10,
                    padding: "9px 12px",
                    borderRadius: 10,
                    border: `1px solid ${markingComplete ? C.border : C.green}`,
                    background: markingComplete ? "#132016" : "rgba(34,228,85,0.12)",
                    color: markingComplete ? C.textMuted : C.green,
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: markingComplete ? "default" : "pointer",
                  }}
                >
                  {markingComplete ? "Marking…" : "Mark complete"}
                </button>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
}
