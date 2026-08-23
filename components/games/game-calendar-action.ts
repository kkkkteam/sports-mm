"use client";

import { downloadICS, generateICS } from "@/lib/calendar";

export type GameCalendarEvent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  venueLabel: string;
  location: string;
  description: string;
};

/** Client handler: generate `.ics` from game fields and trigger download. */
export function handleAddToCalendar(game: GameCalendarEvent) {
  const ics = generateICS({
    title: game.title,
    startTime: new Date(game.startsAt),
    endTime: new Date(game.endsAt),
    location: game.location,
    description: game.description,
    uid: `game-${game.id}@sportsshare.hk`,
  });

  downloadICS(ics, `game-${game.id}.ics`);
}
