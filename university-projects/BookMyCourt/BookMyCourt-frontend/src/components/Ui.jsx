import { useState } from "react";
import { NavLink } from "react-router-dom";
import { C } from "../theme.js";

export function Icon({ n, size = 18, color = "currentColor" }) {
  const s = { width: size, height: size };
  const icons = {
    search: (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    home: (
      <svg {...s} viewBox="0 0 24 24" fill={color}>
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    ),
    cal: (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    compass: (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={color} />
      </svg>
    ),
    user: (
      <svg {...s} viewBox="0 0 24 24" fill={color}>
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    ),
    star: (
      <svg {...s} viewBox="0 0 24 24" fill={color}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    bell: (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    back: (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    ),
    share: (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
    pin: (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    check: (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    sun: (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
      </svg>
    ),
    moon: (
      <svg {...s} viewBox="0 0 24 24" fill={color}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
    ticket: (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
      </svg>
    ),
    phone: (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    arr: (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    ),
    menu: (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
    x: (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    eye: (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    park: (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
      </svg>
    ),
    wifi: (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <circle cx="12" cy="20" r="1" fill={color} />
      </svg>
    ),
    drop: (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
    shower: (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M4 12a8 8 0 0 1 16 0Z" />
        <line x1="12" y1="12" x2="12" y2="21" />
      </svg>
    ),
    grid: (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="1" />
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="3" y1="12" x2="21" y2="12" />
      </svg>
    ),
    cog: (
      <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  };
  return icons[n] || null;
}

export function Amenity({ type }) {
  const map = { PARKING: "park", WATER: "drop", SHOWER: "shower", "FREE WIFI": "wifi" };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "#1a2e1f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon n={map[type] || "check"} color={C.green} size={22} />
      </div>
      <span style={{ fontSize: 10, color: C.textMuted, letterSpacing: 0.5 }}>{type}</span>
    </div>
  );
}

export function Nav({ active, onNav, tabs }) {
  const linkMode = Array.isArray(tabs) && tabs.length > 0 && tabs[0].to != null;
  const tabStyle = (isActive) => ({
    flex: 1,
    background: "none",
    border: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    cursor: "pointer",
    color: isActive ? C.green : C.textMuted,
    textDecoration: "none",
    WebkitTapHighlightColor: "transparent",
  });
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: "#0c1a10",
        borderTop: `1px solid ${C.border}`,
        display: "flex",
        paddingTop: 10,
        paddingBottom: "max(14px, env(safe-area-inset-bottom, 0px))",
        paddingLeft: "max(0px, env(safe-area-inset-left, 0px))",
        paddingRight: "max(0px, env(safe-area-inset-right, 0px))",
        flexShrink: 0,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {tabs.map((t) =>
        linkMode ? (
          <NavLink
            key={t.k}
            to={t.to}
            end={t.to === "/"}
            style={({ isActive }) => tabStyle(isActive)}
          >
            <Icon n={t.i} size={22} color={undefined} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5 }}>{t.l}</span>
          </NavLink>
        ) : (
          <button
            key={t.k}
            type="button"
            onClick={() => onNav(t.k)}
            style={tabStyle(active === t.k)}
          >
            <Icon n={t.i} size={22} color={active === t.k ? C.green : C.textMuted} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5 }}>{t.l}</span>
          </button>
        )
      )}
    </div>
  );
}

export function Btn({ onClick, children, style = {}, disabled = false }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "16px",
        borderRadius: 50,
        background: C.green,
        border: "none",
        fontWeight: 800,
        fontSize: 15,
        cursor: disabled ? "not-allowed" : "pointer",
        color: "#000",
        opacity: disabled ? 0.55 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function SportBg({ sport, height = 240 }) {
  const gradients = {
    FOOTBALL: "linear-gradient(135deg,#0d3b1e,#1a6b3a,#0a4a24)",
    CRICKET: "linear-gradient(135deg,#1a3a0d,#2d6b1a,#143a0a)",
    PADEL: "linear-gradient(135deg,#0d2b3b,#1a5b6b,#0a2a4a)",
    BADMINTON: "linear-gradient(135deg,#1a2b0d,#3b5b1a,#142a0a)",
    BASKETBALL: "linear-gradient(135deg,#3b1a0d,#6b3a1a,#4a240a)",
    VOLLEYBALL: "linear-gradient(135deg,#1a1a3b,#3a3a6b,#0a0a4a)",
    FUTSAL: "linear-gradient(135deg,#0d1a3b,#1a3b6b,#0a1a4a)",
    DEFAULT: "linear-gradient(135deg,#0d1a0d,#1a3b1a,#0a2a0a)",
  };
  const emojis = { FOOTBALL: "⚽", CRICKET: "🏏", PADEL: "🎾", BADMINTON: "🏸", BASKETBALL: "🏀", VOLLEYBALL: "🏐", FUTSAL: "⚽", DEFAULT: "🏟️" };
  const key = Object.keys(gradients).find((k) => sport?.includes(k)) || "DEFAULT";
  return (
    <div style={{ width: "100%", height, background: gradients[key], display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
      <span style={{ fontSize: 44 }}>{emojis[key]}</span>
      <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>{sport}</span>
    </div>
  );
}

export function ArenaImg({ src, alt, height = 160, sport = "" }) {
  const [err, setErr] = useState(false);
  if (err || !src) return <SportBg sport={sport} height={height} />;
  return <img src={src} alt={alt} onError={() => setErr(true)} style={{ width: "100%", height, objectFit: "cover", display: "block" }} />;
}
