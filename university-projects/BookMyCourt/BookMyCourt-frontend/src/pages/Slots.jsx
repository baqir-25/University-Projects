import { useCallback, useMemo, useState } from "react";
import { C } from "../theme.js";
import { TIME_SLOTS } from "../data/timeSlots.js";
import { SERVER_BOOKING_TIME_GRID } from "../data/serverBookingSlots.js";
import { getDealForSlot } from "../data/offers.js";
import { Btn, Icon } from "../components/Ui.jsx";

function activeDealMatchesSport(activeDeal, sportForDeal) {
  if (!activeDeal?.sport) return true;
  if (!sportForDeal) return true;
  const a = String(activeDeal.sport).toUpperCase().replace(/\s+/g, "");
  const b = String(sportForDeal).toUpperCase().replace(/\s+/g, "");
  return a.includes(b) || b.includes(a) || a.replace(/_/g, "") === b.replace(/_/g, "");
}

function dealForSlotHour(a, sl, sportForDeal, slotDeals, activeDeal, hourlyBase) {
  const fromList = getDealForSlot(a.name, sl, sportForDeal, slotDeals);
  if (fromList) return fromList;
  if (activeDeal && typeof activeDeal.price === "number" && activeDealMatchesSport(activeDeal, sportForDeal)) {
    return {
      discount: activeDeal.discount,
      sport: activeDeal.sport,
      price: activeDeal.price,
      original: activeDeal.original ?? hourlyBase,
    };
  }
  return null;
}

