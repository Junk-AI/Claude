type DateInput = Date | string | number | null | undefined;

function formatValidDate(value: DateInput): string | null {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString();
}

export function formatDateRange(startDate: DateInput, endDate: DateInput, fallback = "Dates to be confirmed"): string {
  const start = formatValidDate(startDate);
  const end = formatValidDate(endDate);

  if (start && end) return `${start} – ${end}`;
  return start || end || fallback;
}
