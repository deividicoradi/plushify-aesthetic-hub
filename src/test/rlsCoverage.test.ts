import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "fs";
import path from "path";

// Regression guard: every table ever created in supabase/migrations must
// have ENABLE ROW LEVEL SECURITY somewhere in the migration history (the
// ALTER TABLE may reference a different schema than public if the table
// was later moved, e.g. to `internal`, so we match on table name only).
const migrationsDir = path.resolve(__dirname, "../../supabase/migrations");
const migrationFiles = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));
const sql = migrationFiles
  .map((f) => readFileSync(path.join(migrationsDir, f), "utf8"))
  .join("\n");

const createTableRegex = /CREATE TABLE\s+(?:IF NOT EXISTS\s+)?public\.([a-z_0-9]+)/gi;
const createdTables = Array.from(
  new Set(Array.from(sql.matchAll(createTableRegex), (m) => m[1]))
);

const rlsEnableRegex = /ALTER TABLE\s+(?:IF EXISTS\s+)?[a-z_]+\.([a-z_0-9]+)\s+ENABLE ROW LEVEL SECURITY/gi;
const rlsEnabledTables = new Set(
  Array.from(sql.matchAll(rlsEnableRegex), (m) => m[1])
);

describe("Row Level Security coverage across migrations", () => {
  it("found tables to check (sanity check the regex still matches)", () => {
    expect(createdTables.length).toBeGreaterThan(10);
  });

  it.each(createdTables)("table %s has RLS enabled somewhere in migration history", (table) => {
    expect(
      rlsEnabledTables.has(table),
      `Table "${table}" is created in a migration but never has ENABLE ROW LEVEL SECURITY. ` +
        `If this is intentional (e.g. a pure lookup table with no sensitive data), ` +
        `add it to an allowlist instead of ignoring this failure.`
    ).toBe(true);
  });
});
