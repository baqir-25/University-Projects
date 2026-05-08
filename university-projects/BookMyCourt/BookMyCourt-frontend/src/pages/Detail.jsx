import { useEffect, useState } from "react";
import { C } from "../theme.js";
import { Amenity, ArenaImg, Btn, Icon } from "../components/Ui.jsx";
import { fetchArenaReviews } from "../api/arenaReviews.js";
import { getApiBase } from "../config/api.js";

function vanguardCourtsList(courts, arenaId) {
  if (!courts?.length) return [];
  return courts.filter((c) => c.arenaId === arenaId);
}

/** @param {{ review: unknown }} props */
function ReviewRow({ review }) {
  const r = review && typeof review === "object" ? /** @type {Record<string, unknown>} */ (review) : {};
  const user = r.user && typeof r.user === "object" ? /** @type {Record<string, unknown>} */ (r.user) : {};
  const name = user.name != null ? String(user.name) : "Player";
  const rating = typeof r.rating === "number" ? r.rating : Number(r.rating) || 0;
  const comment = r.comment != null ? String(r.comment) : "";
  return (
    <div style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontWeight: 800, fontSize: 13 }}>
        {name} · {rating}★
      </div>
      {comment ? <div style={{ fontSize: 12, color: C.textDim, marginTop: 6, lineHeight: 1.45 }}>{comment}</div> : null}
    </div>
  );
}

