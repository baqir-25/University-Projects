import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Btn } from "../../components/Ui.jsx";
import { C } from "../../theme.js";
import {
  deleteAdminArena,
  deleteAdminCourt,
  deleteAdminOwner,
  deleteAdminUser,
  fetchAdminAnalyticsOverview,
  fetchAdminArenas,
  fetchAdminCourts,
  fetchAdminOwners,
  fetchAdminUsers,
  patchAdminArena,
  patchAdminCourt,
  patchAdminOwner,
  patchAdminUser,
} from "../../api/admin.js";
import { ApiEnvelopeError } from "../../api/client.js";

const TABS = [
  { key: "users", label: "Users" },
  { key: "owners", label: "Owners" },
  { key: "arenas", label: "Arenas" },
  { key: "courts", label: "Courts" },
  { key: "analytics", label: "Analytics" },
];

function ymdDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function errMessage(e, fallback) {
  return e instanceof ApiEnvelopeError ? e.message : fallback;
}

function moneyPKR(v) {
  return `PKR ${Number(v || 0).toLocaleString("en-PK")}`;
}

function statusChipStyle(disabled) {
  return {
    border: `1px solid ${disabled ? "rgba(232,64,64,0.35)" : "rgba(34,228,85,0.35)"}`,
    color: disabled ? C.red : C.green,
    background: disabled ? "rgba(232,64,64,0.1)" : "rgba(34,228,85,0.1)",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    padding: "4px 10px",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  };
}

function actionBtnStyle(type = "default", disabled = false) {
  if (type === "danger") {
    return {
      border: "1px solid rgba(232,64,64,0.4)",
      background: "rgba(232,64,64,0.1)",
      color: C.red,
      borderRadius: 10,
      fontSize: 12,
      fontWeight: 700,
      padding: "8px 12px",
      cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.55 : 1,
    };
  }
  if (type === "toggle") {
    return {
      border: `1px solid ${C.border}`,
      background: "#0c1a10",
      color: C.orange,
      borderRadius: 10,
      fontSize: 12,
      fontWeight: 700,
      padding: "8px 12px",
      cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.55 : 1,
    };
  }
  return {};
}

function RowCard({ title, subtitle, meta, disabled, busy, onToggle, onRemove }) {
  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        background: C.card,
        padding: 14,
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}>{title}</div>
          <div style={{ color: C.textDim, fontSize: 12 }}>{subtitle}</div>
          {meta ? <div style={{ color: C.textMuted, fontSize: 11, marginTop: 4 }}>{meta}</div> : null}
        </div>
        <span style={statusChipStyle(disabled)}>{disabled ? "Disabled" : "Active"}</span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" disabled={busy} onClick={onToggle} style={actionBtnStyle("toggle", busy)}>
          {busy ? "Please wait..." : disabled ? "Enable" : "Disable"}
        </button>
        <button type="button" disabled={busy} onClick={onRemove} style={actionBtnStyle("danger", busy)}>
          Remove
        </button>
      </div>
    </div>
  );
}

