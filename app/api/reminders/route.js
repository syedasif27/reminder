import { NextResponse } from "next/server";
import {
  initDb,
  getReminders,
  createReminder,
  deleteReminder,
} from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // One-time DB initialization
  if (searchParams.get("action") === "init") {
    try {
      await initDb();
      return NextResponse.json({ success: true, message: "Database initialized!" });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  try {
    const reminders = await getReminders();
    return NextResponse.json({ reminders });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, note, remindAt, repeatType } = body;

    if (!title || !remindAt) {
      return NextResponse.json(
        { error: "title and remindAt are required" },
        { status: 400 }
      );
    }

    const reminder = await createReminder({ title, note, remindAt, repeatType });
    return NextResponse.json({ reminder }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await deleteReminder(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
