import { useOutletContext } from "react-router-dom";
import { C } from "../../theme.js";
import { Btn } from "../../components/Ui.jsx";

export function OwnerSettingsPage() {
  const {
    arena,
    openEditArena,
    settingsMutateError,
    toggleArenaAvailability,
    availToggling,
    courts,
    onLogout,
    openAddArena,
  } = useOutletContext();
  return (
    <div style={{ padding: `16px var(--page-pad-x) 24px`, overflowY: "auto", WebkitOverflowScrolling: "touch", flex: 1 }}>
      <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 12 }}>Arena settings</div>
      {arena ? (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Arena</div>
          <div style={{ fontWeight: 800 }}>{arena.name}</div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 6 }}>{arena.location}</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 8, lineHeight: 1.45 }}>{arena.sport}</div>
          <button
            type="button"
            onClick={openEditArena}
            style={{
              width: "100%",
              marginTop: 12,
              padding: "11px 14px",
              borderRadius: 50,
              border: `1px solid ${C.green}`,
              background: "rgba(34,228,85,0.08)",
              color: C.green,
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Edit venue details
          </button>
        </div>
      ) : (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 14, marginBottom: 12 }}>
          <div style={{ fontWeight: 800 }}>No arena linked yet</div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 6 }}>
            Add your first arena to start managing courts, bookings, events, and deals.
          </div>
        </div>
      )}
      {settingsMutateError ? (
        <div
          style={{
            background: "rgba(232,64,64,0.1)",
            border: "1px solid rgba(232,64,64,0.35)",
            borderRadius: 12,
            padding: "10px 12px",
            marginBottom: 12,
            color: C.red,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {settingsMutateError}
        </div>
      ) : null}
      {arena ? (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 14px", borderRadius: 14, background: C.card, border: `1px solid ${C.border}` }}>
            <span style={{ fontWeight: 700 }}>Accepting bookings</span>
            <button
              type="button"
              aria-busy={availToggling}
              disabled={availToggling}
              onClick={toggleArenaAvailability}
              style={{
                minWidth: 52,
                height: 28,
                borderRadius: 20,
                border: "none",
                cursor: availToggling ? "wait" : "pointer",
                opacity: availToggling ? 0.6 : 1,
                background: arena.open ? C.green : "#1a2e1f",
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 10 }}>Public player view sync: {courts.length} Vanguard courts</div>
        </>
      ) : null}
      <Btn onClick={openAddArena} style={{ marginTop: 14, background: "#1a2e1f", border: `1px solid ${C.border}`, color: C.green }}>
        + Add new arena
      </Btn>
      <Btn onClick={onLogout} style={{ marginTop: 16, background: "rgba(232,64,64,0.12)", border: `1px solid ${C.red}`, color: C.red }}>
        Log out
      </Btn>
    </div>
  );
}
