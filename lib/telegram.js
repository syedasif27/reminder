const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

/**
 * Send a message to your Telegram chat.
 */
export async function sendTelegramMessage(text) {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId || !process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error("Telegram env vars not configured");
  }

  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram API error: ${err}`);
  }

  return res.json();
}

/**
 * Build a nice reminder message.
 */
export function buildReminderMessage(reminder) {
  const lines = [
    `🔔 <b>Reminder!</b>`,
    ``,
    `📌 <b>${reminder.title}</b>`,
  ];

  if (reminder.note) {
    lines.push(`📝 ${reminder.note}`);
  }

  if (reminder.repeat_type !== "none") {
    const labels = {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      yearly: "Yearly",
    };
    lines.push(`🔄 Repeats: ${labels[reminder.repeat_type] || reminder.repeat_type}`);
  }

  lines.push(``, `⏰ <i>Your personal reminder app</i>`);

  return lines.join("\n");
}
