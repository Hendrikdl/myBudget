/** Get YYYY-MM key for a Date */
export const monthKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

/** Subtract N months from a date without mutating the original */
export const subtractMonths = (date, n) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();
  // Create new date with month - n; JS auto-wraps year/month
  return new Date(year, month - n, 1);
};

/** Convert YYYY-MM to a nice label, e.g., 'Dec 2025' */
export const formatMonthLabel = (key) => {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleString(undefined, { month: "short", year: "numeric" }); // e.g. 'Dec 2025'
};

/** Build an array of month keys going backward from selected month, inclusive */
export const lastNMonthsKeys = (selectedMonthDate, n = 7) => {
  const start = new Date(selectedMonthDate);
  start.setDate(1); // normalize to 1st of month
  return Array.from({ length: n }, (_, i) =>
    monthKey(subtractMonths(start, i))
  );
};

/** Sum amounts per YYYY-MM key */
export const sumByMonth = (
  items,
  dateField = "date",
  amountField = "amount"
) => {
  const map = new Map();
  for (const item of items || []) {
    // Accept Date or string; fallback if invalid
    const d =
      item[dateField] instanceof Date
        ? item[dateField]
        : new Date(item[dateField]);
    if (isNaN(d)) continue;
    const key = monthKey(d);
    const prev = map.get(key) || 0;
    const amt = Number(item[amountField]) || 0;
    map.set(key, prev + amt);
  }
  return map;
};
