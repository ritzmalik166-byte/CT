import fs from "node:fs";
import type { PoolOptions, SslOptions } from "mysql2/promise";

function databaseUrlRequiresSsl(url: string): boolean {
  return url.includes("ssl-mode=REQUIRED");
}

export function cleanDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.search = "";
    return parsed.toString();
  } catch {
    return url.split("?")[0] ?? url;
  }
}

function readCaCert(): string | undefined {
  const caPath = process.env.DB_SSL_CA_PATH;

  if (!caPath) {
    return undefined;
  }

  return fs.readFileSync(caPath, "utf8");
}

export function getSslConfig(): SslOptions | undefined {
  const sslEnabled =
    process.env.DB_SSL === "true" ||
    (process.env.DATABASE_URL
      ? databaseUrlRequiresSsl(process.env.DATABASE_URL)
      : false);

  if (!sslEnabled) {
    return undefined;
  }

  const ca = readCaCert();

  if (ca) {
    return {
      ca,
      rejectUnauthorized: true,
    };
  }

  // Aiven MySQL requires SSL but Node needs Aiven's CA file for strict verification.
  // Without ca.pem, use relaxed verification for local dev unless explicitly strict.
  return {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === "true",
  };
}

export function getMysqlConnectionConfig(): PoolOptions & {
  multipleStatements?: boolean;
} {
  if (process.env.DATABASE_URL) {
    return {
      uri: cleanDatabaseUrl(process.env.DATABASE_URL),
      ssl: getSslConfig(),
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60_000,
      enableKeepAlive: true,
    };
  }

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (!host || !user || !password || !database) {
    throw new Error(
      "Database is not configured. Set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in .env.local.",
    );
  }

  return {
    host,
    port: Number(process.env.DB_PORT ?? 3306),
    user,
    password,
    database,
    ssl: getSslConfig(),
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60_000,
    enableKeepAlive: true,
  };
}