export function Detail({ arena: a, activeDeal, courts, onBack, onBook, arenas }) {
  const isV = a?.id === 4;
  const list = isV ? vanguardCourtsList(courts, 4) : a?.courts || [];
  const openCourts = list.filter((c) => c.status === "available" && c.visible !== false);
  const allClosed = isV && list.length > 0 && openCourts.length === 0;

  const [reviewsBlock, setReviewsBlock] = useState(/** @type {{ reviews: unknown[]; aggregate?: { averageRating?: number; count?: number } } | null} */ (null));

  useEffect(() => {
    let cancelled = false;
    const aid = a?.id != null ? String(a.id) : "";
    (async () => {
      if (!aid || !getApiBase()) {
        if (!cancelled) setReviewsBlock(null);
        return;
      }
      try {
        const res = await fetchArenaReviews(aid);
        if (!cancelled) setReviewsBlock(res);
      } catch {
        if (!cancelled) setReviewsBlock(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [a?.id]);

  const topRatedId = arenas?.length ? [...arenas].sort((x, y) => (y.rating || 0) - (x.rating || 0))[0]?.id : null;
  const isTop = a && topRatedId === a.id;

  const deal = activeDeal;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg }}>
      <div style={{ flexShrink: 0, position: "relative" }}>
        <ArenaImg src={a.img || undefined} alt={a.name} height={220} sport={(a.sports && a.sports[0]) || ""} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,19,13,0.95) 0%, transparent 55%)" }} />
        <button type="button" onClick={onBack} style={{ position: "absolute", top: 14, left: "var(--page-pad-x)", width: 40, height: 40, borderRadius: "50%", background: "rgba(0,0,0,0.45)", border: `1px solid ${C.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon n="back" color="#fff" size={20} />
        </button>
        <button type="button" style={{ position: "absolute", top: 14, right: "var(--page-pad-x)", width: 40, height: 40, borderRadius: "50%", background: "rgba(0,0,0,0.45)", border: `1px solid ${C.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon n="share" color="#fff" size={18} />
        </button>
        <div style={{ position: "absolute", left: "var(--page-pad-x)", right: "var(--page-pad-x)", bottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>{a.name}</h1>
            {isTop && (
              <span style={{ padding: "3px 8px", borderRadius: 8, background: "rgba(245,158,11,0.2)", border: `1px solid ${C.orange}`, color: C.orange, fontSize: 9, fontWeight: 900, letterSpacing: 0.5 }}>
                TOP RATED
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.textDim, fontSize: 13 }}>
            <Icon n="pin" color={C.green} size={15} />
            {a.location}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 800 }}>
              <Icon n="star" color={C.orange} size={16} /> {a.rating}
            </span>
            <span style={{ color: C.textMuted, fontSize: 12 }}>{a.hours}</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: `16px var(--page-pad-x) 100px` }}>
        {allClosed && (
          <div style={{ background: "rgba(232,64,64,0.08)", border: `1px solid rgba(232,64,64,0.35)`, color: C.red, padding: "12px 14px", borderRadius: 14, fontWeight: 700, fontSize: 13, marginBottom: 14 }}>
            All courts are temporarily unavailable. Please check back later.
          </div>
        )}
        {!allClosed && isV && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 14px", marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: 0.5, marginBottom: 6 }}>OPEN COURTS</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: C.green }}>{openCourts.length} court{openCourts.length === 1 ? "" : "s"} available</div>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>{openCourts.map((c) => c.name).join(" · ") || "Select a sport on the next step."}</div>
          </div>
        )}

        <p style={{ color: C.textDim, fontSize: 13, lineHeight: 1.55, margin: "0 0 16px" }}>{a.description}</p>

        {deal && (
          <div style={{ borderRadius: 16, padding: "14px 16px", marginBottom: 16, background: "linear-gradient(135deg, rgba(34,228,85,0.12), rgba(245,158,11,0.08))", border: `1px solid ${C.green}44` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 15, color: C.green }}>{deal.discount}</div>
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>{deal.sport} · {deal.time}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: C.textMuted }}>from</div>
                <div style={{ fontWeight: 900, fontSize: 18 }}>
                  ${deal.price}
                  <span style={{ fontSize: 12, color: C.textMuted, textDecoration: "line-through", marginLeft: 6 }}>${deal.original}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Amenities</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
          {(a.amenities || []).slice(0, 8).map((x) => (
            <Amenity key={x} type={x} />
          ))}
        </div>

        {reviewsBlock && (reviewsBlock.reviews?.length > 0 || reviewsBlock.aggregate) ? (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>Player reviews</div>
            {reviewsBlock.aggregate && typeof reviewsBlock.aggregate.count === "number" ? (
              <div style={{ fontSize: 13, color: C.textDim, marginBottom: 12 }}>
                <span style={{ fontWeight: 800, color: C.orange }}>{reviewsBlock.aggregate.averageRating ?? "—"}★</span>
                <span style={{ color: C.textMuted }}> · {reviewsBlock.aggregate.count} review{reviewsBlock.aggregate.count === 1 ? "" : "s"}</span>
              </div>
            ) : null}
            {(reviewsBlock.reviews || []).slice(0, 6).map((rev, i) => {
              const rid = rev && typeof rev === "object" && "_id" in rev ? String(/** @type {{ _id?: unknown }} */ (rev)._id) : `r-${i}`;
              return <ReviewRow key={rid} review={rev} />;
            })}
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <button
            type="button"
            style={{ flex: 1, padding: "12px", borderRadius: 50, background: "#1a2e1f", border: `1px solid ${C.border}`, color: C.text, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <Icon n="phone" color={C.green} size={18} />
            Call
          </button>
          <button
            type="button"
            style={{ flex: 1, padding: "12px", borderRadius: 50, background: "#1a2e1f", border: `1px solid ${C.border}`, color: C.text, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <Icon n="pin" color={C.green} size={18} />
            Map
          </button>
        </div>
      </div>

      <div style={{ position: "sticky", bottom: 0, left: 0, right: 0, padding: `12px var(--page-pad-x) max(18px, env(safe-area-inset-bottom, 0px))`, background: "#0c1a10", borderTop: `1px solid ${C.border}` }}>
        <Btn onClick={() => !allClosed && onBook(a)} style={{ opacity: allClosed ? 0.5 : 1, cursor: allClosed ? "not-allowed" : "pointer" }}>
          Check Availability
        </Btn>
      </div>
    </div>
  );
}
