export type GenerateICSParams = {
  title: string;
  startTime: Date;
  endTime: Date;
  location: string;
  description: string;
  uid?: string;
};

/** Format a Date as UTC iCalendar datetime: YYYYMMDDTHHmmssZ */
export function formatUtcIcsDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

/** Escape special characters per RFC 5545 TEXT value rules. */
function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/** Build a standard iCalendar (.ics) document string. */
export function generateICS(params: GenerateICSParams): string {
  const {
    title,
    startTime,
    endTime,
    location,
    description,
    uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@sportsshare.hk`,
  } = params;

  const now = new Date();

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sports Map & Match//Game//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatUtcIcsDateTime(now)}`,
    `DTSTART:${formatUtcIcsDateTime(startTime)}`,
    `DTEND:${formatUtcIcsDateTime(endTime)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Trigger a `.ics` file download in the browser. */
export function downloadICS(
  icsString: string,
  filename = "game-event.ics",
) {
  if (typeof document === "undefined") return;

  const blob = new Blob([icsString], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
