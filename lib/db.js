import { sql } from "@vercel/postgres";

export { sql };

/**
 * Initialize the database table if it doesn't exist.
 * Call this once via: GET /api/reminders?action=init
 */
export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS reminders (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      note TEXT,
      remind_at TIMESTAMPTZ NOT NULL,
      repeat_type TEXT NOT NULL DEFAULT 'none',
      -- none | daily | weekly | monthly | yearly
      is_sent BOOLEAN NOT NULL DEFAULT FALSE,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_reminders_remind_at
    ON reminders (remind_at)
    WHERE is_sent = FALSE AND is_active = TRUE;
  `;
}

/**
 * Fetch all active reminders ordered by next remind time.
 */
export async function getReminders() {
  const { rows } = await sql`
    SELECT * FROM reminders
    WHERE is_active = TRUE
    ORDER BY remind_at ASC;
  `;
  return rows;
}

/**
 * Create a new reminder.
 */
export async function createReminder({ title, note, remindAt, repeatType = "none" }) {
  const { rows } = await sql`
    INSERT INTO reminders (title, note, remind_at, repeat_type)
    VALUES (${title}, ${note || null}, ${remindAt}, ${repeatType})
    RETURNING *;
  `;
  return rows[0];
}

/**
 * Delete a reminder by id.
 */
export async function deleteReminder(id) {
  await sql`
    UPDATE reminders SET is_active = FALSE, updated_at = NOW()
    WHERE id = ${id};
  `;
}

/**
 * Get reminders that are due now (within a 1-minute window) and not yet sent.
 */
export async function getDueReminders() {
  const { rows } = await sql`
    SELECT * FROM reminders
    WHERE is_active = TRUE
      AND is_sent = FALSE
      AND remind_at <= NOW()
      AND remind_at > NOW() - INTERVAL '2 minutes';
  `;
  return rows;
}

/**
 * Mark a reminder as sent. If it repeats, schedule the next occurrence.
 */
export async function markSentAndReschedule(reminder) {
  await sql`
    UPDATE reminders SET is_sent = TRUE, updated_at = NOW()
    WHERE id = ${reminder.id};
  `;

  if (reminder.repeat_type === "none") return;

  // Calculate next occurrence
  const next = new Date(reminder.remind_at);
  switch (reminder.repeat_type) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      return;
  }

  await sql`
    INSERT INTO reminders (title, note, remind_at, repeat_type, is_sent, is_active)
    VALUES (
      ${reminder.title},
      ${reminder.note},
      ${next.toISOString()},
      ${reminder.repeat_type},
      FALSE,
      TRUE
    );
  `;
}
