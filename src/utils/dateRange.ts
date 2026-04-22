/**
 * Start of the current local week (Monday 00:00), used for weekly completion stats.
 */
export function startOfLocalWeekMs(reference = Date.now()): number {
  const d = new Date(reference);
  const day = d.getDay();
  const daysFromMonday = (day + 6) % 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysFromMonday);
  return d.getTime();
}
