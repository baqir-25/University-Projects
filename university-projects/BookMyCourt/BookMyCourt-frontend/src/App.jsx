import { useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { C } from "./theme.js";
import padelImg from "./assets/padel.jpg";
import { fetchDiscoverArenas, formatDiscoverDateLocal, mapDiscoverArenaRow } from "./api/discover.js";
import { fetchPublicDeals, mapPublicDealRow } from "./api/publicDeals.js";
import { fetchPublicEvents, mapPublicEventRow } from "./api/publicEvents.js";
import { ApiEnvelopeError } from "./api/client.js";
import { cancelEventRegistration, registerForEvent } from "./api/eventRegistration.js";
import { submitArenaReview } from "./api/arenaReviews.js";
import { extractBookingsList, fetchMyBookings, mapMyBookingRow, createBooking } from "./api/playerBookings.js";
import { logoutRemote } from "./api/auth.js";
import { getApiBase } from "./config/api.js";
import { clearSession, initialUserFromSession, saveSession } from "./auth/session.js";
import { Login } from "./pages/Login.jsx";
import { OwnerLogin } from "./pages/OwnerLogin.jsx";
import { AdminLogin } from "./pages/AdminLogin.jsx";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage.jsx";
import { OwnerLayout } from "./pages/owner/OwnerLayout.jsx";
import { OwnerHomePage } from "./pages/owner/OwnerHomePage.jsx";
import { OwnerBookingsPage } from "./pages/owner/OwnerBookingsPage.jsx";
import { OwnerCourtsPage } from "./pages/owner/OwnerCourtsPage.jsx";
import { OwnerSettingsPage } from "./pages/owner/OwnerSettingsPage.jsx";
import { Home } from "./pages/Home.jsx";
import { Detail } from "./pages/Detail.jsx";
import { Slots, SLOTS_TODAY_ANCHOR } from "./pages/Slots.jsx";
import { Confirmed } from "./pages/Confirmed.jsx";
import { Bookings } from "./pages/Bookings.jsx";
import { Discover } from "./pages/Discover.jsx";
import { Profile } from "./pages/Profile.jsx";
import { Nav } from "./components/Ui.jsx";

const playerTabs = [
  { k: "home", i: "home", l: "Home", to: "/" },
  { k: "discover", i: "compass", l: "Discover", to: "/discover" },
  { k: "bookings", i: "cal", l: "Bookings", to: "/bookings" },
  { k: "profile", i: "user", l: "Profile", to: "/profile" },
];

function arenaPathSegment(id) {
  return encodeURIComponent(String(id));
}

function computeActiveDeal(selectedArena, dealHighlight, apiDeals) {
  if (!selectedArena) return null;
  if (dealHighlight) {
    const h = dealHighlight;
    if (h.fromApi && selectedArena.price != null && typeof h.discountPercent === "number") {
      const o = Number(selectedArena.price);
      const pct = h.discountPercent;
      const p = Math.round(o * (100 - pct) * 0.01 * 100) * 0.01;
      return { ...h, original: o, price: p };
    }
    return h;
  }
  const fromApi =
    apiDeals?.find(
      (d) =>
        d.fromApi &&
        (String(d.arenaId) === String(selectedArena.id) || (d.arena != null && d.arena === selectedArena.name))
    ) ?? null;
  if (fromApi && selectedArena.price != null && typeof fromApi.discountPercent === "number") {
    const o = Number(selectedArena.price);
    const pct = fromApi.discountPercent;
    const p = Math.round(o * (100 - pct) * 0.01 * 100) * 0.01;
    return { ...fromApi, original: o, price: p };
  }
  if (fromApi) return fromApi;
  return null;
}

function resolveArenaFromRoute(arenaIdParam, locState, arenas) {
  if (arenaIdParam == null) return null;
  const decoded = decodeURIComponent(arenaIdParam);
  const fromList = arenas.find((x) => String(x.id) === String(decoded));
  if (fromList) return fromList;
  const snap = locState && typeof locState === "object" ? locState.arenaSnapshot : null;
  if (snap != null && String(snap.id) === String(decoded)) return snap;
  return null;
}

function formatShort(d) {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/**
 * Player Bookings tab: merge GET /api/bookings?scope=upcoming|past into state.
 * Keeps rows with `localOnly: true` unless the server returns the same `id`.
 * @param {unknown} upPayload - envelope `data` for upcoming (or null to skip)
 * @param {unknown} pastPayload - envelope `data` for past (or null to skip)
 */
function mergePlayerBookingsFromApi(upPayload, pastPayload, setBookings) {
  if (upPayload == null && pastPayload == null) return;
  let apiCombined = [];
  if (upPayload != null) {
    apiCombined = [
      ...apiCombined,
      ...extractBookingsList(upPayload)
        .map((r) => mapMyBookingRow(/** @type {Record<string, unknown>} */ (r), "upcoming"))
        .filter(Boolean),
    ];
  }
  if (pastPayload != null) {
    apiCombined = [
      ...apiCombined,
      ...extractBookingsList(pastPayload)
        .map((r) => mapMyBookingRow(/** @type {Record<string, unknown>} */ (r), "past"))
        .filter(Boolean),
    ];
  }
  setBookings((prev) => {
    const localOnly = prev.filter((b) => b.localOnly === true);
    const seen = new Set(apiCombined.map((x) => x.id));
    return [...apiCombined, ...localOnly.filter((b) => !seen.has(b.id))];
  });
}

function isLikelyMongoObjectId(id) {
  return typeof id === "string" && /^[a-f0-9]{24}$/i.test(id);
}

/**
 * Refetch both scopes after POST /api/bookings (or any mutation) so past rows are not dropped.
 * @param {React.Dispatch<React.SetStateAction<any[]>>} setBookings
 */
async function refreshPlayerBookingsFromApi(setBookings) {
  const settled = await Promise.allSettled([
    fetchMyBookings({ scope: "upcoming" }),
    fetchMyBookings({ scope: "past" }),
  ]);
  const bookUpRes = settled[0];
  const bookPastRes = settled[1];
  if (bookUpRes.status === "fulfilled" || bookPastRes.status === "fulfilled") {
    mergePlayerBookingsFromApi(
      bookUpRes.status === "fulfilled" ? bookUpRes.value : null,
      bookPastRes.status === "fulfilled" ? bookPastRes.value : null,
      setBookings
    );
  }
}

/** Sync a newly created owner arena into the player-facing catalog. */
function mapOwnerArenaToPublic(ownerRow, existingArenas) {
  const numericIds = existingArenas.map((a) => (typeof a.id === "number" ? a.id : 0));
  const nid = Math.max(0, ...numericIds) + 1;
  const sportLine = ownerRow.sport || "";
  const fromCourts = [...new Set(ownerRow.courts.map((c) => String(c.sport || "").trim()).filter(Boolean))];
  const sports =
    fromCourts.length > 0
      ? fromCourts.map((s) => s.toUpperCase())
      : sportLine
          .split(/·|,/)
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => s.toUpperCase());
  const sportsFinal = sports.length > 0 ? sports : ["MULTI-SPORT"];
  const basePrice = ownerRow.courts[0]?.price ?? 35;
  return {
    id: nid,
    name: ownerRow.name,
    location: ownerRow.location,
    price: basePrice,
    rating: 4.5,
    reviewCount: 0,
    sports: sportsFinal,
    img: padelImg,
    amenities: ["PARKING", "WATER"],
    description: `${ownerRow.name} · ${ownerRow.sport}. Courts managed on BookMyCourt.`,
    hours: "Open 24 Hours",
    courts: ownerRow.courts.map((c) => ({
      id: c.id,
      name: c.name,
      sport: c.sport,
      status: c.status || "available",
      bookedSlots: c.bookedSlots || [],
    })),
  };
}

/** Full player-facing arena row sync when owner edits venue name/location/sports line (match prior `name`). */
function applyOwnerDetailsToPublicArenas(prev, previousName, ownerRow) {
  return prev.map((a) => {
    if (a.name !== previousName) return a;
    const sportLine = ownerRow.sport || "";
    const fromCourts = [...new Set(ownerRow.courts.map((c) => String(c.sport || "").trim()).filter(Boolean))];
    const sports =
      fromCourts.length > 0
        ? fromCourts.map((s) => s.toUpperCase())
        : sportLine
            .split(/·|,/)
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => s.toUpperCase());
    const sportsFinal = sports.length > 0 ? sports : a.sports;
    const openPrice = ownerRow.courts.find((c) => c.status === "available" && c.visible !== false)?.price;
    return {
      ...a,
      name: ownerRow.name,
      location: ownerRow.location,
      sports: sportsFinal,
      description: `${ownerRow.name} · ${sportLine}. Courts managed on BookMyCourt.`,
      courts: ownerRow.courts.map((c) => ({
        id: c.id,
        name: c.name,
        sport: c.sport,
        status: c.status || "available",
        bookedSlots: c.bookedSlots || [],
      })),
      price: openPrice ?? ownerRow.courts[0]?.price ?? a.price,
    };
  });
}

