const { normalizeBookingDate } = require("../config/slotConfig");
const { effectiveCourtStatus } = require("../utils/courtStatus");

function sportUpper(value) {
  if (value == null || value === "") return null;
  return String(value).trim().toUpperCase();
}

function uniqueSportsSorted(arenaSport, courtsForArena) {
  const bag = new Set();
  const a = sportUpper(arenaSport);
  if (a) bag.add(a);
  for (const c of courtsForArena) {
    const eff = c.sport || arenaSport;
    const u = sportUpper(eff);
    if (u) bag.add(u);
  }
  return [...bag].sort();
}

class PublicArenaService {
  constructor(arenaRepository, courtRepository, reviewRepository, bookingRepository) {
    this.arenaRepository = arenaRepository;
    this.courtRepository = courtRepository;
    this.reviewRepository = reviewRepository;
    this.bookingRepository = bookingRepository;
  }

  resolveDate(dateInput) {
    if (dateInput == null || dateInput === "") {
      return normalizeBookingDate(new Date());
    }
    const d = normalizeBookingDate(dateInput);
    if (!d) {
      throw new Error("Invalid date; use YYYY-MM-DD or ISO date");
    }
    return d;
  }

  async listPublicArenas({ city, date: dateInput }) {
    const date = this.resolveDate(dateInput);

    const arenas = await this.arenaRepository.findPublicLean(city);
    if (!arenas.length) return [];

    const arenaIds = arenas.map((a) => a._id);

    const [courtsAll, reviewMap, bookedByCourt] = await Promise.all([
      this.courtRepository.findPublicByArenaIds(arenaIds),
      this.reviewRepository.aggregateStatsForArenaIds(arenaIds.map(String)),
      this.bookingRepository.findOccupyingSlotsByCourtForDate(arenaIds, date),
    ]);

    const courtsByArena = new Map();
    for (const c of courtsAll) {
      const aid = String(c.arena);
      if (!courtsByArena.has(aid)) courtsByArena.set(aid, []);
      courtsByArena.get(aid).push(c);
    }

    return arenas.map((arena) => {
      const aid = String(arena._id);
      const courts = courtsByArena.get(aid) || [];
      const stats = reviewMap.get(aid) || { averageRating: 0, reviewCount: 0 };

      return {
        id: aid,
        name: arena.name,
        location: arena.location,
        price: Number(arena.pricePerSlot) || 0,
        rating: stats.averageRating,
        reviewCount: stats.reviewCount,
        sports: uniqueSportsSorted(arena.sport, courts),
        img: arena.imageUrl || null,
        courts: courts.map((court) => {
          const cid = String(court._id);
          const status = effectiveCourtStatus(court);
          const sportResolved = sportUpper(court.sport || arena.sport);
          return {
            id: cid,
            name: court.name,
            sport: sportResolved,
            status,
            visible: court.visible !== false,
            bookedSlots: bookedByCourt.get(cid) || [],
          };
        }),
      };
    });
  }
}

module.exports = PublicArenaService;
