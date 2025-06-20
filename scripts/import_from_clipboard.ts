import { Database } from "bun:sqlite";
import { $ } from "bun";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";

async function importFromClipboard() {
  const dbPath =
    process.env.DATABASE_PATH ||
    (process.env.NODE_ENV === "production"
      ? "/app/data/exercises.db"
      : "./data/exercises.db");

  // Ensure the data directory exists
  const dbDir = dirname(dbPath);
  if (!existsSync(dbDir)) {
    console.log(`📁 Creating data directory: ${dbDir}`);
    mkdirSync(dbDir, { recursive: true });
  }

  const db = new Database(dbPath, { create: true });

  try {
    // Get clipboard content (macOS)
    const clipboardContent = await $`pbpaste`.text();

    // Or for Linux: const clipboardContent = await $`xclip -o`.text();
    // Or for Windows: const clipboardContent = await $`powershell Get-Clipboard`.text();

    console.log("📋 Reading SQL from clipboard...");

    db.exec("BEGIN TRANSACTION");

    const statements = clipboardContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    for (const statement of statements) {
      db.exec(statement);
    }

    db.exec("COMMIT");
    console.log(`✅ Successfully imported ${statements.length} exercises`);
  } catch (error) {
    db.exec("ROLLBACK");
    console.error("❌ Import failed:", error);
  } finally {
    db.close();
  }
}

importFromClipboard();
