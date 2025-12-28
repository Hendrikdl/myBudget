export function monthIndex(year, month) {
  return year * 12 + month;
}

export function parseISO(date) {
  const d = new Date(date);
  return { year: d.getFullYear(), month: d.getMonth() };
}
