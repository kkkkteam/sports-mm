"use client";

import dynamic from "next/dynamic";
import { MapPageSkeleton } from "@/components/map/map-skeleton";
import type { GameMapPoint } from "@/lib/map-games";

const GamesMapView = dynamic(
  () =>
    import("@/components/map/games-map-view").then((mod) => mod.GamesMapView),
  {
    ssr: false,
    loading: () => <MapPageSkeleton />,
  },
);

export function MapPageClient({ games }: { games: GameMapPoint[] }) {
  return (
    <div className="h-full min-h-0 w-full">
      <GamesMapView games={games} />
    </div>
  );
}
