import mysql, { type Pool } from "mysql2/promise";
import { getMysqlConnectionConfig } from "@/lib/db-config";

declare global {
  // eslint-disable-next-line no-var
  var __ctMysqlPool: Pool | undefined;
}

export function getPool(): Pool {
  if (!global.__ctMysqlPool) {
    global.__ctMysqlPool = mysql.createPool(getMysqlConnectionConfig());
  }

  return global.__ctMysqlPool;
}

export async function query<T = unknown>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const pool = getPool();
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

export async function queryOne<T = unknown>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function pingDatabase(): Promise<boolean> {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.ping();
    return true;
  } finally {
    connection.release();
  }
}
