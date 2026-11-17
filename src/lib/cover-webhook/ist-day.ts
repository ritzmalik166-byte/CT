/** India Standard Time is UTC+05:30 all year (no daylight saving), so a calendar day is always 24h. */
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export type IstDayBounds = {
  /** Calendar date in Asia/Kolkata, YYYY-MM-DD. */
  date: string;
  /** Unix seconds of 00:00 IST on that date (inclusive). */
  startSec: number;
  /** Unix seconds of 00:00 IST on the next date (exclusive). */
  endSec: number;
};

/** Today's Asia/Kolkata day as absolute instants; independent of the server's and the database's time zone. */
export function getIstDayBounds(now: Date = new Date()): IstDayBounds {
  const istWallClock = new Date(now.getTime() + IST_OFFSET_MS);
  const year = istWallClock.getUTCFullYear();
  const month = istWallClock.getUTCMonth();
  const day = istWallClock.getUTCDate();

  const startMs = Date.UTC(year, month, day) - IST_OFFSET_MS;

  return {
    date: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    startSec: startMs / 1000,
    endSec: (startMs + DAY_MS) / 1000,
  };
}
