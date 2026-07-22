import fs from "node:fs";

function databaseUrlRequiresSsl(url) {
  return url.includes("ssl-mode=REQUIRED");
}

function cleanDatabaseUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.search = "";
    return parsed.toString();
  } catch {
    return url.split("?")[0] ?? url;
  }
}

function readCaCert() {
  const caPath = process.env.DB_SSL_CA_PATH;

  if (!caPath) {
    return undefined;
  }

  return fs.readFileSync(caPath, "utf8");
}

function getSslConfig() {
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

  return {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === "true",
  };
}

export function getConnectionConfig({ multipleStatements = false } = {}) {
  if (process.env.DATABASE_URL) {
    return {
      uri: cleanDatabaseUrl(process.env.DATABASE_URL),
      ssl: getSslConfig(),
      multipleStatements,
    };
  }

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (!host || !user || !password || !database) {
    throw new Error(
      "Missing DB config. Set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD, DB_NAME.",
    );
  }

  return {
    host,
    port: Number(process.env.DB_PORT ?? 3306),
    user,
    password,
    database,
    ssl: getSslConfig(),
    multipleStatements,
  };
}
