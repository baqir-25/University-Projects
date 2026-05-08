import { useState } from "react";
import logoImg from "../assets/logo.png";
import { C } from "../theme.js";
import { Btn, Icon } from "../components/Ui.jsx";
import { HelpScreen } from "../components/Help.jsx";

function ProfileMenuRow({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 14px",
        borderRadius: 14,
        border: `1px solid ${C.border}`,
        background: C.card,
        cursor: "pointer",
        marginBottom: 10,
        color: C.text,
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1a2e1f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon n={icon} color={C.green} size={18} />
      </div>
      <div style={{ flex: 1, textAlign: "left", fontWeight: 700, fontSize: 14 }}>{label}</div>
      <Icon n="arr" color={C.textMuted} size={18} />
    </button>
  );
}

export function Profile({ onLogout, user }) {
  const [screen, setScreen] = useState("main");

  if (screen === "help") return <HelpScreen onBack={() => setScreen("main")} />;

  if (screen === "edit") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg }}>
        <div style={{ padding: `16px var(--page-pad-x)`, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={() => setScreen("main")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <Icon n="back" color={C.text} size={22} />
          </button>
          <span style={{ fontWeight: 900, fontSize: 17 }}>Edit profile</span>
        </div>
        <div style={{ flex: 1, padding: `20px var(--page-pad-x)`, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 18 }}>
            <div style={{ width: 76, height: 76, borderRadius: "50%", background: "#1a2e1f", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 28 }}>
              {(user?.name || "P").slice(0, 1)}
            </div>
            <button type="button" style={{ marginTop: 10, background: "none", border: "none", color: C.green, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
              Change photo
            </button>
          </div>
          {["Full name", "Email", "Phone"].map((lb) => (
            <div key={lb} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>{lb}</div>
              <input
                defaultValue={lb === "Full name" ? user?.name : lb === "Email" ? user?.email : "+1 (555) 000-0000"}
                style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", borderRadius: 14, border: `1px solid ${C.border}`, background: "#0f1f13", color: C.text, outline: "none" }}
              />
            </div>
          ))}
          <Btn onClick={() => setScreen("main")}>Save changes</Btn>
        </div>
      </div>
    );
  }

  if (screen === "notifs") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg }}>
        <div style={{ padding: `16px var(--page-pad-x)`, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={() => setScreen("main")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <Icon n="back" color={C.text} size={22} />
          </button>
          <span style={{ fontWeight: 900, fontSize: 17 }}>Notifications</span>
        </div>
        <div style={{ flex: 1, padding: `var(--page-pad-x)`, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
          {[
            ["Booking reminders", true],
            ["Deals & offers", true],
            ["Events near you", false],
          ].map(([t, on]) => (
            <div key={t} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{t}</span>
              <span style={{ width: 44, height: 26, borderRadius: 20, background: on ? C.green : "#1a2e1f", position: "relative" }}>
                <span style={{ position: "absolute", top: 3, left: on ? 22 : 4, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screen === "payment") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg }}>
        <div style={{ padding: `16px var(--page-pad-x)`, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={() => setScreen("main")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <Icon n="back" color={C.text} size={22} />
          </button>
          <span style={{ fontWeight: 900, fontSize: 17 }}>Payment methods</span>
        </div>
        <div style={{ flex: 1, padding: `var(--page-pad-x)`, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ padding: 16, borderRadius: 16, border: `1px solid ${C.border}`, background: C.card, marginBottom: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 4 }}>Visa ···· 4242</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>Default</div>
          </div>
          <button type="button" style={{ width: "100%", padding: 14, borderRadius: 14, border: `1px dashed ${C.border}`, background: "none", color: C.green, fontWeight: 700, cursor: "pointer" }}>
            + Add card
          </button>
        </div>
      </div>
    );
  }

  const staticPage = (title, body) => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg }}>
      <div style={{ padding: `16px var(--page-pad-x)`, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <button type="button" onClick={() => setScreen("main")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <Icon n="back" color={C.text} size={22} />
        </button>
        <span style={{ fontWeight: 900, fontSize: 17 }}>{title}</span>
      </div>
      <div style={{ flex: 1, padding: `16px var(--page-pad-x) 20px`, overflowY: "auto", WebkitOverflowScrolling: "touch", color: C.textDim, fontSize: 13, lineHeight: 1.6 }}>{body}</div>
    </div>
  );

  if (screen === "privacy")
    return staticPage(
      "Privacy",
      "BookMyCourt collects account data and booking history to operate the service. Location is used to show nearby arenas. You can request data export or deletion from support. Push and email notifications can be disabled in settings."
    );

  if (screen === "terms")
    return staticPage(
      "Terms",
      "By using BookMyCourt you agree to venue-specific rules, cancellation windows, and acceptable use. BookMyCourt is a marketplace; disputes on-court are between players and venues. We may update these terms with in-app notice."
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
      <div style={{ padding: `24px var(--page-pad-x)`, borderBottom: `1px solid ${C.border}`, background: "linear-gradient(180deg, #0f1f13 0%, #0a130d 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src={logoImg} alt="" style={{ width: 48, height: 48, objectFit: "contain" }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>{user?.name || "Player"}</div>
            <div style={{ fontSize: 13, color: C.textMuted }}>{user?.email || "player@bookmycourt.com"}</div>
            <div style={{ marginTop: 6, fontSize: 11, color: C.green, fontWeight: 700 }}>{(user?.role || "player").toUpperCase()}</div>
          </div>
        </div>
      </div>
      <div style={{ padding: `16px var(--page-pad-x) 24px` }}>
        <ProfileMenuRow icon="user" label="Edit profile" onClick={() => setScreen("edit")} />
        <ProfileMenuRow icon="bell" label="Notifications" onClick={() => setScreen("notifs")} />
        <ProfileMenuRow icon="ticket" label="Payment methods" onClick={() => setScreen("payment")} />
        <ProfileMenuRow icon="compass" label="Help & support" onClick={() => setScreen("help")} />
        <ProfileMenuRow icon="grid" label="Privacy policy" onClick={() => setScreen("privacy")} />
        <ProfileMenuRow icon="cog" label="Terms of service" onClick={() => setScreen("terms")} />
        <button
          type="button"
          onClick={onLogout}
          style={{
            width: "100%",
            marginTop: 12,
            padding: 14,
            borderRadius: 50,
            border: `1px solid ${C.red}`,
            background: "rgba(232,64,64,0.06)",
            color: C.red,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}
