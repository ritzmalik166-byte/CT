import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import { getConnectionConfig } from "./db-config.mjs";

const statements = [
  "ALTER TABLE blogs ADD COLUMN blog_keywords VARCHAR(500) NULL AFTER excerpt",
  "ALTER TABLE blogs ADD COLUMN blog_meta_description TEXT NULL AFTER blog_keywords",
  "ALTER TABLE blogs ADD COLUMN author_name VARCHAR(150) NULL AFTER cover_image",
  "ALTER TABLE blogs ADD COLUMN scheduled_publish_at TIMESTAMP NULL DEFAULT NULL AFTER published_at",
  "ALTER TABLE blogs MODIFY status ENUM('draft', 'published', 'scheduled', 'inactive') NOT NULL DEFAULT 'draft'",
  "UPDATE blogs SET blog_meta_description = excerpt WHERE blog_meta_description IS NULL AND excerpt IS NOT NULL",
];

async function main() {
  const migrationPath = path.join(process.cwd(), "database", "migrate-v3.sql");
  const migration = await fs.readFile(migrationPath, "utf8");
  const connection = await mysql.createConnection(
    getConnectionConfig({ multipleStatements: true }),
  );

  try {
    for (const sql of statements) {
      try {
        await connection.query(sql);
        console.log(`OK: ${sql.slice(0, 60)}...`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes("Duplicate column")) {
          console.log(`Skip (already applied): ${sql.slice(0, 50)}...`);
        } else {
          throw error;
        }
      }
    }

    console.log("Migration v3 applied successfully.");
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Failed to apply migration v3:");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
