// Splits a recurring rule's active date range around academic breaks (Fall Break,
// Thanksgiving, Spring Break, etc.) so weekly recurring events don't fire during
// them, without having to hand-author multiple date ranges per person per term.
// Add new breaks to src/data/academicBreaks.json each year — everyone's recurring
// availability picks them up automatically.

// All-UTC date math (never local time) so this behaves the same regardless of the
// visiting browser's timezone — local-time arithmetic can roll a date backward a
// day for anyone east of Greenwich.
function addDays(dateStr, days) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * @param {string} startRecur
 * @param {string} endRecur - exclusive, matching FullCalendar's own convention
 * @param {{label: string, start: string, end: string}[]} breaks - start/end inclusive
 * @returns {{startRecur: string, endRecur: string}[]}
 */
export function splitAroundBreaks(startRecur, endRecur, breaks) {
  const relevant = breaks
    .filter((b) => b.start < endRecur && addDays(b.end, 1) > startRecur)
    .sort((a, b) => a.start.localeCompare(b.start));

  const segments = [];
  let cursor = startRecur;
  for (const b of relevant) {
    if (b.start > cursor) {
      segments.push({ startRecur: cursor, endRecur: b.start });
    }
    cursor = addDays(b.end, 1);
  }
  if (cursor < endRecur) {
    segments.push({ startRecur: cursor, endRecur });
  }
  return segments;
}
