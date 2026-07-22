import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import { getConnectionConfig } from "./db-config.mjs";

async function main() {
  const migrationPath = path.join(process.cwd(), "database", "migrate-v4.sql");
  const migration = await fs.readFile(migrationPath, "utf8");
  const connection = await mysql.createConnection(
    getConnectionConfig({ multipleStatements: true }),
  );

  try {
    await connection.query(migration);
    console.log("Migration v4 applied successfully.");
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Failed to apply migration v4:");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