/** Keep player-facing `arenas` court lists in sync when owner edits courts (non-Vanguard Detail uses `arena.courts`). */
function applyOwnerCourtsToPublicArenas(prev, ownerRow) {
  return prev.map((a) => {
    if (a.name !== ownerRow.name) return a;
    const sportsRaw = [...new Set(ownerRow.courts.map((c) => String(c.sport || "").trim()).filter(Boolean))];
    const sports = sportsRaw.length > 0 ? sportsRaw.map((s) => s.toUpperCase()) : a.sports;
    const openPrice = ownerRow.courts.find((c) => c.status === "available" && c.visible !== false)?.price;
    return {
      ...a,
      courts: ownerRow.courts.map((c) => ({
        id: c.id,
        name: c.name,
        sport: c.sport,
        status: c.status || "available",
        bookedSlots: c.bookedSlots || [],
      })),
      sports,
      price: openPrice ?? ownerRow.courts[0]?.price ?? a.price,
    };
  });
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(initialUserFromSession);
  const [arenas, setArenas] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [slotDateLabel, setSlotDateLabel] = useState(() => formatShort(SLOTS_TODAY_ANCHOR));

  const [ownerArenas, setOwnerArenas] = useState([]);
  const [ownerSelectedId, setOwnerSelectedId] = useState("");
  const [vanguardCourts, setVanguardCourts] = useState([]);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  /** `null` = not loaded from API yet; array = loaded (may be empty). */
  const [apiEvents, setApiEvents] = useState(/** @type {null | unknown[]} */ (null));
  const [apiDeals, setApiDeals] = useState(/** @type {null | unknown[]} */ (null));
  const [eventRegisterBusyKey, setEventRegisterBusyKey] = useState(/** @type {string | null} */ (null));
  const [eventRegisterError, setEventRegisterError] = useState(/** @type {string | null} */ (null));
  const [reviewError, setReviewError] = useState(/** @type {string | null} */ (null));
  const [bookingError, setBookingError] = useState(/** @type {string | null} */ (null));

  useEffect(() => {
    if (!user || user.role === "owner") return;
    const base = getApiBase();
    if (!base) return;
    let cancelled = false;
    (async () => {
      setDiscoverLoading(true);
      const settled = await Promise.allSettled([
        fetchDiscoverArenas({ date: formatDiscoverDateLocal(SLOTS_TODAY_ANCHOR) }),
        fetchPublicEvents({}),
        fetchPublicDeals(),
        fetchMyBookings({ scope: "upcoming" }),
        fetchMyBookings({ scope: "past" }),
      ]);
      if (cancelled) return;
      const [arenasRes, eventsRes, dealsRes, bookUpRes, bookPastRes] = settled;

      if (arenasRes.status === "fulfilled") {
        const mapped = arenasRes.value.map(mapDiscoverArenaRow).filter(Boolean);
        setArenas(mapped);
      } else {
        console.warn("GET /api/arenas/discover failed.", arenasRes.reason);
      }

      if (eventsRes.status === "fulfilled") {
        setApiEvents(eventsRes.value.map(mapPublicEventRow).filter(Boolean));
      } else {
        console.warn("GET /api/events failed.", eventsRes.reason);
        setApiEvents([]);
      }

      if (dealsRes.status === "fulfilled") {
        setApiDeals(dealsRes.value.map(mapPublicDealRow).filter(Boolean));
      } else {
        console.warn("GET /api/deals failed.", dealsRes.reason);
        setApiDeals([]);
      }

      if (bookUpRes.status !== "fulfilled") {
        console.warn("GET /api/bookings?scope=upcoming failed", bookUpRes.reason);
      }
      if (bookPastRes.status !== "fulfilled") {
        console.warn("GET /api/bookings?scope=past failed", bookPastRes.reason);
      }

      if (bookUpRes.status === "fulfilled" || bookPastRes.status === "fulfilled") {
        mergePlayerBookingsFromApi(
          bookUpRes.status === "fulfilled" ? bookUpRes.value : null,
          bookPastRes.status === "fulfilled" ? bookPastRes.value : null,
          setBookings
        );
      }

      setDiscoverLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  /** Bookings tab: refresh server lists when the player opens the tab (Bearer). */
  useEffect(() => {
    if (!user || user.role === "owner") return;
    if (location.pathname !== "/bookings") return;
    if (!getApiBase()) return;
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await refreshPlayerBookingsFromApi(setBookings);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, location.pathname]);

  const discoverEvents = useMemo(() => {
    const fromOwners = ownerArenas.flatMap((oa) =>
      (oa.events || []).map((e) => ({
        ...e,
        arena: e.arena || oa.name,
      }))
    );
    const base = apiEvents ?? [];
    return [...base, ...fromOwners];
  }, [ownerArenas, apiEvents]);

  const discoverDeals = useMemo(() => {
    const list = apiDeals ?? [];
    return [...list].sort((a, b) => {
      const ta = a.endsAt ? new Date(a.endsAt).getTime() : Number.POSITIVE_INFINITY;
      const tb = b.endsAt ? new Date(b.endsAt).getTime() : Number.POSITIVE_INFINITY;
      const na = Number.isNaN(ta);
      const nb = Number.isNaN(tb);
      if (na && nb) return 0;
      if (na) return 1;
      if (nb) return -1;
      return ta - tb;
    });
  }, [apiDeals]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const login = (auth) => {
    saveSession({
      accessToken: auth.accessToken,
      expiresIn: auth.expiresIn,
      user: auth.user,
    });
    setUser(auth.user);
    navigate(auth.user.role === "owner" ? "/owner/home" : auth.user.role === "admin" ? "/admin/users" : "/", {
      replace: true,
    });
  };

  const logout = async () => {
    await logoutRemote();
    clearSession();
    setUser(null);
    navigate("/login", { replace: true });
  };

  const addBooking = (b) => setBookings((p) => [b, ...p]);

  const registerEvent = async (ev) => {
    const regKey = String(ev.id ?? ev.ownerEventId ?? ev.title ?? "");
    if (!regKey || registeredEvents.includes(regKey)) return;

    setEventRegisterError(null);
    const busyKey = String(ev.id ?? regKey);
    setEventRegisterBusyKey(busyKey);

    const pushLocalBooking = (meta, bookingId, apiEventId = null) => {
      setRegisteredEvents((prev) => (prev.includes(regKey) ? prev : [...prev, regKey]));
      setBookings((b) => [
        {
          id: bookingId,
          apiEventId: apiEventId ?? undefined,
          eventRegKey: regKey,
          arena: meta.arena,
          court: "Event",
          date: meta.date,
          time: "TBD",
          status: "upcoming",
          amt: 0,
          isEvent: true,
          eventTitle: meta.title,
          sport: meta.sport,
          localOnly: true,
          arenaId: meta.arenaId != null ? String(meta.arenaId) : meta.arenaRef?.id != null ? String(meta.arenaRef.id) : undefined,
        },
        ...b,
      ]);
      setNotifications((prevN) => [
        {
          id: "ev-" + Date.now(),
          type: "event",
          read: false,
          time: "Just now",
          msg: `🏆 You're registered for ${meta.title} on ${meta.date}!`,
        },
        ...prevN,
      ]);
    };

    try {
      if (ev.fromApi && ev.id) {
        const data = /** @type {Record<string, unknown>} */ (await registerForEvent(String(ev.id)));
        const regId = data.registrationId != null ? String(data.registrationId) : "";
        const bookingId = regId ? `evt-reg-${regId}` : `#EVT-${Math.floor(10000 + Math.random() * 90000)}`;
        const title = typeof data.title === "string" ? data.title : ev.title;
        const eventId = data.eventId != null ? String(data.eventId) : String(ev.id);
        pushLocalBooking(
          { ...ev, arena: ev.arena, title, date: ev.date, arenaId: ev.arenaRef?.id },
          bookingId,
          eventId
        );
      } else {
        const newId = "#EVT-" + Math.floor(10000 + Math.random() * 90000);
        pushLocalBooking(ev, newId, null);
      }
    } catch (e) {
      const msg = e instanceof ApiEnvelopeError ? e.message : "Could not register for this event.";
      setEventRegisterError(msg);
    } finally {
      setEventRegisterBusyKey(null);
    }
  };

  const unregisterEvent = async (ev) => {
    const regKey = String(ev.id ?? ev.ownerEventId ?? ev.title ?? "");
    if (!regKey || !registeredEvents.includes(regKey)) return;

    setEventRegisterError(null);
    setEventRegisterBusyKey(String(ev.id ?? regKey));

    try {
      if (ev.fromApi && ev.id) {
        try {
          await cancelEventRegistration(String(ev.id));
        } catch (e) {
          if (e instanceof ApiEnvelopeError && e.status === 404) {
            /* treat as already gone */
          } else {
            throw e;
          }
        }
      }
      setRegisteredEvents((prev) => prev.filter((k) => k !== regKey));
      setBookings((prev) =>
        prev.filter((b) => !(b.isEvent && (b.eventRegKey === regKey || (ev.fromApi && b.apiEventId === String(ev.id)))))
      );
      setNotifications((prevN) => [
        {
          id: "ev-unsub-" + Date.now(),
          type: "event",
          read: true,
          time: "Just now",
          msg: `Removed registration for ${ev.title}.`,
        },
        ...prevN,
      ]);
    } catch (e) {
      const msg = e instanceof ApiEnvelopeError ? e.message : "Could not cancel registration.";
      setEventRegisterError(msg);
    } finally {
      setEventRegisterBusyKey(null);
    }
  };

  const submitReview = async (booking, stars, comment) => {
    setReviewError(null);
    const arenaName = booking.arena;
    const trimmed = typeof comment === "string" ? comment.trim().slice(0, 2000) : "";
    const arenaId = booking.arenaId ?? arenas.find((x) => x.name === arenaName)?.id;

    if (getApiBase() && user && user.role !== "owner" && arenaId != null && String(arenaId) !== "") {
      try {
        await submitArenaReview(String(arenaId), {
          rating: stars,
          comment: trimmed || undefined,
          booking: booking.apiBookingId ? String(booking.apiBookingId) : undefined,
        });
      } catch (e) {
        const msg = e instanceof ApiEnvelopeError ? e.message : "Could not submit review.";
        setReviewError(msg);
        throw e;
      }
    }

    setArenas((prev) =>
      prev.map((a) => {
        const matchArena =
          (arenaId != null && String(a.id) === String(arenaId)) || a.name === arenaName;
        if (!matchArena) return a;
        const newCount = (a.reviewCount || 0) + 1;
        const baseR = a.rating || 0;
        const newRating = Math.round(((baseR * (newCount - 1) + stars) / newCount) * 10) / 10;
        return { ...a, rating: newRating, reviewCount: newCount };
      })
    );
    setNotifications((p) => [
      {
        id: "rev-" + Date.now(),
        type: "review",
        read: true,
        time: "Just now",
        msg: `Thanks! You rated ${arenaName} ${stars}★.`,
      },
      ...p,
    ]);
  };

  const onCancelBooking = async (id) => {
    const b = bookings.find((x) => x.id === id);
    if (b?.isEvent) {
      if (b.apiEventId) {
        try {
          await cancelEventRegistration(String(b.apiEventId));
        } catch (e) {
          if (!(e instanceof ApiEnvelopeError && e.status === 404)) {
            setEventRegisterError(e instanceof ApiEnvelopeError ? e.message : "Could not cancel event registration.");
            return;
          }
        }
      }
      const rk = b.eventRegKey ?? (b.apiEventId != null ? String(b.apiEventId) : null);
      if (rk) setRegisteredEvents((prev) => prev.filter((k) => k !== rk));
    }
    setBookings((p) => p.map((x) => (x.id === id ? { ...x, status: "cancelled" } : x)));
  };

  const onMarkRead = (id) => setNotifications((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const onMarkAllRead = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  const onDeleteNotif = (id) => setNotifications((p) => p.filter((n) => n.id !== id));

  const openArena = (a, dealFromDiscover = null) => {
    navigate(`/arena/${arenaPathSegment(a.id)}`, {
      state: {
        arenaSnapshot: a,
        ...(dealFromDiscover != null ? { dealHighlight: dealFromDiscover } : {}),
      },
    });
  };

  const openDiscoverDeal = (arena, deal) => {
    if (arena) {
      openArena(arena, deal);
      return;
    }
    if (deal?.fromApi && deal.arenaRef) {
      const ref = deal.arenaRef;
      const aid = ref.id || (ref._id != null ? String(ref._id) : "") || deal.arenaId;
      openArena(
        {
          id: aid,
          name: ref.name,
          location: ref.location ?? "",
          img: deal.imageUrl || (ref.imageUrl != null ? String(ref.imageUrl) : null),
          sports: ref.sport ? [String(ref.sport).toUpperCase()] : [],
          price: 0,
          rating: 0,
          reviewCount: 0,
          courts: [],
          description: deal.description || `${ref.name}.`,
          amenities: [],
          hours: "Open 24 Hours",
          priceSuffix: "slot",
          fromDiscover: true,
        },
        deal
      );
    }
  };

  const handleSlotConfirm = async (
    a,
    slotLabel,
    hours,
    total,
    representativeDeal,
    savings,
    courtName,
    meta
  ) => {
    const useApi = Boolean(
      getApiBase() && user && user.role !== "owner" && isLikelyMongoObjectId(String(a?.id ?? ""))
    );

    if (useApi) {
      if (!meta?.dateYmd || !Array.isArray(meta.apiTimeSlots) || meta.apiTimeSlots.length === 0) {
        setBookingError("Could not complete booking. Please try again.");
        return;
      }
      const hasCourts = Array.isArray(a.courts) && a.courts.length > 0;
      if (hasCourts) {
        const cid = meta.court?.id != null ? String(meta.court.id) : "";
        if (!cid) {
          setBookingError("Court is required for this arena.");
          return;
        }
      }

      setBookingError(null);
      try {
        /** @type {{ arena: string, date: string, timeSlot: string, court?: string }} */
        const body = {
          arena: String(a.id),
          date: meta.dateYmd,
          timeSlot: String(meta.apiTimeSlots[0]),
        };
        if (hasCourts) {
          body.court = String(meta.court.id);
        }

        const data = await createBooking(body);
        await refreshPlayerBookingsFromApi(setBookings);

        const displayId =
          data && typeof data === "object" && data._id != null
            ? String(data._id)
            : "#BMC-" + Math.floor(10000 + Math.random() * 90000);
        setNotifications((p) => [
          {
            id: "n-" + Date.now(),
            type: "booking",
            read: false,
            time: "Just now",
            msg: `✅ Booking confirmed at ${a.name} · ${slotLabel}`,
          },
          ...p,
        ]);
        const pending = {
          label: slotLabel,
          hours,
          total,
          courtName,
          savings,
          deal: representativeDeal,
          bookingId: displayId,
          date: slotDateLabel,
        };
        const nextState = {
          ...(typeof location.state === "object" && location.state !== null ? location.state : {}),
          arenaSnapshot: a,
          pendingSlot: pending,
          lastBookingId: displayId,
        };
        navigate(`/arena/${arenaPathSegment(a.id)}/confirmed`, { replace: true, state: nextState });
      } catch (e) {
        if (e instanceof ApiEnvelopeError) {
          setBookingError(e.message);
        } else {
          setBookingError("Booking failed.");
        }
      }
      return;
    }

    const id = "#BMC-" + Math.floor(10000 + Math.random() * 90000);
    addBooking({
      id,
      arena: a.name,
      arenaId: a.id != null ? String(a.id) : undefined,
      court: courtName,
      date: slotDateLabel,
      time: slotLabel,
      status: "upcoming",
      amt: total,
      savings: savings || 0,
      localOnly: true,
    });
    setNotifications((p) => [
      {
        id: "n-" + Date.now(),
        type: "booking",
        read: false,
        time: "Just now",
        msg: `✅ Booking confirmed at ${a.name} · ${slotLabel}`,
      },
      ...p,
    ]);
    const pending = {
      label: slotLabel,
      hours,
      total,
      courtName,
      savings,
      deal: representativeDeal,
      bookingId: id,
      date: slotDateLabel,
    };
    const nextState = {
      ...(typeof location.state === "object" && location.state !== null ? location.state : {}),
      arenaSnapshot: a,
      pendingSlot: pending,
      lastBookingId: id,
    };
    navigate(`/arena/${arenaPathSegment(a.id)}/confirmed`, { replace: true, state: nextState });
  };

  const shell = (child) => (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        width: "100%",
        maxWidth: "100%",
        margin: 0,
        background: C.bg,
        color: C.text,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
        boxSizing: "border-box",
      }}
    >
      {child}
    </div>
  );

  function PlayerArenaDetail() {
    const { arenaId } = useParams();
    const loc = useLocation();
    const nav = useNavigate();
    const arenaMemo = resolveArenaFromRoute(arenaId, loc.state, arenas);
    const highlight =
      loc.state && typeof loc.state === "object" && loc.state.dealHighlight != null ? loc.state.dealHighlight : null;
    const deal = computeActiveDeal(arenaMemo, highlight, apiDeals);

    if (!arenaMemo) {
      if (discoverLoading) {
        return shell(
          <div style={{ padding: 24, color: C.textMuted, textAlign: "center", fontSize: 14 }}>Loading venue…</div>
        );
      }
      return <Navigate to="/" replace />;
    }

    return shell(
      <Detail
        arena={arenaMemo}
        activeDeal={deal}
        courts={vanguardCourts}
        onBack={() => nav(-1)}
        onBook={() => {
          setSlotDateLabel(formatShort(SLOTS_TODAY_ANCHOR));
          nav(`/arena/${arenaPathSegment(arenaMemo.id)}/slots`, { state: loc.state });
        }}
        arenas={arenas}
      />
    );
  }

  function PlayerArenaSlots() {
    const { arenaId } = useParams();
    const loc = useLocation();
    const nav = useNavigate();
    const arenaMemo = resolveArenaFromRoute(arenaId, loc.state, arenas);
    const highlight =
      loc.state && typeof loc.state === "object" && loc.state.dealHighlight != null ? loc.state.dealHighlight : null;
    const deal = computeActiveDeal(arenaMemo, highlight, apiDeals);
    if (!arenaMemo) return <Navigate to="/" replace />;
    return shell(
      <Slots
        arena={arenaMemo}
        activeDeal={deal}
        courts={vanguardCourts}
        onBack={() => nav(`/arena/${arenaPathSegment(arenaMemo.id)}`, { state: loc.state })}
        onConfirm={handleSlotConfirm}
        onDayChange={(_, lbl) => setSlotDateLabel(lbl)}
        serverSlotMode={Boolean(
          getApiBase() && user && user.role !== "owner" && arenaMemo && isLikelyMongoObjectId(String(arenaMemo.id ?? ""))
        )}
        bookingError={bookingError}
        onDismissBookingError={() => setBookingError(null)}
        slotDeals={discoverDeals}
      />
    );
  }

  function PlayerArenaConfirmed() {
    const { arenaId } = useParams();
    const loc = useLocation();
    const nav = useNavigate();
    const arenaMemo = resolveArenaFromRoute(arenaId, loc.state, arenas);
    const pending =
      loc.state && typeof loc.state === "object" && loc.state.pendingSlot != null ? loc.state.pendingSlot : null;
    const lastBookingId =
      (loc.state && typeof loc.state === "object" && loc.state.lastBookingId) || pending?.bookingId || "";

    if (!arenaMemo || !pending) {
      return <Navigate to={arenaMemo ? `/arena/${arenaPathSegment(arenaMemo.id)}` : "/"} replace />;
    }

    return shell(
      <Confirmed
        arena={arenaMemo}
        slot={{ ...pending, bookingId: lastBookingId }}
        bookingId={lastBookingId}
        onHome={() => nav("/", { replace: true })}
        onBookings={() => nav("/bookings", { replace: true })}
      />
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={shell(<Login onLogin={login} />)} />
        <Route path="/owner/login" element={shell(<OwnerLogin onLogin={login} />)} />
        <Route path="/admin/login" element={shell(<AdminLogin onLogin={login} />)} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (user.role === "owner") {
    return (
      <Routes>
        <Route
          path="/owner"
          element={shell(
            <OwnerLayout
              onLogout={logout}
              courts={vanguardCourts}
              setCourts={setVanguardCourts}
              ownerArenas={ownerArenas}
              setOwnerArenas={setOwnerArenas}
              selectedArenaId={ownerSelectedId}
              setSelectedArenaId={setOwnerSelectedId}
              ownerUserId={user.id}
              onArenaAdded={(ownerRow) => setArenas((prev) => [...prev, mapOwnerArenaToPublic(ownerRow, prev)])}
              onOwnerArenaUpdated={(ownerRow) => setArenas((prev) => applyOwnerCourtsToPublicArenas(prev, ownerRow))}
              onOwnerArenaDetailsUpdated={(previousName, ownerRow) =>
                setArenas((prev) => applyOwnerDetailsToPublicArenas(prev, previousName, ownerRow))
              }
            />
          )}
        >
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<OwnerHomePage />} />
          <Route path="bookings" element={<OwnerBookingsPage />} />
          <Route path="courts" element={<OwnerCourtsPage />} />
          <Route path="settings" element={<OwnerSettingsPage />} />
          <Route path="*" element={<Navigate to="/owner/home" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/owner/home" replace />} />
      </Routes>
    );
  }

  if (user.role === "admin") {
    return (
      <Routes>
        <Route path="/admin/:tab" element={shell(<AdminDashboardPage onLogout={logout} />)} />
        <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
        <Route path="*" element={<Navigate to="/admin/users" replace />} />
      </Routes>
    );
  }

  const tabShell = (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        width: "100%",
        paddingBottom: "var(--bmc-tab-bar-height)",
        boxSizing: "border-box",
      }}
    >
      <div style={{ flex: 1, minHeight: 0, position: "relative", width: "100%" }}>
        <Outlet />
      </div>
      <Nav tabs={playerTabs} />
    </div>
  );

  return (
    <Routes>
      <Route path="/arena/:arenaId/confirmed" element={<PlayerArenaConfirmed />} />
      <Route path="/arena/:arenaId/slots" element={<PlayerArenaSlots />} />
      <Route path="/arena/:arenaId" element={<PlayerArenaDetail />} />
      <Route path="/" element={shell(tabShell)}>
        <Route
          index
          element={
            <Home
              onArena={openArena}
              courts={vanguardCourts}
              arenas={arenas}
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAllRead={onMarkAllRead}
              onMarkRead={onMarkRead}
              onDeleteNotif={onDeleteNotif}
              discoverLoading={discoverLoading}
            />
          }
        />
        <Route
          path="discover"
          element={
            <Discover
              onArena={(a) => openArena(a, null)}
              onDeal={(arena, deal) => openDiscoverDeal(arena, deal)}
              onRegister={registerEvent}
              onUnregister={unregisterEvent}
              registeredEvents={registeredEvents}
              arenas={arenas}
              events={discoverEvents}
              deals={discoverDeals}
              discoverLoading={discoverLoading}
              eventRegisterBusyKey={eventRegisterBusyKey}
              eventRegisterError={eventRegisterError}
              onDismissEventRegisterError={() => setEventRegisterError(null)}
            />
          }
        />
        <Route
          path="bookings"
          element={
            <Bookings
              bookings={bookings}
              onCancelBooking={onCancelBooking}
              submitReview={submitReview}
              reviewError={reviewError}
              onDismissReviewError={() => setReviewError(null)}
            />
          }
        />
        <Route path="profile" element={<Profile onLogout={logout} user={user} />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
