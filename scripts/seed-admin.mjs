import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { getConnectionConfig } from "./db-config.mjs";

async function main() {
  const name = process.env.ADMIN_NAME ?? "Admin";
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local before seeding.",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const connection = await mysql.createConnection(getConnectionConfig());

  try {
    const [existing] = await connection.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email],
    );

    if (Array.isArray(existing) && existing.length > 0) {
      console.log(`Admin user already exists for ${email}. Skipping seed.`);
      return;
    }

    await connection.query(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES (?, ?, ?, 'superadmin', TRUE)`,
      [name, email, passwordHash],
    );

    const [rows] = await connection.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email],
    );

    const userId = rows[0]?.id;

    if (userId) {
      await connection.query(
        `INSERT INTO user_permissions (user_id, can_manage_blogs, can_manage_assets)
         VALUES (?, TRUE, TRUE)`,
        [userId],
      );
    }

    console.log(`Superadmin user created: ${email}`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Failed to seed admin user:");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
