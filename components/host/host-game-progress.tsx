"use client";

type HostGameProgressProps = {
  step: number;
  totalSteps: number;
  onBack: () => void;
  backLabel: string;
};

export function HostGameProgress({
  step,
  totalSteps,
  onBack,
  backLabel,
}: HostGameProgressProps) {
  const progress = (step / totalSteps) * 100;

  return (
    <header className="sticky top-0 z-20 bg-canvas/95 pt-safe backdrop-blur-sm">
      <div className="flex items-center gap-3 px-4 pb-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          aria-label={backLabel}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-subtle bg-card text-foreground transition-colors hover:bg-mist"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
            <path
              d="M14.5 6 9 11.5l5.5 5.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="min-w-0 flex-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-mist">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1.5 text-center text-[11px] font-medium text-muted">
            {step} / {totalSteps}
          </p>
        </div>

        <div className="h-10 w-10 shrink-0" aria-hidden />
      </div>
    </header>
  );
}
