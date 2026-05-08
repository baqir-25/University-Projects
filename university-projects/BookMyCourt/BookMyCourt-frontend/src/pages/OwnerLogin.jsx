import { useState } from "react";
import { C } from "../theme.js";
import { Btn, Icon } from "../components/Ui.jsx";
import * as authApi from "../api/auth.js";
import logoImg from "../assets/logo.png";
import loginHero from "../assets/login-hero.jpg";

function OwnerHero() {
  return (
    <div style={{ position: "relative", height: 220, flexShrink: 0, overflow: "hidden" }}>
      <img src={loginHero} alt="court" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(10,19,13,0.05) 0%,rgba(10,19,13,0.95) 100%)" }} />
      <div style={{ position: "absolute", top: 22, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <img src={logoImg} alt="logo" style={{ width: 36, height: 36, objectFit: "contain" }} />
        <span style={{ fontWeight: 800, fontSize: 17 }}>BookMyCourt Owner</span>
      </div>
    </div>
  );
}

export function OwnerLogin({ onLogin }) {
  const [screen, setScreen] = useState("login");

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPass, setSuPass] = useState("");
  const [suConfirm, setSuConfirm] = useState("");
  const [showSu, setShowSu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [suError, setSuError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  const handleOwnerLogin = async () => {
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
      if (session?.user?.role !== "owner") {
        setLoginError("This account is not an owner account. Use player login instead.");
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

  const handleOwnerSignUp = async () => {
    if (!suName.trim()) {
      setSuError("Please enter your name.");
      return;
    }
    if (!suEmail.trim()) {
      setSuError("Please enter your email.");
      return;
    }
    if (suPass.length < 6) {
      setSuError("Password must be at least 6 characters.");
      return;
    }
    if (suPass !== suConfirm) {
      setSuError("Passwords do not match.");
      return;
    }
    setSignupLoading(true);
    setSuError("");
    try {
      const session = await authApi.register({
        name: suName.trim(),
        email: suEmail.trim(),
        password: suPass,
        role: "owner",
      });
      if (session?.user?.role !== "owner") {
        setSuError("Owner sign-up is not enabled on this server yet.");
        return;
      }
      onLogin(session);
    } catch (e) {
      if (e instanceof authApi.AuthApiError) setSuError(e.message);
      else setSuError("Something went wrong.");
    } finally {
      setSignupLoading(false);
    }
  };

  if (screen === "signup") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <OwnerHero />
        <div style={{ padding: `0 var(--page-pad-x) max(32px, env(safe-area-inset-bottom, 0px))` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, marginTop: 4 }}>
            <button type="button" onClick={() => { setScreen("login"); setSuError(""); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <Icon n="back" color={C.textMuted} size={20} />
            </button>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: -1 }}>Create Owner Account</h1>
          </div>
          <p style={{ color: C.green, fontSize: 14, marginBottom: 20, fontWeight: 600, marginLeft: 30 }}>Set up your venue and start managing bookings</p>

          {suError && <div style={{ background: "rgba(232,64,64,0.08)", border: "1px solid rgba(232,64,64,0.3)", borderRadius: 14, padding: "10px 14px", marginBottom: 14, color: C.red, fontSize: 13, fontWeight: 600 }}>{suError}</div>}

          <div style={{ fontSize: 13, color: C.textDim, marginBottom: 6 }}>Full Name</div>
          <input value={suName} onChange={(e) => setSuName(e.target.value)} placeholder="Owner name" type="text" style={{ width: "100%", padding: "14px 18px", borderRadius: 50, background: "#0f1f13", border: `1px solid ${C.border}`, color: C.text, fontSize: 14, marginBottom: 14, boxSizing: "border-box", outline: "none" }} />

          <div style={{ fontSize: 13, color: C.textDim, marginBottom: 6 }}>Email Address</div>
          <input value={suEmail} onChange={(e) => setSuEmail(e.target.value)} placeholder="owner@example.com" type="email" style={{ width: "100%", padding: "14px 18px", borderRadius: 50, background: "#0f1f13", border: `1px solid ${C.border}`, color: C.text, fontSize: 14, marginBottom: 14, boxSizing: "border-box", outline: "none" }} />

          <div style={{ fontSize: 13, color: C.textDim, marginBottom: 6 }}>Password</div>
          <div style={{ position: "relative", marginBottom: 14 }}>
            <input type={showSu ? "text" : "password"} value={suPass} onChange={(e) => setSuPass(e.target.value)} placeholder="Min. 6 characters" style={{ width: "100%", padding: "14px 46px 14px 18px", borderRadius: 50, background: "#0f1f13", border: `1px solid ${C.border}`, color: C.text, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
            <button type="button" onClick={() => setShowSu(!showSu)} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
              <Icon n="eye" color={C.textMuted} size={18} />
            </button>
          </div>

          <div style={{ fontSize: 13, color: C.textDim, marginBottom: 6 }}>Confirm Password</div>
          <div style={{ position: "relative", marginBottom: 4 }}>
            <input
              type={showConfirm ? "text" : "password"}
              value={suConfirm}
              onChange={(e) => setSuConfirm(e.target.value)}
              placeholder="Re-enter password"
              style={{
                width: "100%",
                padding: "14px 46px 14px 18px",
                borderRadius: 50,
                background: "#0f1f13",
                border: `1px solid ${suConfirm && suConfirm !== suPass ? "rgba(232,64,64,0.5)" : suConfirm && suConfirm === suPass ? `${C.green}66` : C.border}`,
                color: C.text,
                fontSize: 14,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
              <Icon n="eye" color={C.textMuted} size={18} />
            </button>
          </div>
          <div style={{ minHeight: 22, marginBottom: 14, paddingLeft: 4 }}>
            {suConfirm.length > 0 && (
              <span style={{ fontSize: 11, color: suConfirm === suPass ? C.green : C.red, fontWeight: 600 }}>{suConfirm === suPass ? "✓ Passwords match" : "✗ Passwords do not match"}</span>
            )}
          </div>

          <Btn onClick={handleOwnerSignUp} disabled={signupLoading} style={{ marginBottom: 18 }}>
            {signupLoading ? "Creating owner account…" : "Create Owner Account"}
          </Btn>
          <p style={{ textAlign: "center", color: C.textDim, fontSize: 13, margin: 0 }}>
            Already have an owner account?{" "}
            <span role="button" tabIndex={0} style={{ color: C.green, fontWeight: 700, cursor: "pointer" }} onClick={() => { setScreen("login"); setSuError(""); }}>
              Sign In
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
      <OwnerHero />
      <div style={{ padding: `0 var(--page-pad-x) max(32px, env(safe-area-inset-bottom, 0px))` }}>
        <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 4, letterSpacing: -1 }}>Owner Sign In</h1>
        <p style={{ color: C.green, fontSize: 15, marginBottom: 24, fontWeight: 600 }}>Manage your arenas, courts, and bookings</p>

        {loginError && <div style={{ background: "rgba(232,64,64,0.08)", border: "1px solid rgba(232,64,64,0.3)", borderRadius: 14, padding: "10px 14px", marginBottom: 14, color: C.red, fontSize: 13, fontWeight: 600 }}>{loginError}</div>}

        <div style={{ fontSize: 13, color: C.textDim, marginBottom: 6 }}>Email Address</div>
        <input
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setLoginError("");
          }}
          placeholder="owner@example.com"
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

        <Btn onClick={handleOwnerLogin} disabled={loginLoading} style={{ marginBottom: 18 }}>
          {loginLoading ? "Signing in…" : "Sign In as Owner"}
        </Btn>

        <p style={{ textAlign: "center", color: C.textDim, fontSize: 13, marginBottom: 10 }}>
          Need an owner account?{" "}
          <span role="button" tabIndex={0} style={{ color: C.green, fontWeight: 700, cursor: "pointer" }} onClick={() => setScreen("signup")}>
            Sign Up
          </span>
        </p>
        <p style={{ textAlign: "center", color: C.textDim, fontSize: 12, margin: 0 }}>
          Player account?{" "}
          <a href="/login" style={{ color: C.green, fontWeight: 700 }}>
            Go to player login
          </a>
        </p>
      </div>
    </div>
  );
}
