import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import logoImg from "../../assets/logo.png";
import { ApiEnvelopeError } from "../../api/client.js";
import { createArena, createArenaCourt } from "../../api/arenas.js";
import {
  createArenaDeal,
  createOwnerArenaEvent,
  deleteOwnerArenaEvent,
  fetchOwnerArenaBookings,
  patchOwnerArenaBookingStatus,
  fetchOwnerArenas,
  patchOwnerArena,
  patchOwnerCourt,
} from "../../api/owner.js";
import { arenaHomeFromApi, courtFromApiCourt, dealRowFromApi, eventRowFromApi, mapOwnerBookingListRow } from "../../api/ownerMappers.js";
import { C } from "../../theme.js";
import { Btn, Icon, Nav } from "../../components/Ui.jsx";
import {
  ARENA_SPORT_LABELS,
  ARENA_SPORT_VALUES,
  defaultCourtSportLabel,
  defaultCourtSportSlugForArena,
  EVENT_SPORT_EMOJIS,
  toDatetimeLocalValue,
} from "./ownerUtils.js";

const ownerTabs = [
  { k: "home", i: "home", l: "Home", to: "/owner/home" },
  { k: "bookings", i: "cal", l: "Bookings", to: "/owner/bookings" },
  { k: "courts", i: "grid", l: "Courts", to: "/owner/courts" },
  { k: "settings", i: "cog", l: "More", to: "/owner/settings" },
];

