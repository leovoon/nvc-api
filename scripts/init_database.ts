import { Database } from "bun:sqlite";
import { readFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";

const DB_PATH =
  process.env.DATABASE_PATH ||
  (process.env.NODE_ENV === "production"
    ? "/app/data/exercises.db"
    : "./data/exercises.db");
const SEED_SQL_PATH = "seed.sql";

function initializeDatabase() {
  try {
    // Ensure the data directory exists
    const dbDir = dirname(DB_PATH);
    if (!existsSync(dbDir)) {
      console.log(`📁 Creating data directory: ${dbDir}`);
      mkdirSync(dbDir, { recursive: true });
    }

    console.log(`🗄️  Initializing database at: ${DB_PATH}`);

    // Create database connection
    const db = new Database(DB_PATH, { create: true });

    // Check if database is already populated
    const tables = db
      .query("SELECT name FROM sqlite_master WHERE type='table'")
      .all();
    const hasExercisesTable = tables.some(
      (table: any) => table.name === "exercises",
    );

    if (hasExercisesTable) {
      const count = db
        .query("SELECT COUNT(*) as count FROM exercises")
        .get() as { count: number };
      if (count.count > 0) {
        console.log(
          `✅ Database already initialized with ${count.count} exercises`,
        );
        db.close();
        return;
      }
    }

    // Read and execute seed SQL
    if (!existsSync(SEED_SQL_PATH)) {
      console.error(`❌ Seed file not found: ${SEED_SQL_PATH}`);
      process.exit(1);
    }

    console.log(`📋 Loading seed data from: ${SEED_SQL_PATH}`);
    const sql = readFileSync(SEED_SQL_PATH, "utf8");

    // Execute the SQL
    db.exec(sql);

    // Verify the import
    const exerciseCount = db
      .query("SELECT COUNT(*) as count FROM exercises")
      .get() as { count: number };
    console.log(
      `✅ Database initialized successfully with ${exerciseCount.count} exercises`,
    );

    db.close();
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (import.meta.main) {
  initializeDatabase();
}

export { initializeDatabase, DB_PATH };
