const DealRepository = require("../repositories/DealRepository");
const { normalizeSport } = require("../constants/sports");

class ArenaService {
  constructor(arenaRepository, courtRepository) {
    this.arenaRepository = arenaRepository;
    this.courtRepository = courtRepository;
  }

  async createArena(arenaData) {
    const arena = await this.arenaRepository.create(arenaData);
    await this.courtRepository.create({
      arena: arena._id,
      name: "Court 1",
      sortOrder: 0,
      isActive: true,
      sport: arena.sport,
    });
    return arena;
  }

  async updateArenaByOwner(ownerId, arenaId, arenaData) {
    const ownedArena = await this.arenaRepository.findByIdAndOwner(arenaId, ownerId);
    if (!ownedArena) {
      throw new Error("Arena not found or not owned by user");
    }

    return await this.arenaRepository.updateById(arenaId, arenaData);
  }

  async createDealForOwner(ownerId, arenaId, body) {
    await this.assertArenaOwnedByOwner(arenaId, ownerId);

    const { title, description, discountPercent, startsAt, endsAt, isActive } = body;

    if (!title || String(title).trim() === "") {
      throw new Error("Deal title is required");
    }
    if (startsAt == null || endsAt == null) {
      throw new Error("startsAt and endsAt are required");
    }

    const start = new Date(startsAt);
    const end = new Date(endsAt);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("startsAt and endsAt must be valid dates");
    }
    if (end <= start) {
      throw new Error("endsAt must be after startsAt");
    }

    const pct = Number(discountPercent);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      throw new Error("discountPercent must be a number from 0 to 100");
    }

    return await DealRepository.create({
      arena: arenaId,
      title: String(title).trim(),
      description: description != null ? String(description).trim() : undefined,
      discountPercent: pct,
      startsAt: start,
      endsAt: end,
      isActive: isActive !== false,
    });
  }

  async assertArenaOwnedByOwner(arenaId, ownerId) {
    const arena = await this.arenaRepository.findByIdAndOwner(arenaId, ownerId);
    if (!arena) {
      throw new Error("Arena not found or not owned by user");
    }
    return arena;
  }

  async createCourtForOwner(ownerId, arenaId, body) {
    const arena = await this.assertArenaOwnedByOwner(arenaId, ownerId);
    const { name, sortOrder, isActive } = body;
    if (!name || String(name).trim() === "") {
      throw new Error("Court name is required");
    }
    let sport = body.sport;
    if (sport != null && sport !== "") {
      sport = normalizeSport(sport);
    } else {
      sport = arena.sport;
    }
    return await this.courtRepository.create({
      arena: arenaId,
      name: String(name).trim(),
      sortOrder: sortOrder != null ? Number(sortOrder) : 0,
      isActive: isActive !== false,
      status: isActive !== false ? "available" : "unavailable",
      visible: body.visible !== false,
      sport,
    });
  }

}

module.exports = ArenaService;