export function OwnerLayout({
  onLogout,
  courts,
  setCourts,
  ownerArenas,
  setOwnerArenas,
  selectedArenaId,
  setSelectedArenaId,
  ownerUserId,
  onArenaAdded,
  onOwnerArenaUpdated,
  onOwnerArenaDetailsUpdated,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const [drawer, setDrawer] = useState(false);
  const [addArenaOpen, setAddArenaOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newArenaSport, setNewArenaSport] = useState("padel");
  const [newArenaDescription, setNewArenaDescription] = useState("");
  const [newIsAvailable, setNewIsAvailable] = useState(true);
  const [newPrice, setNewPrice] = useState("35");
  const [addError, setAddError] = useState("");
  const [addArenaSubmitting, setAddArenaSubmitting] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [evTitle, setEvTitle] = useState("");
  const [evDate, setEvDate] = useState("");
  const [evSport, setEvSport] = useState("⚽");
  const [evSpots, setEvSpots] = useState("8");
  const [evTotal, setEvTotal] = useState("16");
  const [evError, setEvError] = useState("");
  const [addCourtOpen, setAddCourtOpen] = useState(false);
  const [ctName, setCtName] = useState("");
  const [ctCourtSport, setCtCourtSport] = useState("padel");
  const [ctIsBookable, setCtIsBookable] = useState(true);
  const [ctListed, setCtListed] = useState(true);
  const [ctError, setCtError] = useState("");
  const [ctSubmitting, setCtSubmitting] = useState(false);
  const [ctTargetArenaId, setCtTargetArenaId] = useState(null);
  const [editArenaOpen, setEditArenaOpen] = useState(false);
  const [edName, setEdName] = useState("");
  const [edLocation, setEdLocation] = useState("");
  const [edArenaSport, setEdArenaSport] = useState("padel");
  const [edError, setEdError] = useState("");
  const [edArenaSubmitting, setEdArenaSubmitting] = useState(false);
  const [availToggling, setAvailToggling] = useState(false);
  const [settingsMutateError, setSettingsMutateError] = useState(null);
  const [arenasLoading, setArenasLoading] = useState(true);
  const [arenasLoadError, setArenasLoadError] = useState(null);
  const [homeMutateError, setHomeMutateError] = useState(null);
  const [evStartsAt, setEvStartsAt] = useState("");
  const [evEndsAt, setEvEndsAt] = useState("");
  const [evSubmitting, setEvSubmitting] = useState(false);
  const [addDealOpen, setAddDealOpen] = useState(false);
  const [dlTitle, setDlTitle] = useState("");
  const [dlDiscountPercent, setDlDiscountPercent] = useState("15");
  const [dlStartsAt, setDlStartsAt] = useState("");
  const [dlEndsAt, setDlEndsAt] = useState("");
  const [dlDescription, setDlDescription] = useState("");
  const [dlIsActive, setDlIsActive] = useState(true);
  const [dlError, setDlError] = useState("");
  const [dlSubmitting, setDlSubmitting] = useState(false);
  const [ownerBookings, setOwnerBookings] = useState([]);
  const [ownerBookingsLoading, setOwnerBookingsLoading] = useState(false);
  const [ownerBookingsError, setOwnerBookingsError] = useState(null);
  const [ownerBookingsDateFilter, setOwnerBookingsDateFilter] = useState("");
  const [ownerBookingsStatusFilter, setOwnerBookingsStatusFilter] = useState("");
  const [bookingStatusPendingIds, setBookingStatusPendingIds] = useState(() => new Set());

  const arena = useMemo(() => ownerArenas.find((a) => a.id === selectedArenaId) || ownerArenas[0], [ownerArenas, selectedArenaId]);

  const reloadOwnerArenas = useCallback(async () => {
    setArenasLoadError(null);
    setArenasLoading(true);
    try {
      const listRaw = await fetchOwnerArenas();
      const mapped = listRaw.map((raw) =>
        arenaHomeFromApi(typeof raw === "object" && raw ? /** @type {Record<string, unknown>} */ (raw) : {}),
      );
      setOwnerArenas(mapped);
      setSelectedArenaId((cur) => {
        if (!mapped.length) return cur;
        return mapped.some((a) => a.id === cur) ? cur : mapped[0].id;
      });
      if (mapped[0]) {
        const row = mapped[0];
        setCourts(row.courts.map((c) => ({ ...c, arenaId: 4, arenaName: row.name })));
      }
      return mapped;
    } catch (e) {
      setArenasLoadError(e instanceof ApiEnvelopeError ? e.message : "Could not load your venues.");
      return null;
    } finally {
      setArenasLoading(false);
    }
  }, [setOwnerArenas, setSelectedArenaId, setCourts]);

  useEffect(() => {
    reloadOwnerArenas();
  }, [reloadOwnerArenas]);

  useEffect(() => {
    if (!location.pathname.endsWith("/owner/bookings")) return;
    const aid = arena?.id != null ? String(arena.id) : "";
    if (!aid) return;

    let cancelled = false;
    (async () => {
      setOwnerBookingsLoading(true);
      setOwnerBookingsError(null);
      try {
        /** @type {{ date?: string, status?: string }} */
        const query = {};
        const d = ownerBookingsDateFilter.trim();
        if (d) query.date = d;
        if (ownerBookingsStatusFilter) query.status = ownerBookingsStatusFilter;
        const list = await fetchOwnerArenaBookings(aid, query);
        if (cancelled) return;
        const rows = Array.isArray(list) ? list.map((raw) => mapOwnerBookingListRow(/** @type {Record<string, unknown>} */ (raw))).filter(Boolean) : [];
        setOwnerBookings(rows);
      } catch (e) {
        if (!cancelled) {
          setOwnerBookingsError(e instanceof ApiEnvelopeError ? e.message : "Could not load bookings.");
          setOwnerBookings([]);
        }
      } finally {
        if (!cancelled) setOwnerBookingsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, arena?.id, ownerBookingsDateFilter, ownerBookingsStatusFilter]);

  const primeCourtFormForArenaRow = (row) => {
    if (!row) return;
    setCtName(`Court ${row.courts.length + 1}`);
    setCtCourtSport(defaultCourtSportSlugForArena(row));
    setCtIsBookable(true);
    setCtListed(true);
  };

  const courtTargetArena = useMemo(
    () => ownerArenas.find((a) => a.id === ctTargetArenaId) || arena,
    [ownerArenas, ctTargetArenaId, arena]
  );

  const syncPublicCourtsIfVanguard = (arenaRow, nextCourts) => {
    if (arenaRow.id === ownerArenas[0]?.id) {
      setCourts(nextCourts.map((c) => ({ ...c, arenaId: 4, arenaName: arenaRow.name })));
    }
  };

  const patchArena = (patch) => {
    setOwnerArenas((prev) => prev.map((a) => (a.id === arena.id ? { ...a, ...patch } : a)));
  };

  const updateCourtField = async (courtId, field, value) => {
    if (!arena) return;
    setHomeMutateError(null);
    const aid = arena.id;
    /** @type {Record<string, unknown>} */
    const patchBody = {};
    if (field === "visible") patchBody.visible = value;
    else if (field === "status") patchBody.status = value;
    try {
      const raw = /** @type {Record<string, unknown>} */ (
        await patchOwnerCourt(String(courtId), patchBody)
      );
      const priceBasis = arena.pricePerSlot ?? arena.courts[0]?.price ?? 35;
      const sportTok = defaultCourtSportLabel(arena);
      const updated = courtFromApiCourt(raw, { defaultPrice: priceBasis, defaultSport: sportTok });
      const prevCourt = arena.courts.find((x) => String(x.id) === String(courtId));
      if (prevCourt?.sport && !("sport" in raw)) updated.sport = prevCourt.sport;
      setOwnerArenas((prev) => {
        const row = prev.find((x) => x.id === aid);
        if (!row) return prev;
        const nextCourts = row.courts.map((c) => (String(c.id) === String(courtId) ? updated : c));
        syncPublicCourtsIfVanguard(row, nextCourts);
        onOwnerArenaUpdated?.({ ...row, courts: nextCourts });
        return prev.map((x) => (x.id === aid ? { ...x, courts: nextCourts } : x));
      });
    } catch (e) {
      setHomeMutateError(e instanceof ApiEnvelopeError ? e.message : "Could not update court.");
    }
  };

  const markOwnerBookingComplete = async (bookingId) => {
    if (!arena?.id || !bookingId) return;
    const bid = String(bookingId);
    if (bookingStatusPendingIds.has(bid)) return;

    setOwnerBookingsError(null);
    setBookingStatusPendingIds((prev) => {
      const next = new Set(prev);
      next.add(bid);
      return next;
    });

    try {
      await patchOwnerArenaBookingStatus(String(arena.id), bid, "completed");
      setOwnerBookings((prev) => {
        const next = prev.map((row) => (String(row.id) === bid ? { ...row, status: "completed" } : row));
        if (ownerBookingsStatusFilter === "confirmed") {
          return next.filter((row) => String(row.id) !== bid);
        }
        return next;
      });
    } catch (e) {
      setOwnerBookingsError(e instanceof ApiEnvelopeError ? e.message : "Could not update booking.");
    } finally {
      setBookingStatusPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(bid);
        return next;
      });
    }
  };

  const openAddCourt = () => {
    const row = ownerArenas.find((a) => a.id === selectedArenaId) || arena;
    if (!row?.id) {
      setHomeMutateError("Add a venue before adding courts.");
      return;
    }
    setCtTargetArenaId(row.id);
    primeCourtFormForArenaRow(row);
    setCtError("");
    setAddCourtOpen(true);
  };

  const submitNewCourt = async () => {
    const name = ctName.trim();
    if (!name) {
      setCtError("Enter a court name.");
      return;
    }
    const aidRaw = ctTargetArenaId ?? arena?.id;
    const aid = typeof aidRaw === "string" ? aidRaw.trim() : aidRaw ? String(aidRaw) : "";
    if (!aid) {
      setCtError("Select an arena.");
      return;
    }
    if (!ARENA_SPORT_VALUES.includes(ctCourtSport)) {
      setCtError("Please select a sport.");
      return;
    }
    const row = ownerArenas.find((x) => String(x.id) === String(aid));
    const sortOrder = row?.courts?.length ?? 0;

    /** @type {Record<string, unknown>} */
    const payload = {
      name,
      sport: ctCourtSport,
      sortOrder,
      isActive: ctIsBookable,
      visible: ctListed,
    };

    setCtSubmitting(true);
    setCtError("");
    try {
      await createArenaCourt(aid, payload);
      const mapped = await reloadOwnerArenas();
      if (!mapped) {
        setCtError("Court was saved but refreshing venues failed. Use Retry.");
        setAddCourtOpen(false);
        return;
      }
      const updatedArena = mapped.find((x) => String(x.id) === String(aid));
      if (updatedArena) onOwnerArenaUpdated?.(updatedArena);
      setAddCourtOpen(false);
    } catch (e) {
      setCtError(e instanceof ApiEnvelopeError ? e.message : "Could not create court.");
    } finally {
      setCtSubmitting(false);
    }
  };

  const openAddArena = () => {
    setDrawer(false);
    setNewName("");
    setNewLocation("");
    setNewArenaSport("padel");
    setNewArenaDescription("");
    setNewIsAvailable(true);
    setNewPrice("35");
    setAddError("");
    setAddArenaOpen(true);
  };

  const submitNewArena = async () => {
    const oid = typeof ownerUserId === "string" ? ownerUserId.trim() : String(ownerUserId || "").trim();
    if (!oid) {
      setAddError("Your account is missing an owner ID. Sign out and sign in again, or contact support.");
      return;
    }
    const name = newName.trim();
    const location = newLocation.trim();
    if (!name) {
      setAddError("Please enter an arena name.");
      return;
    }
    if (!location) {
      setAddError("Please enter a location.");
      return;
    }
    if (!ARENA_SPORT_VALUES.includes(newArenaSport)) {
      setAddError("Please select a sport.");
      return;
    }
    const pricePerSlot = Math.max(1, Number.parseInt(String(newPrice).replace(/\D/g, ""), 10) || 35);
    /** @type {Record<string, unknown>} */
    const payload = {
      name,
      sport: newArenaSport,
      location,
      pricePerSlot,
      owner: oid,
      isAvailable: newIsAvailable,
    };
    const desc = newArenaDescription.trim();
    if (desc) payload.description = desc;

    setAddArenaSubmitting(true);
    setAddError("");
    try {
      /** @type {Record<string, unknown>} */
      const created = /** @type {Record<string, unknown>} */ (await createArena(payload));
      const newId = String(created._id ?? "");
      if (!newId) {
        throw new ApiEnvelopeError("Arena created but response had no id.", 500);
      }
      const mapped = await reloadOwnerArenas();
      if (!mapped) {
        setAddError("Arena was saved, but refreshing your venues failed. Use Retry on Home or reload the page.");
        setSelectedArenaId(newId);
        return;
      }
      const mergedRow = mapped.find((a) => a.id === newId);
      if (mergedRow) onArenaAdded?.(mergedRow);
      setSelectedArenaId(newId);
      navigate("/owner/home");
      setAddArenaOpen(false);
    } catch (e) {
      setAddError(e instanceof ApiEnvelopeError ? e.message : "Could not create arena.");
    } finally {
      setAddArenaSubmitting(false);
    }
  };

  const openEditArena = () => {
    setEdName(arena.name);
    setEdLocation(arena.location);
    setEdArenaSport(defaultCourtSportSlugForArena(arena));
    setEdError("");
    setEditArenaOpen(true);
  };

  const submitEditArena = async () => {
    const name = edName.trim();
    const location = edLocation.trim();
    if (!name) {
      setEdError("Enter arena name.");
      return;
    }
    if (!location) {
      setEdError("Enter location.");
      return;
    }
    if (!ARENA_SPORT_VALUES.includes(edArenaSport)) {
      setEdError("Please select a sport.");
      return;
    }
    const aid = arena.id;
    const prevName = arena.name;

    /** @type {Record<string, unknown>} */
    const body = {
      name,
      location,
      sport: edArenaSport,
    };

    setEdArenaSubmitting(true);
    setEdError("");
    try {
      await patchOwnerArena(String(aid), body);
      const mapped = await reloadOwnerArenas();
      if (!mapped) {
        setEdError("Saved, but refreshing failed. Retry from Home.");
        setEditArenaOpen(false);
        return;
      }
      const mergedRow = mapped.find((x) => String(x.id) === String(aid));
      if (mergedRow) {
        if (mergedRow.id === mapped[0]?.id) {
          setCourts(
            mergedRow.courts.map((c) => ({
              ...c,
              arenaId: 4,
              arenaName: mergedRow.name,
            }))
          );
        }
        onOwnerArenaDetailsUpdated?.(prevName, mergedRow);
        onOwnerArenaUpdated?.(mergedRow);
      }
      setEditArenaOpen(false);
    } catch (e) {
      setEdError(e instanceof ApiEnvelopeError ? e.message : "Could not update venue.");
    } finally {
      setEdArenaSubmitting(false);
    }
  };

  const toggleArenaAvailability = async () => {
    if (!arena || availToggling) return;
    setSettingsMutateError(null);
    setAvailToggling(true);
    try {
      await patchOwnerArena(String(arena.id), { isAvailable: !arena.open });
      const mapped = await reloadOwnerArenas();
      if (!mapped) {
        setSettingsMutateError("Updated, but refreshing venues failed. Try Retry on Home.");
        return;
      }
      const mergedRow = mapped.find((x) => String(x.id) === String(arena.id));
      if (mergedRow) {
        if (mergedRow.id === mapped[0]?.id) {
          setCourts(
            mergedRow.courts.map((c) => ({
              ...c,
              arenaId: 4,
              arenaName: mergedRow.name,
            }))
          );
        }
        onOwnerArenaUpdated?.(mergedRow);
      }
    } catch (e) {
      setSettingsMutateError(e instanceof ApiEnvelopeError ? e.message : "Could not update availability.");
    } finally {
      setAvailToggling(false);
    }
  };

  const openAddEvent = () => {
    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
    const end = new Date(start.getTime() + 2 * 3600000);
    setEvStartsAt(toDatetimeLocalValue(start));
    setEvEndsAt(toDatetimeLocalValue(end));
    setEvTitle("");
    setEvDate("");
    setEvSport("⚽");
    setEvSpots("8");
    setEvTotal("16");
    setEvError("");
    setAddEventOpen(true);
  };

  const submitOwnerEvent = async () => {
    if (!arena) return;
    const title = evTitle.trim();
    const dateLabel = evDate.trim();
    if (!title) {
      setEvError("Enter an event title.");
      return;
    }
    if (!evStartsAt || !evEndsAt) {
      setEvError("Pick start and end date/time.");
      return;
    }
    const starts = new Date(evStartsAt);
    const ends = new Date(evEndsAt);
    if (Number.isNaN(starts.getTime()) || Number.isNaN(ends.getTime())) {
      setEvError("Invalid start or end date.");
      return;
    }
    if (ends.getTime() <= starts.getTime()) {
      setEvError("End time must be after start.");
      return;
    }
    const total = Math.max(1, Number.parseInt(String(evTotal).replace(/\D/g, ""), 10) || 16);
    let spots = Number.parseInt(String(evSpots).replace(/\D/g, ""), 10);
    if (Number.isNaN(spots)) spots = total;
    spots = Math.min(total, Math.max(0, spots));
    setEvError("");
    setEvSubmitting(true);
    try {
      /** @type {Record<string, unknown>} */
      const payload = {
        title,
        startsAt: starts.toISOString(),
        endsAt: ends.toISOString(),
        status: "published",
        spots,
        ...(dateLabel ? { dateLabel } : {}),
        ...(evSport.trim() ? { sportEmoji: evSport.trim() } : {}),
      };

      const createdRaw = /** @type {Record<string, unknown>} */ (await createOwnerArenaEvent(String(arena.id), payload));

      const row = eventRowFromApi(createdRaw, arena.name);
      patchArena({ events: [...(arena.events || []), row] });
      setAddEventOpen(false);
    } catch (e) {
      setEvError(e instanceof ApiEnvelopeError ? e.message : "Could not publish event.");
    } finally {
      setEvSubmitting(false);
    }
  };

  const removeOwnerEvent = async (ownerEventId) => {
    if (!arena) return;
    setHomeMutateError(null);
    try {
      await deleteOwnerArenaEvent(String(arena.id), String(ownerEventId));
      patchArena({ events: (arena.events || []).filter((e) => String(e.ownerEventId) !== String(ownerEventId)) });
    } catch (e) {
      setHomeMutateError(e instanceof ApiEnvelopeError ? e.message : "Could not remove event.");
    }
  };

  const openAddDeal = () => {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 7 * 86400000);
    end.setHours(23, 59, 0, 0);
    setDlStartsAt(toDatetimeLocalValue(start));
    setDlEndsAt(toDatetimeLocalValue(end));
    setDlTitle("");
    setDlDiscountPercent("15");
    setDlDescription("");
    setDlIsActive(true);
    setDlError("");
    setAddDealOpen(true);
  };

  const submitOwnerDeal = async () => {
    if (!arena) return;
    const title = dlTitle.trim();
    if (!title) {
      setDlError("Enter a deal title.");
      return;
    }
    if (!dlStartsAt || !dlEndsAt) {
      setDlError("Pick start and end date/time.");
      return;
    }
    const starts = new Date(dlStartsAt);
    const ends = new Date(dlEndsAt);
    if (Number.isNaN(starts.getTime()) || Number.isNaN(ends.getTime())) {
      setDlError("Invalid start or end date.");
      return;
    }
    if (ends.getTime() <= starts.getTime()) {
      setDlError("End time must be after start.");
      return;
    }
    const discountPercent = Number.parseFloat(String(dlDiscountPercent).replace(/,/g, "."));
    if (Number.isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
      setDlError("Discount must be a number from 0 to 100.");
      return;
    }
    const desc = dlDescription.trim();

    /** @type {Record<string, unknown>} */
    const payload = {
      title,
      discountPercent,
      startsAt: starts.toISOString(),
      endsAt: ends.toISOString(),
    };
    if (desc) payload.description = desc;
    if (!dlIsActive) payload.isActive = false;

    setDlError("");
    setDlSubmitting(true);
    try {
      const createdRaw = /** @type {Record<string, unknown>} */ (await createArenaDeal(String(arena.id), payload));
      const row = dealRowFromApi(createdRaw);
      if (row) {
        patchArena({ deals: [...(arena.deals || []), row] });
      } else {
        await reloadOwnerArenas();
      }
      setAddDealOpen(false);
    } catch (e) {
      setDlError(e instanceof ApiEnvelopeError ? e.message : "Could not create deal.");
    } finally {
      setDlSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    if (!arena) {
      return { openCourts: 0, totalCourts: 0, bookingsToday: 0, revenue: 0 };
    }
    const openCourts = arena.courts.filter((c) => c.visible !== false && c.status === "available").length;
    const totalCourts = arena.courts.length;
    const bs = arena.bookingsStats;
    if (bs && typeof bs === "object") {
      return {
        openCourts,
        totalCourts,
        bookingsToday: typeof bs.todayBookingsCount === "number" ? bs.todayBookingsCount : 0,
        revenue: typeof bs.estimatedRevenueTotal === "number" ? bs.estimatedRevenueTotal : 0,
      };
    }
    const revenue = arena.bookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + (b.amt || 0), 0);
    return {
      openCourts,
      totalCourts,
      bookingsToday: arena.bookings.filter((b) => b.date?.includes("Mar 11")).length,
      revenue,
    };
  }, [arena]);

  const ownerPageOutlet = {
    arena,
    stats,
    homeMutateError,
    updateCourtField,
    removeOwnerEvent,
    openAddEvent,
    openAddDeal,
    ownerBookingsDateFilter,
    setOwnerBookingsDateFilter,
    ownerBookingsStatusFilter,
    setOwnerBookingsStatusFilter,
    ownerBookingsLoading,
    ownerBookingsError,
    ownerBookings,
    markOwnerBookingComplete,
    bookingStatusPendingIds,
    openAddCourt,
    openEditArena,
    settingsMutateError,
    toggleArenaAvailability,
    availToggling,
    courts,
    onLogout,
    openAddArena,
  };

  const isSettingsRoute = location.pathname.startsWith("/owner/settings");

  let body;
  if (!arena && !isSettingsRoute) {
    body = (
      <div
        style={{
          padding: `32px var(--page-pad-x)`,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          flex: 1,
          textAlign: "center",
          color: C.textMuted,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {arenasLoading ? (
          <div>Loading your venues…</div>
        ) : arenasLoadError ? (
          <div>
            <div style={{ color: C.red, marginBottom: 16 }}>{arenasLoadError}</div>
            <button
              type="button"
              onClick={() => reloadOwnerArenas()}
              style={{
                padding: "12px 24px",
                borderRadius: 50,
                border: `1px solid ${C.green}`,
                background: "rgba(34,228,85,0.1)",
                color: C.green,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        ) : (
          <div>No venues are linked to this account yet.</div>
        )}
      </div>
    );
  } else {
    body = <Outlet context={ownerPageOutlet} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, width: "100%", background: C.bg, position: "relative" }}>
      <div style={{ padding: `14px var(--page-pad-x)`, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0, background: "#0c1a10" }}>
        <button type="button" onClick={() => setDrawer(true)} style={{ background: "#1a2e1f", border: `1px solid ${C.border}`, borderRadius: 12, width: 42, height: 42, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon n="menu" color={C.text} size={20} />
        </button>
        <img src={logoImg} alt="" style={{ width: 32, height: 32, objectFit: "contain" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 15 }}>Owner Console</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>{arena?.name || "…"}</div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          paddingBottom: "var(--bmc-tab-bar-height)",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {body}
      </div>

      <Nav tabs={ownerTabs} />

      {drawer && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 60 }} onClick={() => setDrawer(false)} role="presentation">
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "min(320px, 88vw)", maxWidth: "100%", height: "100%", background: "#0a130d", borderRight: `1px solid ${C.border}`, padding: `18px var(--page-pad-x)`, display: "flex", flexDirection: "column" }}
            role="dialog"
            aria-modal="true"
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <span style={{ fontWeight: 900, fontSize: 17 }}>Your arenas</span>
              <button type="button" onClick={() => setDrawer(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <Icon n="x" color={C.text} size={22} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", marginBottom: 12 }}>
              {ownerArenas.map((oa) => (
                <button
                  key={oa.id}
                  type="button"
                  onClick={() => {
                    setSelectedArenaId(oa.id);
                    setDrawer(false);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: 12,
                    marginBottom: 8,
                    borderRadius: 14,
                    border: `1px solid ${selectedArenaId === oa.id ? C.green : C.border}`,
                    background: selectedArenaId === oa.id ? "rgba(34,228,85,0.08)" : C.card,
                    color: C.text,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{oa.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{oa.location}</div>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 6 }}>{oa.sport}</div>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={openAddArena}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 50,
                border: `1px dashed ${C.green}`,
                background: "rgba(34,228,85,0.06)",
                color: C.green,
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              + Add arena
            </button>
          </div>
        </div>
      )}

      {addArenaOpen && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 80, display: "flex", alignItems: "flex-end" }} onClick={() => setAddArenaOpen(false)} role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-arena-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxHeight: "88%",
              overflowY: "auto",
              background: "#0f1f13",
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              border: `1px solid ${C.border}`,
              padding: `22px var(--page-pad-x) max(28px, env(safe-area-inset-bottom, 0px))`,
            }}
          >
            <div style={{ width: 44, height: 4, borderRadius: 2, background: C.border, margin: "0 auto 18px" }} />
            <h2 id="add-arena-title" style={{ margin: "0 0 6px", fontWeight: 900, fontSize: 20 }}>
              Add arena
            </h2>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: C.textMuted }}>Creates a new venue with one starter court. Players will see it on Home & Discover.</p>
            {addError ? (
              <div style={{ background: "rgba(232,64,64,0.1)", border: "1px solid rgba(232,64,64,0.35)", borderRadius: 12, padding: "10px 12px", marginBottom: 14, color: C.red, fontSize: 13, fontWeight: 600 }}>{addError}</div>
            ) : null}
            <label style={{ fontSize: 12, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6 }}>Arena name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Riverside Padel Club"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 50,
                border: `1px solid ${C.border}`,
                background: "#0a130d",
                color: C.text,
                fontSize: 14,
                marginBottom: 14,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <label style={{ fontSize: 12, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6 }}>Location</label>
            <input
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="City, area"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 50,
                border: `1px solid ${C.border}`,
                background: "#0a130d",
                color: C.text,
                fontSize: 14,
                marginBottom: 14,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <label style={{ fontSize: 12, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 8 }}>Sport</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              {ARENA_SPORT_VALUES.map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => setNewArenaSport(sp)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 50,
                    border: `1px solid ${newArenaSport === sp ? C.green : C.border}`,
                    background: newArenaSport === sp ? "rgba(34,228,85,0.12)" : "#0a130d",
                    color: newArenaSport === sp ? C.green : C.textMuted,
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {ARENA_SPORT_LABELS[sp] ?? sp}
                </button>
              ))}
            </div>
            <label style={{ fontSize: 12, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6 }}>Description (optional)</label>
            <textarea
              value={newArenaDescription}
              onChange={(e) => setNewArenaDescription(e.target.value)}
              placeholder="Short blurb for players"
              rows={3}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 16,
                border: `1px solid ${C.border}`,
                background: "#0a130d",
                color: C.text,
                fontSize: 14,
                marginBottom: 14,
                boxSizing: "border-box",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                borderRadius: 14,
                background: "#0a130d",
                border: `1px solid ${C.border}`,
                marginBottom: 14,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 13 }}>Open for bookings</span>
              <button
                type="button"
                onClick={() => setNewIsAvailable((v) => !v)}
                style={{
                  minWidth: 52,
                  height: 28,
                  borderRadius: 20,
                  border: "none",
                  cursor: "pointer",
                  background: newIsAvailable ? C.green : "#1a2e1f",
                }}
              />
            </div>
            <label style={{ fontSize: 12, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6 }}>Price per slot</label>
            <input
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              inputMode="numeric"
              placeholder="35"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 50,
                border: `1px solid ${C.border}`,
                background: "#0a130d",
                color: C.text,
                fontSize: 14,
                marginBottom: 20,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setAddArenaOpen(false)}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: 50,
                  border: `1px solid ${C.border}`,
                  background: "#1a2e1f",
                  color: C.text,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={addArenaSubmitting}
                onClick={submitNewArena}
                style={{
                  flex: 2,
                  padding: "14px",
                  borderRadius: 50,
                  border: "none",
                  background: C.green,
                  color: "#000",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: addArenaSubmitting ? "not-allowed" : "pointer",
                  opacity: addArenaSubmitting ? 0.55 : 1,
                }}
              >
                {addArenaSubmitting ? "Creating…" : "Create arena"}
              </button>
            </div>
          </div>
        </div>
      )}

      {addEventOpen && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 82, display: "flex", alignItems: "flex-end" }} onClick={() => setAddEventOpen(false)} role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-event-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxHeight: "85%",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              background: "#0f1f13",
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              border: `1px solid ${C.border}`,
              padding: `22px var(--page-pad-x) max(28px, env(safe-area-inset-bottom, 0px))`,
              boxSizing: "border-box",
            }}
          >
            <div style={{ width: 44, height: 4, borderRadius: 2, background: C.border, margin: "0 auto 18px" }} />
            <h2 id="add-event-title" style={{ margin: "0 0 6px", fontWeight: 900, fontSize: 20 }}>
              Add Discover event
            </h2>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: C.textMuted }}>
              For <span style={{ color: C.green, fontWeight: 700 }}>{arena.name}</span>. Players can register from Discover → Events.
            </p>
            {evError ? (
              <div style={{ background: "rgba(232,64,64,0.1)", border: "1px solid rgba(232,64,64,0.35)", borderRadius: 12, padding: "10px 12px", marginBottom: 14, color: C.red, fontSize: 13, fontWeight: 600 }}>{evError}</div>
            ) : null}
            <label style={{ fontSize: 12, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6 }}>Event title</label>
            <input
              value={evTitle}
              onChange={(e) => setEvTitle(e.target.value)}
              placeholder="e.g. Weekend mixed doubles"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 50,
                border: `1px solid ${C.border}`,
                background: "#0a130d",
                color: C.text,
                fontSize: 14,
                marginBottom: 14,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <label style={{ fontSize: 12, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6 }}>Starts</label>
            <input
              type="datetime-local"
              value={evStartsAt}
              onChange={(e) => setEvStartsAt(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 50,
                border: `1px solid ${C.border}`,
                background: "#0a130d",
                color: C.text,
                fontSize: 14,
                marginBottom: 14,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <label style={{ fontSize: 12, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6 }}>Ends</label>
            <input
              type="datetime-local"
              value={evEndsAt}
              onChange={(e) => setEvEndsAt(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 50,
                border: `1px solid ${C.border}`,
                background: "#0a130d",
                color: C.text,
                fontSize: 14,
                marginBottom: 14,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <label style={{ fontSize: 12, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6 }}>Display label (optional)</label>
            <input
              value={evDate}
              onChange={(e) => setEvDate(e.target.value)}
              placeholder="e.g. Sat, Mar 22 · 10am"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 50,
                border: `1px solid ${C.border}`,
                background: "#0a130d",
                color: C.text,
                fontSize: 14,
                marginBottom: 14,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <div style={{ fontSize: 12, color: C.textDim, fontWeight: 600, marginBottom: 8 }}>Sport icon</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              {EVENT_SPORT_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEvSport(em)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    border: `2px solid ${evSport === em ? C.green : C.border}`,
                    background: evSport === em ? "rgba(34,228,85,0.12)" : "#0a130d",
                    cursor: "pointer",
                    fontSize: 22,
                    lineHeight: 1,
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6 }}>Spots left</label>
                <input
                  value={evSpots}
                  onChange={(e) => setEvSpots(e.target.value)}
                  inputMode="numeric"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 50,
                    border: `1px solid ${C.border}`,
                    background: "#0a130d",
                    color: C.text,
                    fontSize: 14,
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6 }}>Total spots</label>
                <input
                  value={evTotal}
                  onChange={(e) => setEvTotal(e.target.value)}
                  inputMode="numeric"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 50,
                    border: `1px solid ${C.border}`,
                    background: "#0a130d",
                    color: C.text,
                    fontSize: 14,
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setAddEventOpen(false)}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: 50,
                  border: `1px solid ${C.border}`,
                  background: "#1a2e1f",
                  color: C.text,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitOwnerEvent}
                disabled={evSubmitting}
                style={{
                  flex: 2,
                  padding: "14px",
                  borderRadius: 50,
                  border: "none",
                  background: C.green,
                  color: "#000",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: evSubmitting ? "not-allowed" : "pointer",
                  opacity: evSubmitting ? 0.55 : 1,
                }}
              >
                {evSubmitting ? "Publishing…" : "Publish event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {addDealOpen && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 82, display: "flex", alignItems: "flex-end" }} onClick={() => setAddDealOpen(false)} role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-deal-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxHeight: "85%",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              background: "#0f1f13",
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              border: `1px solid ${C.border}`,
              padding: `22px var(--page-pad-x) max(28px, env(safe-area-inset-bottom, 0px))`,
              boxSizing: "border-box",
            }}
          >
            <div style={{ width: 44, height: 4, borderRadius: 2, background: C.border, margin: "0 auto 18px" }} />
            <h2 id="add-deal-title" style={{ margin: "0 0 6px", fontWeight: 900, fontSize: 20 }}>
              Add Discover deal
            </h2>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: C.textMuted }}>
              For <span style={{ color: C.green, fontWeight: 700 }}>{arena.name}</span>. Players may see it on Discover when it&apos;s active.
            </p>
            {dlError ? (
              <div style={{ background: "rgba(232,64,64,0.1)", border: "1px solid rgba(232,64,64,0.35)", borderRadius: 12, padding: "10px 12px", marginBottom: 14, color: C.red, fontSize: 13, fontWeight: 600 }}>{dlError}</div>
            ) : null}
            <label style={{ fontSize: 12, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6 }}>Title</label>
            <input
              value={dlTitle}
              onChange={(e) => setDlTitle(e.target.value)}
              placeholder="e.g. Spring weekday special"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 50,
                border: `1px solid ${C.border}`,
                background: "#0a130d",
                color: C.text,
                fontSize: 14,
                marginBottom: 14,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <label style={{ fontSize: 12, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6 }}>Discount (%)</label>
            <input
              value={dlDiscountPercent}
              onChange={(e) => setDlDiscountPercent(e.target.value)}
              inputMode="decimal"
              placeholder="0–100"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 50,
                border: `1px solid ${C.border}`,
                background: "#0a130d",
                color: C.text,
                fontSize: 14,
                marginBottom: 14,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <label style={{ fontSize: 12, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6 }}>Starts</label>
            <input
              type="datetime-local"
              value={dlStartsAt}
              onChange={(e) => setDlStartsAt(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 50,
                border: `1px solid ${C.border}`,
                background: "#0a130d",
                color: C.text,
                fontSize: 14,
                marginBottom: 14,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <label style={{ fontSize: 12, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6 }}>Ends</label>
            <input
              type="datetime-local"
              value={dlEndsAt}
              onChange={(e) => setDlEndsAt(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 50,
                border: `1px solid ${C.border}`,
                background: "#0a130d",
                color: C.text,
                fontSize: 14,
                marginBottom: 14,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <label style={{ fontSize: 12, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6 }}>Description (optional)</label>
            <textarea
              value={dlDescription}
              onChange={(e) => setDlDescription(e.target.value)}
              placeholder="Shown to players when applicable"
              rows={3}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 16,
                border: `1px solid ${C.border}`,
                background: "#0a130d",
                color: C.text,
                fontSize: 14,
                marginBottom: 14,
                boxSizing: "border-box",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
            <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, cursor: "pointer", fontSize: 13, color: C.text }}>
              <input type="checkbox" checked={dlIsActive} onChange={(e) => setDlIsActive(e.target.checked)} style={{ width: 18, height: 18, accentColor: C.green }} />
              <span>Deal is active</span>
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setAddDealOpen(false)}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: 50,
                  border: `1px solid ${C.border}`,
                  background: "#1a2e1f",
                  color: C.text,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitOwnerDeal}
                disabled={dlSubmitting}
                style={{
                  flex: 2,
                  padding: "14px",
                  borderRadius: 50,
                  border: "none",
                  background: C.green,
                  color: "#000",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: dlSubmitting ? "not-allowed" : "pointer",
                  opacity: dlSubmitting ? 0.55 : 1,
                }}
              >
                {dlSubmitting ? "Creating…" : "Create deal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {addCourtOpen && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 83, display: "flex", alignItems: "flex-end" }} onClick={() => setAddCourtOpen(false)} role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-court-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxHeight: "88%",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              background: "#0f1f13",
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              border: `1px solid ${C.border}`,
              padding: `22px var(--page-pad-x) max(28px, env(safe-area-inset-bottom, 0px))`,
              boxSizing: "border-box",
            }}
          >
            <div style={{ width: 44, height: 4, borderRadius: 2, background: C.border, margin: "0 auto 18px" }} />
            <h2 id="add-court-title" style={{ margin: "0 0 6px", fontWeight: 900, fontSize: 20 }}>
              Add court
            </h2>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: C.textMuted }}>
              Pick an arena, name the court, and choose its sport. Use toggles for booking and visibility (you can fine-tune later in Courts).
            </p>
            <label style={{ fontSize: 12, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 8 }}>Arena</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16, maxHeight: 200, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
              {ownerArenas.map((oa) => (
                <button
                  key={oa.id}
                  type="button"
                  onClick={() => {
                    setCtTargetArenaId(oa.id);
                    primeCourtFormForArenaRow(oa);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: `1px solid ${ctTargetArenaId === oa.id ? C.green : C.border}`,
                    background: ctTargetArenaId === oa.id ? "rgba(34,228,85,0.08)" : C.card,
                    color: C.text,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{oa.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{oa.location}</div>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 14 }}>
              Adding to: <span style={{ color: C.green, fontWeight: 700 }}>{courtTargetArena?.name}</span>
            </div>
            {ctError ? (
              <div style={{ background: "rgba(232,64,64,0.1)", border: "1px solid rgba(232,64,64,0.35)", borderRadius: 12, padding: "10px 12px", marginBottom: 14, color: C.red, fontSize: 13, fontWeight: 600 }}>{ctError}</div>
            ) : null}
            <label style={{ fontSize: 12, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6 }}>Court name</label>
            <input
              value={ctName}
              onChange={(e) => setCtName(e.target.value)}
              placeholder="e.g. Court 5"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 50,
                border: `1px solid ${C.border}`,
                background: "#0a130d",
                color: C.text,
                fontSize: 14,
                marginBottom: 14,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <label style={{ fontSize: 12, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 8 }}>Sport</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {ARENA_SPORT_VALUES.map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => setCtCourtSport(sp)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 50,
                    border: `1px solid ${ctCourtSport === sp ? C.green : C.border}`,
                    background: ctCourtSport === sp ? "rgba(34,228,85,0.12)" : "#0a130d",
                    color: ctCourtSport === sp ? C.green : C.textMuted,
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {ARENA_SPORT_LABELS[sp] ?? sp}
                </button>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 16,
                padding: "12px 14px",
                borderRadius: 14,
                background: "#0a130d",
                border: `1px solid ${C.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>Open for bookings</span>
                <button
                  type="button"
                  onClick={() => setCtIsBookable((v) => !v)}
                  style={{
                    minWidth: 52,
                    height: 28,
                    borderRadius: 20,
                    border: "none",
                    cursor: "pointer",
                    background: ctIsBookable ? C.green : "#1a2e1f",
                  }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>Listed for players</span>
                <button
                  type="button"
                  onClick={() => setCtListed((v) => !v)}
                  style={{
                    minWidth: 52,
                    height: 28,
                    borderRadius: 20,
                    border: "none",
                    cursor: "pointer",
                    background: ctListed ? C.green : "#1a2e1f",
                  }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setAddCourtOpen(false)}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: 50,
                  border: `1px solid ${C.border}`,
                  background: "#1a2e1f",
                  color: C.text,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={ctSubmitting}
                onClick={submitNewCourt}
                style={{
                  flex: 2,
                  padding: "14px",
                  borderRadius: 50,
                  border: "none",
                  background: C.green,
                  color: "#000",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: ctSubmitting ? "not-allowed" : "pointer",
                  opacity: ctSubmitting ? 0.55 : 1,
                }}
              >
                {ctSubmitting ? "Adding…" : "Add court"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editArenaOpen && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 84, display: "flex", alignItems: "flex-end" }} onClick={() => setEditArenaOpen(false)} role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-arena-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxHeight: "88%",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              background: "#0f1f13",
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              border: `1px solid ${C.border}`,
              padding: `22px var(--page-pad-x) max(28px, env(safe-area-inset-bottom, 0px))`,
              boxSizing: "border-box",
            }}
          >
            <div style={{ width: 44, height: 4, borderRadius: 2, background: C.border, margin: "0 auto 18px" }} />
            <h2 id="edit-arena-title" style={{ margin: "0 0 6px", fontWeight: 900, fontSize: 20 }}>
              Edit venue details
            </h2>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: C.textMuted }}>
              Saved to your account (name, location, primary sport). Players see updates on Home and Discover once refreshed.
            </p>
            {edError ? (
              <div style={{ background: "rgba(232,64,64,0.1)", border: "1px solid rgba(232,64,64,0.35)", borderRadius: 12, padding: "10px 12px", marginBottom: 14, color: C.red, fontSize: 13, fontWeight: 600 }}>{edError}</div>
            ) : null}
            <label style={{ fontSize: 12, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6 }}>Arena name</label>
            <input
              value={edName}
              onChange={(e) => setEdName(e.target.value)}
              placeholder="Venue name"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 50,
                border: `1px solid ${C.border}`,
                background: "#0a130d",
                color: C.text,
                fontSize: 14,
                marginBottom: 14,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <label style={{ fontSize: 12, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 6 }}>Location</label>
            <input
              value={edLocation}
              onChange={(e) => setEdLocation(e.target.value)}
              placeholder="City, area"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 50,
                border: `1px solid ${C.border}`,
                background: "#0a130d",
                color: C.text,
                fontSize: 14,
                marginBottom: 14,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <label style={{ fontSize: 12, color: C.textDim, fontWeight: 600, display: "block", marginBottom: 8 }}>Sport</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {ARENA_SPORT_VALUES.map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => setEdArenaSport(sp)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 50,
                    border: `1px solid ${edArenaSport === sp ? C.green : C.border}`,
                    background: edArenaSport === sp ? "rgba(34,228,85,0.12)" : "#0a130d",
                    color: edArenaSport === sp ? C.green : C.textMuted,
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {ARENA_SPORT_LABELS[sp] ?? sp}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                disabled={edArenaSubmitting}
                onClick={() => setEditArenaOpen(false)}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: 50,
                  border: `1px solid ${C.border}`,
                  background: "#1a2e1f",
                  color: C.text,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: edArenaSubmitting ? "not-allowed" : "pointer",
                  opacity: edArenaSubmitting ? 0.55 : 1,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={edArenaSubmitting}
                onClick={submitEditArena}
                style={{
                  flex: 2,
                  padding: "14px",
                  borderRadius: 50,
                  border: "none",
                  background: C.green,
                  color: "#000",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: edArenaSubmitting ? "not-allowed" : "pointer",
                  opacity: edArenaSubmitting ? 0.55 : 1,
                }}
              >
                {edArenaSubmitting ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
