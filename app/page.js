"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format, isPast, isToday, isTomorrow, parseISO } from "date-fns";

const REPEAT_LABELS = {
  none: "No repeat",
  daily: "🔄 Daily",
  weekly: "🔄 Weekly",
  monthly: "🔄 Monthly",
  yearly: "🔄 Yearly",
};

function formatReminderDate(isoString) {
  const d = new Date(isoString);
  if (isToday(d)) return `Today at ${format(d, "h:mm a")}`;
  if (isTomorrow(d)) return `Tomorrow at ${format(d, "h:mm a")}`;
  return format(d, "MMM d, yyyy · h:mm a");
}

function toLocalDatetimeInput(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getDefaultDatetime() {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return toLocalDatetimeInput(d);
}

export default function Home() {
  const router = useRouter();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [form, setForm] = useState({
    title: "",
    note: "",
    remindAt: getDefaultDatetime(),
    repeatType: "none",
  });

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const fetchReminders = useCallback(async () => {
    try {
      const res = await fetch("/api/reminders");
      const data = await res.json();
      if (data.reminders) setReminders(data.reminders);
    } catch {
      addToast("Failed to load reminders", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchReminders();
    // Refresh every 30s so sent status updates
    const interval = setInterval(fetchReminders, 30000);
    return () => clearInterval(interval);
  }, [fetchReminders]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.remindAt) return;

    setSubmitting(true);
    try {
      // Convert local datetime to UTC ISO string
      const localDate = new Date(form.remindAt);
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          note: form.note.trim() || null,
          remindAt: localDate.toISOString(),
          repeatType: form.repeatType,
        }),
      });

      if (!res.ok) throw new Error((await res.json()).error);

      addToast("✅ Reminder set! You'll get a Telegram message.");
      setForm({ title: "", note: "", remindAt: getDefaultDatetime(), repeatType: "none" });
      await fetchReminders();
    } catch (err) {
      addToast(err.message || "Failed to create reminder", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setReminders((r) => r.filter((x) => x.id !== id));
    try {
      await fetch(`/api/reminders?id=${id}`, { method: "DELETE" });
      addToast("Reminder deleted.");
    } catch {
      addToast("Failed to delete", "error");
      fetchReminders();
    }
  };

  const upcoming = reminders.filter((r) => !r.is_sent && r.is_active);
  const sent = reminders.filter((r) => r.is_sent);
  const totalRepeat = reminders.filter((r) => r.repeat_type !== "none" && r.is_active).length;

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  };

  return (
    <>
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="header-top">
            <div className="header-badge">
              <span>🔔</span> Personal Reminder
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Sign out">
              Sign out →
            </button>
          </div>
          <h1>RemindMe</h1>
          <p>Set it. Forget it. Get notified on Telegram.</p>
        </header>

        {/* Stats */}
        <div className="stats">
          <div className="stat">
            <div className="stat-value">{upcoming.length}</div>
            <div className="stat-label">Upcoming</div>
          </div>
          <div className="stat">
            <div className="stat-value">{sent.length}</div>
            <div className="stat-label">Sent</div>
          </div>
          <div className="stat">
            <div className="stat-value">{totalRepeat}</div>
            <div className="stat-label">Recurring</div>
          </div>
        </div>

        {/* Add Reminder */}
        <div className="card">
          <div className="card-title">✦ New Reminder</div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group full">
                <label htmlFor="title">Title *</label>
                <input
                  id="title"
                  type="text"
                  placeholder="e.g. Take medication, Team standup..."
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                  maxLength={120}
                />
              </div>

              <div className="form-group full">
                <label htmlFor="note">Note (optional)</label>
                <textarea
                  id="note"
                  placeholder="Any extra details..."
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  maxLength={500}
                />
              </div>

              <div className="form-group">
                <label htmlFor="remindAt">Date & Time *</label>
                <input
                  id="remindAt"
                  type="datetime-local"
                  value={form.remindAt}
                  onChange={(e) => setForm((f) => ({ ...f, remindAt: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="repeatType">Repeat</label>
                <select
                  id="repeatType"
                  value={form.repeatType}
                  onChange={(e) => setForm((f) => ({ ...f, repeatType: e.target.value }))}
                >
                  <option value="none">No repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={submitting || !form.title.trim()}
            >
              {submitting ? <span className="spinner" /> : "🔔"}
              {submitting ? "Saving..." : "Set Reminder"}
            </button>
          </form>
        </div>

        {/* Upcoming Reminders */}
        <div className="card">
          <div className="card-title">⏰ Upcoming ({upcoming.length})</div>

          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3, margin: "0 auto" }} />
            </div>
          ) : upcoming.length === 0 ? (
            <div className="empty-state">
              <div className="emoji">🎉</div>
              <h3>All clear!</h3>
              <p>No upcoming reminders. Add one above.</p>
            </div>
          ) : (
            <div className="reminder-list">
              {upcoming.map((r) => (
                <ReminderItem key={r.id} reminder={r} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>

        {/* Sent Reminders */}
        {sent.length > 0 && (
          <div className="card">
            <div className="card-title">✓ Sent ({sent.length})</div>
            <div className="reminder-list">
              {sent.slice(0, 10).map((r) => (
                <ReminderItem key={r.id} reminder={r} onDelete={handleDelete} dimmed />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="footer">
          <p>
            Built with Next.js · Hosted on{" "}
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">Vercel</a>
            {" · "}Notifications via Telegram
          </p>
        </footer>
      </div>

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}

function ReminderItem({ reminder, onDelete, dimmed }) {
  const isSent = reminder.is_sent;
  const isOverdue = !isSent && isPast(new Date(reminder.remind_at));

  return (
    <div className="reminder-item" style={{ opacity: dimmed ? 0.6 : 1 }}>
      <div className={`reminder-icon ${isSent ? "sent" : ""}`}>
        {isSent ? "✓" : isOverdue ? "⚡" : "🔔"}
      </div>
      <div className="reminder-body">
        <div className="reminder-title">{reminder.title}</div>
        {reminder.note && <div className="reminder-note">{reminder.note}</div>}
        <div className="reminder-meta">
          <span className="reminder-time">{formatReminderDate(reminder.remind_at)}</span>
          {reminder.repeat_type !== "none" && (
            <span className="tag tag-repeat">{REPEAT_LABELS[reminder.repeat_type]}</span>
          )}
          {isSent && <span className="tag tag-sent">Sent ✓</span>}
          {!isSent && !isOverdue && <span className="tag tag-upcoming">Upcoming</span>}
        </div>
      </div>
      <button
        className="delete-btn"
        onClick={() => onDelete(reminder.id)}
        title="Delete reminder"
      >
        ✕
      </button>
    </div>
  );
}
