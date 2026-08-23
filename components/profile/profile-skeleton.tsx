export function ProfilePageSkeleton() {
  return (
    <div className="animate-pulse px-4 pb-28 pt-4 md:px-6">
      <div className="rounded-2xl border border-line-subtle bg-card p-5">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 shrink-0 rounded-full bg-mist" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-32 rounded-lg bg-mist" />
            <div className="flex gap-2">
              <div className="h-5 w-12 rounded-full bg-mist" />
              <div className="h-5 w-20 rounded-full bg-mist" />
            </div>
            <div className="h-4 w-full max-w-md rounded bg-mist" />
          </div>
        </div>
        <div className="mt-4 h-10 w-28 rounded-full bg-mist" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-line-subtle bg-card p-4"
          >
            <div className="h-3 w-16 rounded bg-mist" />
            <div className="mt-3 h-8 w-20 rounded-lg bg-mist" />
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        <div className="h-5 w-32 rounded bg-mist" />
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-xl border border-line-subtle bg-card px-4 py-3"
          >
            <div className="h-4 w-24 rounded bg-mist" />
            <div className="h-8 w-40 rounded-full bg-mist" />
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-line-subtle bg-card p-5">
        <div className="h-5 w-28 rounded bg-mist" />
        <div className="mt-4 space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-11 w-full rounded-xl bg-mist" />
          ))}
        </div>
      </div>
    </div>
  );
}
