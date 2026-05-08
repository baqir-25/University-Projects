/**
 * Discover tab — public APIs:
 * - Arenas: GET /api/arenas/discover
 * - Deals: GET /api/deals — all currently active deals, arena populated; sorted by endsAt asc (see `api/publicDeals.js`)
 * - Events: GET /api/events (see `api/publicEvents.js`)
 * - Register / cancel: POST|DELETE /api/events/:id/register (Bearer). See `api/eventRegistration.js`.
 */
import { C } from "../theme.js";
import { SPORT_CATEGORIES } from "../data/discoverMeta.js";
import { ArenaImg, Icon } from "../components/Ui.jsx";

function eventRegKey(ev) {
  return String(ev.id ?? ev.ownerEventId ?? ev._id ?? ev.title ?? "");
}

/** @param {string | undefined} iso */
function dealEndsLabel(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function Discover({
  onArena,
  onDeal,
  onRegister,
  onUnregister,
  registeredEvents,
  arenas,
  events = [],
  deals = [],
  discoverLoading = false,
  eventRegisterBusyKey = null,
  eventRegisterError = null,
  onDismissEventRegisterError,
}) {
  const list = arenas || [];

  const openSport = (label) => {
    const found = list.find((a) => (a.sports || []).some((s) => s.toLowerCase().includes(label.toLowerCase())));
    if (found) onArena?.(found);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", background: C.bg, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
      <div style={{ padding: `18px var(--page-pad-x) 12px` }}>
        <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: -0.5, marginBottom: 4 }}>Discover</div>
        <div style={{ color: C.textDim, fontSize: 13 }}>Arenas, deals, events, and sports near you</div>
      </div>

      <div style={{ padding: `8px var(--page-pad-x) 8px` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 10 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Arenas</div>
          <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>
            {discoverLoading ? "…" : `${list.length} venue${list.length === 1 ? "" : "s"}`}
          </span>
        </div>
        {list.length === 0 && !discoverLoading && (
          <div style={{ color: C.textMuted, fontSize: 13, padding: "10px 0 4px", lineHeight: 1.45 }}>
            No venues in the catalog yet. Check back soon or try another city when your API supports it.
          </div>
        )}
        {list.map((a) => (
          <button
            key={String(a.id)}
            type="button"
            onClick={() => onArena?.(a)}
            style={{
              width: "100%",
              display: "flex",
              gap: 12,
              padding: 10,
              marginBottom: 10,
              borderRadius: 14,
              background: C.card,
              border: `1px solid ${C.border}`,
              cursor: "pointer",
              alignItems: "center",
              color: C.text,
            }}
          >
            <div style={{ width: 72, height: 72, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
              <ArenaImg src={a.img || undefined} alt="" height={72} sport={(a.sports && a.sports[0]) || ""} />
            </div>
            <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.25 }}>{a.name}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                <Icon n="pin" color={C.textMuted} size={12} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.location}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>
                  ${a.price}/{a.priceSuffix || "hr"}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: C.textDim }}>
                  <Icon n="star" color={C.orange} size={12} />
                  {a.rating}
                  {typeof a.reviewCount === "number" && a.reviewCount > 0 ? (
                    <span style={{ color: C.textMuted }}>({a.reviewCount})</span>
                  ) : null}
                </span>
              </div>
              {(a.sports || []).length > 0 && (
                <div style={{ fontSize: 10, color: C.textMuted, marginTop: 6, fontWeight: 600 }}>
                  {(a.sports || []).slice(0, 4).join(" · ")}
                </div>
              )}
            </div>
            <Icon n="arr" color={C.textMuted} size={18} />
          </button>
        ))}
      </div>

      <div style={{ padding: `8px var(--page-pad-x) 8px` }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Hot deals</div>
        {discoverLoading ? (
          <div style={{ color: C.textMuted, fontSize: 13, padding: "12px 14px", lineHeight: 1.45 }}>Loading promotions…</div>
        ) : deals.length === 0 ? (
          <div style={{ color: C.textMuted, fontSize: 13, padding: "12px 14px", borderRadius: 14, border: `1px dashed ${C.border}`, lineHeight: 1.45 }}>
            No active promotions right now. Check back soon.
          </div>
        ) : (
          deals.map((d, i) => {
          const arena = d.fromApi
            ? list.find((a) => String(a.id) === String(d.arenaId))
            : list.find((a) => a.name === d.arena);
          const thumbSrc = d.fromApi ? d.imageUrl || arena?.img : arena?.img;
          const sportLine = d.sport || (d.fromApi && d.arenaRef?.sport) || "";
          const locLine = d.fromApi && d.arenaRef?.location ? String(d.arenaRef.location) : "";
          const endsLbl = d.fromApi && d.endsAt ? dealEndsLabel(d.endsAt) : "";
          return (
            <button
              key={d.fromApi ? d.id : i}
              type="button"
              onClick={() => onDeal(arena || null, d)}
              style={{
                width: "100%",
                display: "flex",
                gap: 12,
                padding: 10,
                marginBottom: 10,
                borderRadius: 16,
                background: C.card,
                border: `1px solid ${C.border}`,
                cursor: "pointer",
                textAlign: "left",
                color: C.text,
              }}
            >
              <div style={{ width: 72, height: 72, borderRadius: 14, overflow: "hidden", flexShrink: 0 }}>
                {thumbSrc || arena ? (
                  <ArenaImg src={thumbSrc || arena?.img || undefined} alt="" height={72} sport={(arena?.sports && arena.sports[0]) || sportLine || ""} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "#1a2e1f" }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 900, fontSize: 15 }}>{d.discount}</div>
                {d.fromApi && d.title ? (
                  <div style={{ fontSize: 12, color: C.textDim, marginTop: 4, lineHeight: 1.35 }}>{d.title}</div>
                ) : null}
                <div style={{ fontSize: 13, marginTop: 4 }}>{d.arena}</div>
                {locLine ? (
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <Icon n="pin" color={C.textMuted} size={12} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{locLine}</span>
                  </div>
                ) : null}
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
                  {sportLine}
                  {d.time ? ` · ${d.time}` : ""}
                </div>
                {endsLbl ? (
                  <div style={{ fontSize: 11, color: C.orange, marginTop: 6, fontWeight: 800 }}>Ends {endsLbl}</div>
                ) : null}
                {d.price != null && d.original != null ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <span style={{ fontWeight: 900, color: C.green }}>${d.price}</span>
                    <span style={{ fontSize: 12, color: C.textMuted, textDecoration: "line-through" }}>${d.original}</span>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8, fontWeight: 600 }}>View venue & availability</div>
                )}
              </div>
              <Icon n="arr" color={C.textMuted} size={18} />
            </button>
          );
        })
        )}
      </div>

      <div style={{ padding: `8px var(--page-pad-x) 24px` }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Events</div>
        {eventRegisterError ? (
          <div
            style={{
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 12,
              background: "rgba(232,64,64,0.1)",
              border: `1px solid rgba(232,64,64,0.35)`,
              color: C.red,
              fontSize: 13,
              lineHeight: 1.4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <span style={{ flex: 1 }}>{eventRegisterError}</span>
            {onDismissEventRegisterError ? (
              <button
                type="button"
                onClick={onDismissEventRegisterError}
                style={{ flexShrink: 0, background: "none", border: "none", color: C.red, fontWeight: 800, fontSize: 12, cursor: "pointer", padding: 0 }}
              >
                Dismiss
              </button>
            ) : null}
          </div>
        ) : null}
        {events.map((ev) => {
          const ek = eventRegKey(ev);
          const reg = registeredEvents?.includes(ek);
          const busy = eventRegisterBusyKey != null && eventRegisterBusyKey === String(ev.id ?? ek);
          return (
            <div key={ek || ev.title} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "14px 14px 12px", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ fontSize: 26 }}>{ev.sport}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900, fontSize: 15 }}>{ev.title}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>{ev.date}</div>
                  <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>{ev.arena}</div>
                  <div style={{ fontSize: 12, color: C.green, marginTop: 6, fontWeight: 700 }}>
                    {ev.total != null && ev.total > 0
                      ? `${ev.spots ?? 0} / ${ev.total} spots left`
                      : ev.spots != null && ev.spots > 0
                        ? `${ev.spots} spots left`
                        : "Open registration"}
                  </div>
                </div>
              </div>
              {reg ? (
                <button
                  type="button"
                  disabled={busy || !onUnregister}
                  onClick={() => !busy && onUnregister?.(ev)}
                  style={{
                    width: "100%",
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 50,
                    border: `1px solid ${C.border}`,
                    cursor: busy ? "wait" : "pointer",
                    fontWeight: 800,
                    background: "#1a2e1f",
                    color: C.textMuted,
                  }}
                >
                  {busy ? "…" : "Cancel registration"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => !busy && onRegister?.(ev)}
                  style={{
                    width: "100%",
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 50,
                    border: "none",
                    cursor: busy ? "wait" : "pointer",
                    fontWeight: 800,
                    background: C.green,
                    color: "#000",
                    opacity: busy ? 0.7 : 1,
                  }}
                >
                  {busy ? "…" : "Register"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
