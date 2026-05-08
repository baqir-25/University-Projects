import { TIME_SLOTS } from "./timeSlots.js";

export function slotInDeal(sl, deal) {
  if (deal.slots) return deal.slots.includes(sl);
  if (deal.sections) {
    for (const [sec, slots] of Object.entries(TIME_SLOTS)) {
      if (deal.sections.includes(sec) && slots.includes(sl)) return true;
    }
  }
  return false;
}

/**
 * @param {string} arenaName
 * @param {string} sl
 * @param {string} sport
 * @param {Array<{ arena?: string, sport?: string, slots?: string[] | null, sections?: string[] | null }>} deals - e.g. owner- or API-shaped rows that include `slots` / `sections`
 */
export function getDealForSlot(arenaName, sl, sport, deals = []) {
  const deal = deals.find(
    (d) =>
      d.arena === arenaName &&
      slotInDeal(sl, d) &&
      (!sport || !d.sport || d.sport.toUpperCase() === sport.toUpperCase())
  );
  return deal || null;
}
