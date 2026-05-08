const DEFAULT_DAILY_SLOTS = Object.freeze([
  "06:00 AM - 07:00 AM",
  "07:00 AM - 08:00 AM",
  "08:00 AM - 09:00 AM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
  "06:00 PM - 07:00 PM",
  "07:00 PM - 08:00 PM",
  "08:00 PM - 09:00 PM",
  "09:00 PM - 10:00 PM",
]);

function utcStartOfDay(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Calendar day at 00:00 UTC. Accepts YYYY-MM-DD, ISO strings, or Date. */
function normalizeBookingDate(input) {
  if (input == null || input === "") return null;
  if (input instanceof Date && !isNaN(input.getTime())) {
    return utcStartOfDay(input);
  }
  const s = String(input).trim();
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (ymd) {
    const y = Number(ymd[1]);
    const m = Number(ymd[2]) - 1;
    const day = Number(ymd[3]);
    return new Date(Date.UTC(y, m, day));
  }
  const parsed = new Date(s);
  if (isNaN(parsed.getTime())) return null;
  return utcStartOfDay(parsed);
}

function isValidDailySlot(value) {
  return typeof value === "string" && DEFAULT_DAILY_SLOTS.includes(value);
}

module.exports = {
  DEFAULT_DAILY_SLOTS,
  normalizeBookingDate,
  isValidDailySlot,
};
