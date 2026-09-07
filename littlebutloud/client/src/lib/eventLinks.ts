export function buildEventShareUrl(origin: string, eventId: number): string {
  const cleanOrigin = origin.replace(/\/$/, "");
  return `${cleanOrigin}/convene?event=${encodeURIComponent(eventId)}`;
}

export function getSharedEventId(search: string): number | null {
  const eventId = Number(new URLSearchParams(search).get("event"));
  return Number.isInteger(eventId) && eventId > 0 ? eventId : null;
}