export function AdminDashboardPage({ onLogout }) {
  const navigate = useNavigate();
  const { tab } = useParams();
  const activeTab = TABS.some((t) => t.key === tab) ? tab : "users";

  const [users, setUsers] = useState([]);
  const [owners, setOwners] = useState([]);
  const [arenas, setArenas] = useState([]);
  const [courts, setCourts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [fromDate, setFromDate] = useState(ymdDaysAgo(30));
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [busyKey, setBusyKey] = useState("");
  const [error, setError] = useState("");

  const ownerNameById = useMemo(() => Object.fromEntries(owners.map((o) => [String(o.id), o.name])), [owners]);
  const arenaNameById = useMemo(() => Object.fromEntries(arenas.map((a) => [String(a.id), a.name])), [arenas]);

  const loadLists = async () => {
    setLoading(true);
    setError("");
    try {
      const [u, o, a, c] = await Promise.all([
        fetchAdminUsers({ page: 1, limit: 100 }),
        fetchAdminOwners({ page: 1, limit: 100 }),
        fetchAdminArenas({ page: 1, limit: 100 }),
        fetchAdminCourts({ page: 1, limit: 100 }),
      ]);
      setUsers(Array.isArray(u) ? u : []);
      setOwners(Array.isArray(o) ? o : []);
      setArenas(Array.isArray(a) ? a : []);
      setCourts(Array.isArray(c) ? c : []);
    } catch (e) {
      setError(errMessage(e, "Could not load admin data."));
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    if (!fromDate || !toDate) return;
    setLoadingAnalytics(true);
    setError("");
    try {
      const data = await fetchAdminAnalyticsOverview({ from: fromDate, to: toDate });
      setAnalytics(data && typeof data === "object" ? data : null);
    } catch (e) {
      setError(errMessage(e, "Could not load analytics."));
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    if (activeTab === "analytics") loadAnalytics();
  }, [activeTab]);

  const runMutation = async (key, action) => {
    setBusyKey(key);
    setError("");
    try {
      await action();
      await loadLists();
      if (activeTab === "analytics") await loadAnalytics();
    } catch (e) {
      setError(errMessage(e, "Action failed."));
    } finally {
      setBusyKey("");
    }
  };

  return (
    <div style={{ height: "100%", width: "100%", overflowY: "auto", padding: "20px var(--page-pad-x) 26px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, letterSpacing: -0.9 }}>Admin Dashboard</h1>
          <p style={{ margin: "6px 0 0", color: C.textDim, fontSize: 13 }}>Monitor accounts, venues and business metrics</p>
        </div>
        <div style={{ width: 130 }}>
          <Btn onClick={onLogout} style={{ padding: "10px 14px", fontSize: 13 }}>
            Logout
          </Btn>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {TABS.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => navigate(`/admin/${t.key}`)}
              style={{
                border: `1px solid ${isActive ? `${C.green}66` : C.border}`,
                background: isActive ? "rgba(34,228,85,0.08)" : C.card,
                color: isActive ? C.green : C.textMuted,
                borderRadius: 12,
                padding: "9px 13px",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.3,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <div style={{ background: "rgba(232,64,64,0.08)", border: "1px solid rgba(232,64,64,0.35)", borderRadius: 12, color: C.red, padding: "10px 12px", fontSize: 13, marginBottom: 12 }}>
          {error}
        </div>
      ) : null}

      {loading && activeTab !== "analytics" ? <div style={{ color: C.textDim, fontSize: 13 }}>Loading records...</div> : null}

      {activeTab === "users" ? (
        <div style={{ display: "grid", gap: 10 }}>
          {users.map((u) => {
            const id = String(u.id ?? u._id ?? "");
            const disabled = Boolean(u.disabled);
            const busy = busyKey === `users:${id}`;
            return (
              <RowCard
                key={id}
                title={u.name || "Player"}
                subtitle={u.email || "—"}
                meta={u.city ? `City: ${u.city}` : null}
                disabled={disabled}
                busy={busy}
                onToggle={() => runMutation(`users:${id}`, () => patchAdminUser(id, { disabled: !disabled }))}
                onRemove={() => runMutation(`users:${id}`, () => deleteAdminUser(id))}
              />
            );
          })}
        </div>
      ) : null}

      {activeTab === "owners" ? (
        <div style={{ display: "grid", gap: 10 }}>
          {owners.map((o) => {
            const id = String(o.id ?? o._id ?? "");
            const disabled = Boolean(o.disabled);
            const busy = busyKey === `owners:${id}`;
            return (
              <RowCard
                key={id}
                title={o.name || "Owner"}
                subtitle={o.email || "—"}
                disabled={disabled}
                busy={busy}
                onToggle={() => runMutation(`owners:${id}`, () => patchAdminOwner(id, { disabled: !disabled, cascade: true }))}
                onRemove={() => runMutation(`owners:${id}`, () => deleteAdminOwner(id))}
              />
            );
          })}
        </div>
      ) : null}

      {activeTab === "arenas" ? (
        <div style={{ display: "grid", gap: 10 }}>
          {arenas.map((a) => {
            const id = String(a.id ?? a._id ?? "");
            const ownerId = String(a.owner?.id ?? a.owner?._id ?? a.ownerId ?? "");
            const disabled = Boolean(a.disabled);
            const busy = busyKey === `arenas:${id}`;
            return (
              <RowCard
                key={id}
                title={a.name || "Arena"}
                subtitle={a.location || "—"}
                meta={`Owner: ${a.owner?.name || ownerNameById[ownerId] || "Unknown owner"}`}
                disabled={disabled}
                busy={busy}
                onToggle={() => runMutation(`arenas:${id}`, () => patchAdminArena(id, { disabled: !disabled }))}
                onRemove={() => runMutation(`arenas:${id}`, () => deleteAdminArena(id))}
              />
            );
          })}
        </div>
      ) : null}

      {activeTab === "courts" ? (
        <div style={{ display: "grid", gap: 10 }}>
          {courts.map((c) => {
            const id = String(c.id ?? c._id ?? "");
            const arenaId = String(c.arena?.id ?? c.arena?._id ?? c.arenaId ?? "");
            const disabled = Boolean(c.disabled);
            const busy = busyKey === `courts:${id}`;
            return (
              <RowCard
                key={id}
                title={c.name || "Court"}
                subtitle={c.sport || "—"}
                meta={`Arena: ${c.arena?.name || arenaNameById[arenaId] || "Unknown arena"}`}
                disabled={disabled}
                busy={busy}
                onToggle={() => runMutation(`courts:${id}`, () => patchAdminCourt(id, { disabled: !disabled }))}
                onRemove={() => runMutation(`courts:${id}`, () => deleteAdminCourt(id))}
              />
            );
          })}
        </div>
      ) : null}

      {activeTab === "analytics" ? (
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 16, background: C.card, padding: 14 }}>
            <div style={{ color: C.textDim, fontSize: 12, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.3 }}>Date Range</div>
            <div style={{ display: "flex", alignItems: "end", gap: 10, flexWrap: "wrap" }}>
              <div>
                <div style={{ color: C.textDim, fontSize: 11, marginBottom: 5 }}>From</div>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ background: "#0f1f13", border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, padding: "8px 10px" }} />
              </div>
              <div>
                <div style={{ color: C.textDim, fontSize: 11, marginBottom: 5 }}>To</div>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ background: "#0f1f13", border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, padding: "8px 10px" }} />
              </div>
              <button
                type="button"
                onClick={loadAnalytics}
                disabled={loadingAnalytics || !fromDate || !toDate}
                style={{
                  border: `1px solid ${C.green}66`,
                  background: "rgba(34,228,85,0.1)",
                  color: C.green,
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "8px 12px",
                  cursor: loadingAnalytics ? "default" : "pointer",
                  opacity: loadingAnalytics ? 0.65 : 1,
                }}
              >
                {loadingAnalytics ? "Loading..." : "Apply Range"}
              </button>
            </div>
          </div>

          {analytics ? (
            <>
              <div style={{ border: `1px solid ${C.border}`, borderRadius: 16, background: C.card, padding: 14 }}>
                <div style={{ color: C.textDim, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.3 }}>Revenue</div>
                <div style={{ fontSize: 24, fontWeight: 900, margin: "6px 0 8px" }}>{moneyPKR(analytics.revenueTotal)}</div>
                <div style={{ color: C.textDim, fontSize: 12 }}>
                  Completed revenue: <span style={{ color: C.green, fontWeight: 700 }}>{moneyPKR(analytics.revenueCompleted)}</span>
                  {" · "}
                  Avg booking value: <span style={{ color: C.text, fontWeight: 700 }}>{moneyPKR(analytics.avgBookingValue)}</span>
                </div>
              </div>

              <div style={{ border: `1px solid ${C.border}`, borderRadius: 16, background: C.card, padding: 14 }}>
                <div style={{ color: C.textDim, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.3 }}>Bookings</div>
                <div style={{ fontSize: 24, fontWeight: 900, margin: "6px 0 8px" }}>{analytics.totalBookings || 0}</div>
                <div style={{ color: C.textDim, fontSize: 12 }}>
                  Completed <span style={{ color: C.green, fontWeight: 700 }}>{analytics.completedBookings || 0}</span>
                  {" · "}
                  Confirmed <span style={{ color: C.orange, fontWeight: 700 }}>{analytics.confirmedBookings || 0}</span>
                  {" · "}
                  Cancelled <span style={{ color: C.red, fontWeight: 700 }}>{analytics.cancelledBookings || 0}</span>
                  {" · "}
                  Today <span style={{ color: C.text, fontWeight: 700 }}>{analytics.bookingsToday || 0}</span>
                </div>
              </div>

              <div style={{ border: `1px solid ${C.border}`, borderRadius: 16, background: C.card, padding: 14 }}>
                <div style={{ color: C.textDim, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.3 }}>Top Arena</div>
                <div style={{ fontSize: 18, fontWeight: 800, marginTop: 6 }}>{analytics.topArena?.name || "No revenue yet"}</div>
                <div style={{ color: C.green, fontSize: 13, fontWeight: 700, marginTop: 2 }}>{moneyPKR(analytics.topArena?.revenue || 0)}</div>
              </div>
            </>
          ) : (
            <div style={{ color: C.textDim, fontSize: 13 }}>{loadingAnalytics ? "Loading analytics..." : "No analytics data yet."}</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
