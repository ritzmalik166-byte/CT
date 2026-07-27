import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import { getConnectionConfig } from "./db-config.mjs";

async function main() {
  const schemaPath = path.join(process.cwd(), "database", "schema.sql");
  const schema = await fs.readFile(schemaPath, "utf8");
  const connection = await mysql.createConnection(
    getConnectionConfig({ multipleStatements: true }),
  );

  try {
    await connection.query(schema);
    console.log("Database schema applied successfully.");
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Failed to initialize database schema:");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
