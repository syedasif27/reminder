import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";

export async function GET() {
  try {
    await sendTelegramMessage(
      "✅ <b>Reminder App connected!</b>\n\nYour Telegram bot is working perfectly. You'll receive your reminders here."
    );
    return NextResponse.json({ success: true, message: "Test message sent to Telegram!" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
