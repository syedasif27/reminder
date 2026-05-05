import { NextResponse } from "next/server";

// POST /api/auth  → login
// DELETE /api/auth → logout

export async function POST(request) {
  const { username, password } = await request.json();

  const validUser = process.env.APP_USERNAME;
  const validPass = process.env.APP_PASSWORD;

  if (!validUser || !validPass) {
    return NextResponse.json(
      { error: "Auth not configured. Set APP_USERNAME and APP_PASSWORD env vars." },
      { status: 500 }
    );
  }

  if (username !== validUser || password !== validPass) {
    // Artificial delay to slow brute force
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("session", process.env.SESSION_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("session", "", { maxAge: 0, path: "/" });
  return response;
}