const now = new Date();
export const TODAY = new Date(now.getFullYear(), now.getMonth(), now.getDate());
export const SLOTS_TODAY_ANCHOR = TODAY;
const TOTAL_DAYS = 30;

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function formatHeader(d) {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/** @param {Date} d */
function formatYmdLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function slotSportLabel(arena, selectedSport) {
  if (!selectedSport) return "";
  return selectedSport.replace(/_/g, " ");
}

function vanguardCourts(courts) {
  return (courts || []).filter((c) => c.arenaId === 4);
}

function isContiguous(indices) {
  if (indices.length <= 1) return true;
  const s = [...indices].sort((a, b) => a - b);
  for (let i = 1; i < s.length; i++) {
    if (s[i] !== s[i - 1] + 1) return false;
  }
  return true;
}

export function Slots({
  arena: a,
  activeDeal,
  courts,
  onBack,
  onConfirm,
  onDayChange,
  serverSlotMode = false,
  bookingError = null,
  onDismissBookingError,
  slotDeals = [],
}) {
  const [dayOffset, setDayOffset] = useState(0);
  const [selected, setSelected] = useState([]);
  const isV = a?.id === 4;
  const vgCourts = useMemo(() => vanguardCourts(courts), [courts]);

  const slotSections = useMemo(() => (serverSlotMode ? SERVER_BOOKING_TIME_GRID : TIME_SLOTS), [serverSlotMode]);

  const flatSlots = useMemo(() => {
    const keys = serverSlotMode ? Object.keys(slotSections) : ["Early Morning", "Morning", "Afternoon", "Evening"];
    return keys.flatMap((k) => (slotSections[k] || []).map((sl) => ({ section: k, sl })));
  }, [serverSlotMode, slotSections]);

  const indexOfSlot = useCallback((sl) => flatSlots.findIndex((x) => x.sl === sl), [flatSlots]);

  const sportsVG = useMemo(() => {
    const u = new Set();
    vgCourts.filter((c) => c.status === "available" && c.visible !== false).forEach((c) => u.add(c.sport));
    return [...u];
  }, [vgCourts]);

  const [sportVG, setSportVG] = useState(() => sportsVG[0] || "BASKETBALL");
  const filteredVG = useMemo(() => vgCourts.filter((c) => c.sport === sportVG && c.status === "available" && c.visible !== false), [vgCourts, sportVG]);
  const [courtVG, setCourtVG] = useState(null);

  const activeCourtVG = useMemo(() => filteredVG.find((c) => c.id === (courtVG?.id ?? filteredVG[0]?.id)) || filteredVG[0], [filteredVG, courtVG]);

  const normalCourts = useMemo(() => a?.courts || [], [a]);

  const sportsNormal = a?.sports || [];
  const [sportN, setSportN] = useState(() => sportsNormal[0] || "FOOTBALL");
  const courtsForSportN = useMemo(() => normalCourts.filter((c) => c.sport === sportN && c.status === "available"), [normalCourts, sportN]);
  const [courtN, setCourtN] = useState(null);
  const activeCourtN = useMemo(() => courtsForSportN.find((c) => c.id === (courtN?.id ?? courtsForSportN[0]?.id)) || courtsForSportN[0], [courtsForSportN, courtN]);

  const selectedSportToken = isV ? sportVG : sportN;
  const hourlyBase = isV ? activeCourtVG?.price ?? a.price : activeCourtN ? a.price : a.price;

  const arenaDeals = useMemo(
    () =>
      (slotDeals || []).filter(
        (d) => d && (d.arena === a.name || (d.fromApi && String(d.arenaId) === String(a.id)))
      ),
    [slotDeals, a.name, a.id]
  );

  const toggleSlot = (sl) => {
    if (serverSlotMode) {
      setSelected((prev) => (prev.includes(sl) ? [] : [sl]));
      return;
    }
    setSelected((prev) => {
      if (prev.includes(sl)) {
        return prev.filter((x) => x !== sl);
      }
      const next = [...prev, sl];
      const idxs = next.map(indexOfSlot).filter((i) => i >= 0);
      if (!isContiguous(idxs)) {
        return [sl];
      }
      return next.sort((x, y) => indexOfSlot(x) - indexOfSlot(y));
    });
  };

  const sortedSel = useMemo(() => [...selected].sort((x, y) => indexOfSlot(x) - indexOfSlot(y)), [selected, indexOfSlot]);
  const hours = sortedSel.length || 0;

  let total = 0;
  let savings = 0;
  let representativeDeal = null;
  const sportForDeal = slotSportLabel(a, selectedSportToken);
  for (const sl of sortedSel) {
    const deal = dealForSlotHour(a, sl, sportForDeal, slotDeals, activeDeal, hourlyBase);
    if (deal) {
      total += deal.price;
      savings += Math.max(0, (deal.original ?? hourlyBase) - deal.price);
      representativeDeal = representativeDeal || deal;
    } else {
      total += hourlyBase;
    }
  }
  const pricing = { total, savings, representativeDeal };

  const dayDate = addDays(SLOTS_TODAY_ANCHOR, dayOffset);
  const dateLabel = formatHeader(dayDate);

  const handleDayTap = (off) => {
    setDayOffset(off);
    setSelected([]);
    const d = addDays(SLOTS_TODAY_ANCHOR, off);
    const lbl = formatHeader(d);
    onDayChange?.(off, lbl);
  };

  const slotLabel = sortedSel.length ? (sortedSel.length === 1 ? sortedSel[0] : `${sortedSel[0]} – ${sortedSel[sortedSel.length - 1]}`) : "";

  const courtName = isV ? activeCourtVG?.name || "Court" : activeCourtN?.name || "Court";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg }}>
      <div style={{ flexShrink: 0, padding: `14px var(--page-pad-x)`, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, background: "#0c1a10" }}>
        <button type="button" onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <Icon n="back" color={C.text} size={22} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Pick a time</div>
          <div style={{ fontSize: 12, color: C.textMuted }}>{a.name}</div>
        </div>
      </div>

      <div style={{ flexShrink: 0, padding: "12px 0 4px", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: `0 var(--page-pad-x) 10px`, WebkitOverflowScrolling: "touch" }}>
          {Array.from({ length: TOTAL_DAYS }, (_, i) => {
            const d = addDays(SLOTS_TODAY_ANCHOR, i);
            const active = i === dayOffset;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleDayTap(i)}
                style={{
                  flexShrink: 0,
                  width: 56,
                  padding: "10px 8px",
                  borderRadius: 14,
                  border: `1px solid ${active ? C.green : C.border}`,
                  background: active ? "rgba(34,228,85,0.12)" : C.card,
                  cursor: "pointer",
                  color: C.text,
                }}
              >
                <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 700 }}>{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
                <div style={{ fontWeight: 900, fontSize: 16, marginTop: 4 }}>{d.getDate()}</div>
              </button>
            );
          })}
        </div>
        <div style={{ padding: `0 var(--page-pad-x) 12px`, fontSize: 12, color: C.textDim }}>
          Selected day: <span style={{ color: C.green, fontWeight: 700 }}>{dateLabel}</span>
        </div>
      </div>

      {isV && (
        <div style={{ padding: `12px var(--page-pad-x) 0`, display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredVG.length === 0 && (
            <div style={{ color: C.orange, fontWeight: 700, fontSize: 13 }}>No courts available for this sport right now.</div>
          )}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.textMuted, marginBottom: 6 }}>SPORT</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {sportsVG.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSportVG(s);
                    setCourtVG(null);
                    setSelected([]);
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 50,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 12,
                    background: sportVG === s ? C.green : "#1a2e1f",
                    color: sportVG === s ? "#000" : C.textMuted,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.textMuted, marginBottom: 6 }}>COURT</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredVG.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCourtVG(c);
                    setSelected([]);
                  }}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: `1px solid ${activeCourtVG?.id === c.id ? C.green : C.border}`,
                    background: activeCourtVG?.id === c.id ? "rgba(34,228,85,0.08)" : C.card,
                    cursor: "pointer",
                    textAlign: "left",
                    color: C.text,
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>${c.price}/hr · {c.sport}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isV && (
        <div style={{ padding: `12px var(--page-pad-x) 0`, display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.textMuted, marginBottom: 6 }}>SPORT</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {sportsNormal.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSportN(s);
                    setCourtN(null);
                    setSelected([]);
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 50,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 12,
                    background: sportN === s ? C.green : "#1a2e1f",
                    color: sportN === s ? "#000" : C.textMuted,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.textMuted, marginBottom: 6 }}>COURT</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {courtsForSportN.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCourtN(c);
                    setSelected([]);
                  }}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: `1px solid ${activeCourtN?.id === c.id ? C.green : C.border}`,
                    background: activeCourtN?.id === c.id ? "rgba(34,228,85,0.08)" : C.card,
                    cursor: "pointer",
                    textAlign: "left",
                    color: C.text,
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>${a.price}/hr</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {arenaDeals.length > 0 && (
        <div style={{ padding: `12px var(--page-pad-x) 0` }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.textMuted, marginBottom: 8 }}>ACTIVE DEALS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {arenaDeals.map((d, i) => (
              <div key={i} style={{ borderRadius: 14, padding: "10px 12px", background: "rgba(34,228,85,0.06)", border: `1px solid ${C.green}33` }}>
                <div style={{ fontWeight: 900, color: C.green }}>{d.discount}</div>
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>
                  {d.sport} · {d.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeDeal && (
        <div style={{ margin: `12px var(--page-pad-x) 0`, borderRadius: 14, padding: "10px 12px", background: C.card, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700 }}>FEATURED</div>
          <div style={{ fontWeight: 800, fontSize: 14, marginTop: 4 }}>
            {activeDeal.discount} on {activeDeal.sport}
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: `14px var(--page-pad-x) 120px` }}>
        {Object.entries(slotSections).map(([section, slots]) => (
          <div key={section} style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10, color: C.textDim }}>{section}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {slots.map((sl) => {
                const on = selected.includes(sl);
                const deal = dealForSlotHour(a, sl, slotSportLabel(a, selectedSportToken), slotDeals, activeDeal, hourlyBase);
                return (
                  <button
                    key={sl}
                    type="button"
                    onClick={() => toggleSlot(sl)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: `1px solid ${on ? C.green : C.border}`,
                      background: on ? "rgba(34,228,85,0.15)" : "#0f1f13",
                      color: on ? C.green : C.text,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      flex: "1 1 90px",
                      minWidth: 0,
                      maxWidth: "100%",
                    }}
                  >
                    <div>{sl}</div>
                    {deal && <div style={{ fontSize: 9, color: C.orange, marginTop: 4, fontWeight: 800 }}>{deal.discount}</div>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ flexShrink: 0, padding: `12px var(--page-pad-x) max(18px, env(safe-area-inset-bottom, 0px))`, borderTop: `1px solid ${C.border}`, background: "#0c1a10" }}>
        {bookingError ? (
          <div
            style={{
              marginBottom: 10,
              padding: "10px 12px",
              borderRadius: 12,
              background: "rgba(232,64,64,0.1)",
              border: `1px solid rgba(232,64,64,0.35)`,
              color: C.red,
              fontSize: 12,
              lineHeight: 1.4,
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <span style={{ flex: 1 }}>{bookingError}</span>
            {onDismissBookingError ? (
              <button type="button" onClick={onDismissBookingError} style={{ flexShrink: 0, background: "none", border: "none", color: C.red, fontWeight: 800, fontSize: 11, cursor: "pointer", padding: 0 }}>
                Dismiss
              </button>
            ) : null}
          </div>
        ) : null}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: C.textMuted }}>Total ({hours} hr{hours === 1 ? "" : "s"})</div>
            <div style={{ fontWeight: 900, fontSize: 20 }}>${pricing.total || 0}</div>
            {pricing.savings > 0 && <div style={{ fontSize: 12, color: C.orange, fontWeight: 700 }}>You save ${pricing.savings}</div>}
          </div>
          <div style={{ textAlign: "right", fontSize: 12, color: C.textDim, maxWidth: "52%" }}>
            {slotLabel || "Select consecutive slots"}
            <div style={{ marginTop: 4, color: C.green }}>{courtName}</div>
          </div>
        </div>
        <Btn
          onClick={() => {
            if (hours <= 0) return;
            const dateYmd = formatYmdLocal(dayDate);
            const courtObj = isV ? activeCourtVG : activeCourtN;
            onConfirm(a, slotLabel, hours, pricing.total, pricing.representativeDeal, pricing.savings, courtName, {
              dateYmd,
              apiTimeSlots: [...sortedSel],
              court: courtObj,
            });
          }}
          style={{ opacity: hours === 0 ? 0.45 : 1, cursor: hours === 0 ? "not-allowed" : "pointer" }}
        >
          Continue
        </Btn>
      </div>
    </div>
  );
}
