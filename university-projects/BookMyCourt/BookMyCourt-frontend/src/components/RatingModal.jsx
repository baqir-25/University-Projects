import { useState } from "react";
import { C } from "../theme.js";

export function RatingModal({ booking, onClose, onSubmit }) {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (stars === 0) return;
    try {
      await Promise.resolve(onSubmit(booking, stars, comment.trim()));
      setSubmitted(true);
      setTimeout(() => onClose(), 1400);
    } catch {
      /* Parent shows error (e.g. duplicate review). */
    }
  };

  const labels = ["", "Terrible", "Poor", "Decent", "Great", "Excellent"];

  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end", zIndex: 100 }} onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", background: "#0f1f13", borderRadius: "20px 20px 0 0", padding: `24px var(--page-pad-x) max(32px, env(safe-area-inset-bottom, 0px))`, border: `1px solid ${C.border}`, boxSizing: "border-box" }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: C.border, margin: "0 auto 20px" }} />

        {submitted ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
            <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 6 }}>Thanks for your review!</div>
            <div style={{ color: C.textMuted, fontSize: 13 }}>Your rating helps other players find great arenas.</div>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontWeight: 900, fontSize: 19, marginBottom: 4 }}>Rate your experience</div>
              <div style={{ color: C.textMuted, fontSize: 13 }}>{booking.arena}</div>
              <div style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>
                📅 {booking.date} · {booking.time}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 8 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setStars(n)}
                  style={{
                    fontSize: 36,
                    cursor: "pointer",
                    transition: "transform 0.1s",
                    transform: (hovered || stars) >= n ? "scale(1.15)" : "scale(1)",
                    filter: (hovered || stars) >= n ? "none" : "grayscale(1) opacity(0.4)",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                >
                  ⭐
                </button>
              ))}
            </div>
            <div style={{ textAlign: "center", fontWeight: 700, fontSize: 14, color: C.green, marginBottom: 16, minHeight: 20 }}>{labels[hovered || stars] || "Tap to rate"}</div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, marginBottom: 6 }}>
                Review <span style={{ fontWeight: 400 }}>(optional)</span>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like or dislike? Any tips for other players..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "#0a130d",
                  border: `1px solid ${C.border}`,
                  color: C.text,
                  fontSize: 13,
                  resize: "none",
                  boxSizing: "border-box",
                  outline: "none",
                  fontFamily: "inherit",
                  lineHeight: 1.5,
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: 50, background: "#1a2e1f", border: `1px solid ${C.border}`, color: C.text, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Skip
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                style={{
                  flex: 2,
                  padding: "13px",
                  borderRadius: 50,
                  background: stars > 0 ? C.green : "#1a2e1f",
                  border: `1px solid ${stars > 0 ? C.green : C.border}`,
                  color: stars > 0 ? "#000" : C.textMuted,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: stars > 0 ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                }}
              >
                Submit Review {stars > 0 ? `(${stars}★)` : ""}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
