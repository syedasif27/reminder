"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <span className="login-logo-icon">🔔</span>
        </div>

        <h1 className="login-title">RemindMe</h1>
        <p className="login-subtitle">Sign in to your reminder dashboard</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter username"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              required
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="show-pass-btn"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading || !form.username || !form.password}
          >
            {loading ? <span className="spinner" /> : "🔐"}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>

      <style>{`
        .login-bg {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          z-index: 1;
        }

        .login-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 40px 36px;
          width: 100%;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 24px 80px rgba(0,0,0,0.4);
          animation: fadeUp 0.4s ease;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .login-logo {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: var(--accent-glow);
          border: 1px solid rgba(124,106,247,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin: 0 auto 20px;
        }

        .login-title {
          font-size: 1.6rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #e8e8f5 30%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }

        .login-subtitle {
          color: var(--text-muted);
          font-size: 0.88rem;
          margin-bottom: 32px;
        }

        .login-form {
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .password-wrapper {
          position: relative;
        }

        .password-wrapper input {
          padding-right: 44px;
        }

        .show-pass-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
          padding: 4px;
          opacity: 0.6;
          transition: opacity 0.15s;
        }

        .show-pass-btn:hover { opacity: 1; }

        .login-error {
          background: var(--red-dim);
          border: 1px solid rgba(255, 92, 122, 0.3);
          border-radius: var(--radius);
          color: var(--red);
          font-size: 0.84rem;
          padding: 10px 14px;
          text-align: center;
          animation: shake 0.3s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
