import { useMemo, useState } from "react";
import logoImg from "../assets/logo.png";
import { C } from "../theme.js";
import { NOTIF_ICONS } from "../data/constants.js";
import { ArenaImg, Icon } from "../components/Ui.jsx";

function sportMatches(filter, arenaSports) {
  if (filter === "All") return true;
  const f = filter.toUpperCase();
  return arenaSports.some((s) => s.toUpperCase().includes(f) || f.includes(s.split(" ")[0]?.toUpperCase()));
}

function shouldHideVanguard(vanguardCourts) {
  if (!vanguardCourts || vanguardCourts.length === 0) return false;
  return vanguardCourts.every((c) => c.status !== "available" || c.visible === false);
}

export function Home({
  onArena,
  courts,
  arenas,
  notifications,
  unreadCount,
  onMarkAllRead,
  onMarkRead,
  onDeleteNotif,
  discoverLoading = false,
}) {
  const [sport, setSport] = useState("All");
  const [q, setQ] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);

  const sportFilters = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const ar of arenas || []) {
      for (const raw of ar.sports || []) {
        const s = String(raw).trim();
        if (!s) continue;
        const key = s.toUpperCase();
        if (seen.has(key)) continue;
        seen.add(key);
        const pretty = s
          .toLowerCase()
          .split(/[\s_]+/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        out.push(pretty);
      }
    }
    out.sort((a, b) => a.localeCompare(b));
    return ["All", ...out];
  }, [arenas]);

  const topRatedId = useMemo(() => {
    if (!arenas?.length) return null;
    return [...arenas].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]?.id ?? null;
  }, [arenas]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return (arenas || []).filter((a) => {
      if (a.id === 4 && shouldHideVanguard(courts)) return false;
      if (!sportMatches(sport, a.sports || [])) return false;
      if (!qq) return true;
      return (a.name + " " + (a.location || "")).toLowerCase().includes(qq);
    });
  }, [arenas, sport, q, courts]);

  const featured = filtered.slice(0, 6);
  const rest = filtered.slice(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", background: C.bg, position: "relative" }}>
      <div style={{ padding: `14px var(--page-pad-x) 10px`, borderBottom: `1px solid ${C.border}`, background: "#0c1a10", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src={logoImg} alt="" style={{ width: 34, height: 34, objectFit: "contain" }} />
            <span style={{ fontWeight: 900, fontSize: 17, letterSpacing: -0.5 }}>BookMyCourt</span>
          </div>
          <button
            type="button"
            onClick={() => setShowNotifs(true)}
            style={{ position: "relative", width: 40, height: 40, borderRadius: 12, background: "#1a2e1f", border: `1px solid ${C.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Icon n="bell" color={C.text} size={20} />
            {unreadCount > 0 && (
              <span style={{ position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, background: C.red, color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", display: "flex", pointerEvents: "none" }}>
            <Icon n="search" color={C.textMuted} size={18} />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search arenas, area..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px 14px 12px 42px",
              borderRadius: 50,
              border: `1px solid ${C.border}`,
              background: "#0f1f13",
              color: C.text,
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginRight: -6 }}>
          {sportFilters.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSport(s)}
              style={{
                flexShrink: 0,
                padding: "8px 14px",
                borderRadius: 50,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 12,
                background: sport === s ? C.green : "#1a2e1f",
                color: sport === s ? "#000" : C.textMuted,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: `14px var(--page-pad-x) 24px` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 10 }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>Featured near you</span>
          <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>
            {discoverLoading ? "…" : `${filtered.length} venues`}
          </span>
        </div>
        {featured.length === 0 && !discoverLoading && (
          <div style={{ color: C.textMuted, fontSize: 14, textAlign: "center", padding: "28px 12px", lineHeight: 1.45 }}>
            No venues yet. Connect the app to your API or add arenas to see them here.
          </div>
        )}
        {featured.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onArena(a)}
            style={{
              width: "100%",
              display: "block",
              padding: 0,
              border: "none",
              background: "none",
              cursor: "pointer",
              marginBottom: 14,
              textAlign: "left",
            }}
          >
            <div style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}`, background: C.card }}>
              <ArenaImg src={a.img || undefined} alt={a.name} height={150} sport={(a.sports && a.sports[0]) || ""} />
              <div style={{ padding: "12px 14px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ fontWeight: 900, fontSize: 15, color: C.text, lineHeight: 1.2 }}>{a.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    <Icon n="star" color={C.orange} size={15} />
                    <span style={{ fontWeight: 800, fontSize: 13 }}>{a.rating}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, color: C.textMuted, fontSize: 12 }}>
                  <Icon n="pin" color={C.textMuted} size={14} />
                  {a.location}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <span style={{ fontSize: 11, color: C.textDim }}>
                    {(a.sports || []).slice(0, 3).join(" · ")}
                  </span>
                  <span style={{ fontWeight: 800, color: C.green, fontSize: 13 }}>
                    ${a.price}/{a.priceSuffix || "hr"}
                  </span>
                </div>
                {topRatedId === a.id && (
                  <div style={{ marginTop: 10, display: "inline-block", padding: "4px 10px", borderRadius: 8, background: "rgba(245,158,11,0.15)", border: `1px solid ${C.orange}55`, color: C.orange, fontSize: 10, fontWeight: 800 }}>
                    TOP RATED
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}

        {rest.length > featured.length && (
          <>
            <div style={{ fontWeight: 800, fontSize: 15, margin: "18px 0 10px" }}>More arenas</div>
            {rest.slice(featured.length).map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => onArena(a)}
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
                }}
              >
                <div style={{ width: 64, height: 64, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                  <ArenaImg src={a.img || undefined} alt="" height={64} sport={(a.sports && a.sports[0]) || ""} />
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{a.location}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginTop: 6 }}>
                    ${a.price}/{a.priceSuffix || "hr"}
                  </div>
                </div>
                <Icon n="arr" color={C.textMuted} size={18} />
              </button>
            ))}
          </>
        )}
      </div>

      {showNotifs && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 50, display: "flex", justifyContent: "flex-end" }} onClick={() => setShowNotifs(false)} role="presentation">
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            style={{
              width: "100%",
              maxWidth: "100%",
              height: "100%",
              background: "#0a130d",
              borderLeft: `1px solid ${C.border}`,
              display: "flex",
              flexDirection: "column",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.5)",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
              boxSizing: "border-box",
            }}
          >
            <div style={{ padding: `16px var(--page-pad-x)`, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ fontWeight: 900, fontSize: 17 }}>Notifications</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {notifications?.length > 0 && (
                  <button type="button" onClick={onMarkAllRead} style={{ background: "none", border: "none", color: C.green, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                    Mark all read
                  </button>
                )}
                <button type="button" onClick={() => setShowNotifs(false)} style={{ background: "#1a2e1f", border: `1px solid ${C.border}`, borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Icon n="x" color={C.text} size={18} />
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: `12px var(--page-pad-x) 24px` }}>
              {(!notifications || notifications.length === 0) && <div style={{ color: C.textMuted, textAlign: "center", padding: "40px 12px", fontSize: 14 }}>You&apos;re all caught up.</div>}
              {notifications?.map((n) => (
                <div
                  key={n.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: 12,
                    borderRadius: 14,
                    marginBottom: 10,
                    background: n.read ? C.card : "rgba(34,228,85,0.06)",
                    border: `1px solid ${n.read ? C.border : `${C.green}33`}`,
                  }}
                >
                  <div style={{ fontSize: 22, lineHeight: 1 }}>{NOTIF_ICONS[n.type] || NOTIF_ICONS.default}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: n.read ? 600 : 800, lineHeight: 1.35 }}>{n.msg}</div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>{n.time}</div>
                    <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                      {!n.read && (
                        <button type="button" onClick={() => onMarkRead(n.id)} style={{ background: "none", border: "none", color: C.green, fontWeight: 700, fontSize: 12, cursor: "pointer", padding: 0 }}>
                          Mark read
                        </button>
                      )}
                      <button type="button" onClick={() => onDeleteNotif(n.id)} style={{ background: "none", border: "none", color: C.red, fontWeight: 700, fontSize: 12, cursor: "pointer", padding: 0 }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
