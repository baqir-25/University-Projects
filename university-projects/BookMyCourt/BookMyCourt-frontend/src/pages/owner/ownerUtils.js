export const EVENT_SPORT_EMOJIS = ["⚽", "🎾", "🏸", "🏀", "🏐", "🏏", "⚾", "🏟️"];

export function toDatetimeLocalValue(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function dealRunLabel(startIso, endIso) {
  if (!startIso || !endIso) return "—";
  try {
    const s = new Date(startIso);
    const e = new Date(endIso);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "—";
    return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`;
  } catch {
    return "—";
  }
}

/** API enum for POST /api/arenas */
export const ARENA_SPORT_VALUES = ["cricket", "football", "padel", "badminton", "futsal"];

export const ARENA_SPORT_LABELS = {
  cricket: "Cricket",
  football: "Football",
  padel: "Padel",
  badminton: "Badminton",
  futsal: "Futsal",
};

export function defaultCourtSportSlugForArena(row) {
  const raw = String(row?.sport ?? "").toLowerCase();
  for (const v of ARENA_SPORT_VALUES) {
    if (raw === v || raw.includes(v)) return v;
  }
  return "padel";
}

export function defaultCourtSportLabel(arenaRow) {
  const line = (arenaRow?.sport || "").trim();
  if (!line) return "MULTI-SPORT";
  return (
    line
      .split(/·|,/)
      .map((s) => s.trim())
      .filter(Boolean)[0]
      ?.toUpperCase() || "MULTI-SPORT"
  );
}
