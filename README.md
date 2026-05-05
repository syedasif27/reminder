# 🔔 RemindMe — Personal Reminder App

A personal reminder web app that sends **Telegram notifications** when your reminders are due. Built with Next.js, hosted on Vercel, backed by Vercel Postgres.

![Stack](https://img.shields.io/badge/Next.js-14-black) ![Database](https://img.shields.io/badge/Vercel-Postgres-blue) ![Notifications](https://img.shields.io/badge/Telegram-Bot-26A5E4)

---

## ✨ Features

- 📅 Set reminders for any date & time
- 📝 Add optional notes to reminders
- 🔄 Repeating reminders — daily, weekly, monthly, yearly
- 📱 Telegram notification delivered to your chat
- ✅ Automatic status tracking (upcoming / sent)
- 🌐 Hosted on Vercel, runs 24/7 for free

---

## 🚀 Setup Guide

### Step 1 — Create Your Telegram Bot

1. Open Telegram, search for **@BotFather**
2. Send `/newbot` and follow the prompts
3. Copy your **Bot Token** (looks like `123456:ABCdef...`)
4. Start a chat with your new bot (send it `/start`)
5. Get your **Chat ID**: Visit this URL in your browser (replace `YOUR_TOKEN`):
   ```
   https://api.telegram.org/botYOUR_TOKEN/getUpdates
   ```
   Look for `"chat":{"id":XXXXXXXX}` in the response — that's your Chat ID.

---

### Step 2 — Deploy to Vercel

#### Option A: One-click (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push this repo to GitHub
2. Import it on [vercel.com/new](https://vercel.com/new)
3. Vercel will auto-detect Next.js

#### Option B: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

---

### Step 3 — Add Vercel Postgres

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Storage** tab → **Create Database** → **Postgres**
3. Connect it to your project
4. Vercel auto-adds all `POSTGRES_*` env vars ✅

---

### Step 4 — Set Environment Variables

In your Vercel project → **Settings** → **Environment Variables**, add:

| Variable | Value |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Your bot token from BotFather |
| `TELEGRAM_CHAT_ID` | Your Telegram chat ID |
| `CRON_SECRET` | Any random string (e.g. `openssl rand -hex 16`) |
| `USER_TIMEZONE` | Your timezone (e.g. `Asia/Kolkata`) |

---

### Step 5 — Initialize the Database

After deploying, visit this URL once to create the table:

```
https://your-app.vercel.app/api/reminders?action=init
```

You should see: `{"success":true,"message":"Database initialized!"}`

---

### Step 6 — Test Telegram

Visit this to send a test message:

```
https://your-app.vercel.app/api/test-telegram
```

You should receive a Telegram message. 🎉

---

### Step 7 — Verify Cron is Running

In Vercel Dashboard → **Cron Jobs** tab, you'll see the cron running every minute.

> **Note**: Cron jobs require a [Vercel Hobby plan or above](https://vercel.com/docs/cron-jobs) (free tier supports 1 cron).

---

## 🗂️ Project Structure

```
reminder-app/
├── app/
│   ├── page.js              # Main UI
│   ├── layout.js            # Root layout
│   ├── globals.css          # Styles
│   └── api/
│       ├── reminders/       # CRUD API for reminders
│       │   └── route.js
│       ├── cron/            # Cron job — checks & fires reminders
│       │   └── route.js
│       └── test-telegram/   # One-time Telegram test
│           └── route.js
├── lib/
│   ├── db.js                # Database helpers (Vercel Postgres)
│   ├── telegram.js          # Telegram Bot API helpers
│   └── migrate.js           # DB migration script
├── vercel.json              # Cron schedule config
└── .env.example             # Environment variable template
```

---

## 🔧 Local Development

```bash
# 1. Clone your repo
git clone https://github.com/yourusername/reminder-app
cd reminder-app

# 2. Install dependencies
npm install

# 3. Link to Vercel (pulls env vars)
npx vercel link
npx vercel env pull .env.local

# 4. Run dev server
npm run dev
```

Visit `http://localhost:3000`

> For local cron testing, manually call: `GET /api/cron` with `Authorization: Bearer YOUR_CRON_SECRET`

---

## 📐 How It Works

```
User sets reminder → saved to Postgres
       ↓
Vercel Cron (every minute)
       ↓
Query: find reminders where remind_at <= NOW() and not sent
       ↓
Send Telegram message → mark as sent
       ↓
If repeating → insert next occurrence
```

---

## 🌍 Timezone Notes

Reminder times are stored in UTC in the database. The app converts your local browser time automatically when creating reminders. Your `USER_TIMEZONE` env var is used for cron-side display in logs.

---

## 📄 License

MIT — use freely, modify, make it yours.
