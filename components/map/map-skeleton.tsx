export function MapPageSkeleton() {
  return (
    <div className="flex h-[calc(100dvh-4.25rem-env(safe-area-inset-bottom))] w-full items-center justify-center bg-mist md:h-full">
      <p className="text-sm text-muted">載入地圖…</p>
    </div>
  );
}
