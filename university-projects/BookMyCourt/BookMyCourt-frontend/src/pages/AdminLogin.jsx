import { useState } from "react";
import { C } from "../theme.js";
import { Btn, Icon } from "../components/Ui.jsx";
import * as authApi from "../api/auth.js";
import logoImg from "../assets/logo.png";
import loginHero from "../assets/login-hero.jpg";

function AdminHero() {
  return (
    <div style={{ position: "relative", height: 220, flexShrink: 0, overflow: "hidden" }}>
      <img src={loginHero} alt="court" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(10,19,13,0.05) 0%,rgba(10,19,13,0.95) 100%)" }} />
      <div style={{ position: "absolute", top: 22, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <img src={logoImg} alt="logo" style={{ width: 36, height: 36, objectFit: "contain" }} />
        <span style={{ fontWeight: 800, fontSize: 17 }}>BookMyCourt Admin</span>
      </div>
    </div>
  );
}

export function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleAdminLogin = async () => {
    if (!email.trim()) {
      setLoginError("Please enter your email.");
      return;
    }
    if (!pass) {
      setLoginError("Please enter your password.");
      return;
    }
    setLoginLoading(true);
    setLoginError("");
    try {
      const session = await authApi.login({ email: email.trim(), password: pass });
      if (session?.user?.role !== "admin") {
        setLoginError("This account is not an admin account.");
        return;
      }
      onLogin(session);
    } catch (e) {
      if (e instanceof authApi.AuthApiError) setLoginError(e.message);
      else setLoginError("Something went wrong.");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
      <AdminHero />
      <div style={{ padding: `0 var(--page-pad-x) max(32px, env(safe-area-inset-bottom, 0px))` }}>
        <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 4, letterSpacing: -1 }}>Admin Sign In</h1>
        <p style={{ color: C.green, fontSize: 15, marginBottom: 24, fontWeight: 600 }}>Access BookMyCourt administration</p>

        {loginError && <div style={{ background: "rgba(232,64,64,0.08)", border: "1px solid rgba(232,64,64,0.3)", borderRadius: 14, padding: "10px 14px", marginBottom: 14, color: C.red, fontSize: 13, fontWeight: 600 }}>{loginError}</div>}

        <div style={{ fontSize: 13, color: C.textDim, marginBottom: 6 }}>Email Address</div>
        <input
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setLoginError("");
          }}
          placeholder="admin@example.com"
          style={{ width: "100%", padding: "14px 18px", borderRadius: 50, background: "#0f1f13", border: `1px solid ${C.border}`, color: C.text, fontSize: 14, marginBottom: 14, boxSizing: "border-box", outline: "none" }}
        />

        <div style={{ fontSize: 13, color: C.textDim, marginBottom: 6 }}>Password</div>
        <div style={{ position: "relative", marginBottom: 22 }}>
          <input
            type={show ? "text" : "password"}
            value={pass}
            onChange={(e) => {
              setPass(e.target.value);
              setLoginError("");
            }}
            placeholder="••••••••"
            style={{ width: "100%", padding: "14px 46px 14px 18px", borderRadius: 50, background: "#0f1f13", border: `1px solid ${C.border}`, color: C.text, fontSize: 14, boxSizing: "border-box", outline: "none" }}
          />
          <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
            <Icon n="eye" color={C.textMuted} size={18} />
          </button>
        </div>

        <Btn onClick={handleAdminLogin} disabled={loginLoading} style={{ marginBottom: 18 }}>
          {loginLoading ? "Signing in…" : "Sign In as Admin"}
        </Btn>

        <p style={{ textAlign: "center", color: C.textDim, fontSize: 12, margin: 0 }}>
          Not an admin?{" "}
          <a href="/login" style={{ color: C.green, fontWeight: 700 }}>
            Go to player login
          </a>
        </p>
      </div>
    </div>
  );
}
