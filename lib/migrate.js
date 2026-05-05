// Run this once to set up your database:
// node lib/migrate.js

import { initDb } from "./db.js";

async function main() {
  console.log("🗄️  Initializing database...");
  await initDb();
  console.log("✅ Database ready!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
