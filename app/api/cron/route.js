import { NextResponse } from "next/server";
import { getDueReminders, markSentAndReschedule } from "@/lib/db";
import { sendTelegramMessage, buildReminderMessage } from "@/lib/telegram";

export const maxDuration = 30; // seconds

export async function GET(request) {
  // Security: verify the cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dueReminders = await getDueReminders();

    if (dueReminders.length === 0) {
      return NextResponse.json({ fired: 0 });
    }

    const results = await Promise.allSettled(
      dueReminders.map(async (reminder) => {
        const message = buildReminderMessage(reminder);
        await sendTelegramMessage(message);
        await markSentAndReschedule(reminder);
        return reminder.id;
      })
    );

    const fired = results.filter((r) => r.status === "fulfilled").length;
    const failed = results
      .filter((r) => r.status === "rejected")
      .map((r) => r.reason?.message);

    console.log(`[CRON] Fired ${fired} reminders. Failures: ${failed.join(", ") || "none"}`);

    return NextResponse.json({ fired, failed });
  } catch (err) {
    console.error("[CRON] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
