/** Same sport labels as arenas — courts can override per court for multi-sport venues. */
const ARENA_SPORTS = Object.freeze(["cricket", "football", "padel", "badminton", "futsal"]);

function normalizeSport(value, label = "sport") {
  if (value == null || value === "") return null;
  const s = String(value).trim();
  if (!ARENA_SPORTS.includes(s)) {
    throw new Error(`${label} must be one of: ${ARENA_SPORTS.join(", ")}`);
  }
  return s;
}

module.exports = {
  ARENA_SPORTS,
  normalizeSport,
};
