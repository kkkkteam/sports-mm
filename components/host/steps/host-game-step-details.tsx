"use client";

import { useTranslations } from "next-intl";
import { costPerPerson, formatHkd } from "@/lib/format";
import type { HostGameFormData } from "@/lib/host-game-form";
import type { CostSplitMode, GamePaymentMethod } from "@/types/database";

const fieldClass =
  "mt-2 w-full rounded-xl border border-line-subtle bg-card px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15";

type HostGameStepDetailsProps = {
  form: HostGameFormData;
  onChange: (patch: Partial<HostGameFormData>) => void;
};

export function HostGameStepDetails({
  form,
  onChange,
}: HostGameStepDetailsProps) {
  const t = useTranslations("hostGame");

  const perPerson = costPerPerson(
    form.totalCostHkd,
    form.maxPlayers,
    form.costSplitMode,
  );

  function adjustPlayers(delta: number) {
    onChange({ maxPlayers: Math.min(40, Math.max(2, form.maxPlayers + delta)) });
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t("step3Title")}
        </h1>
        <p className="mt-2 text-sm text-muted">{t("step3Hint")}</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground">{t("maxPlayersLabel")}</p>
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-line-subtle bg-card px-4 py-3">
          <button
            type="button"
            aria-label={t("decreasePlayers")}
            onClick={() => adjustPlayers(-1)}
            disabled={form.maxPlayers <= 2}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line-subtle text-lg font-bold text-foreground transition-colors hover:bg-mist disabled:opacity-40"
          >
            −
          </button>
          <div className="text-center">
            <p className="text-3xl font-bold tabular-nums text-foreground">
              {form.maxPlayers}
            </p>
            <p className="text-xs text-muted">{t("maxPlayersHint")}</p>
          </div>
          <button
            type="button"
            aria-label={t("increasePlayers")}
            onClick={() => adjustPlayers(1)}
            disabled={form.maxPlayers >= 40}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line-subtle text-lg font-bold text-foreground transition-colors hover:bg-mist disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-foreground" htmlFor="total-cost">
          {t("totalCostLabel")}
        </label>
        <input
          id="total-cost"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          value={form.totalCostHkd || ""}
          placeholder="0"
          onChange={(event) =>
            onChange({ totalCostHkd: Number(event.target.value) || 0 })
          }
          className={fieldClass}
        />
        <p className="mt-2 text-sm text-muted">
          {t("perPersonEstimate", { amount: formatHkd(perPerson) })}
        </p>
      </div>

      <div role="radiogroup" aria-label={t("paymentMethodLabel")}>
        <p className="text-sm font-semibold text-foreground">{t("paymentMethodLabel")}</p>
        <div className="mt-3 flex flex-col gap-2">
          {(
            [
              ["on_site", t("paymentMethod_on_site")],
              ["transfer", t("paymentMethod_transfer")],
              ["both", t("paymentMethod_both")],
            ] as const satisfies [GamePaymentMethod, string][]
          ).map(([method, label]) => {
            const active = form.paymentMethod === method;
            return (
              <button
                key={method}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange({ paymentMethod: method })}
                className={[
                  "rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all",
                  active
                    ? "border-[3px] border-primary bg-card text-foreground shadow-sm shadow-primary/10"
                    : "border-line-subtle bg-card text-muted hover:border-primary/40 hover:text-foreground",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground">{t("costSplitLabel")}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-mist p-1">
          {(
            [
              ["all_players", t("costSplitAll")],
              ["joiners_only", t("costSplitHostFree")],
            ] as const satisfies [CostSplitMode, string][]
          ).map(([mode, label]) => {
            const active = form.costSplitMode === mode;
            return (
              <button
                key={mode}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ costSplitMode: mode })}
                className={[
                  "rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                  active
                    ? "bg-card text-foreground shadow-sm ring-1 ring-line-subtle"
                    : "text-muted hover:text-foreground",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-foreground" htmlFor="remarks">
          {t("remarksLabel")}
        </label>
        <textarea
          id="remarks"
          rows={4}
          maxLength={500}
          placeholder={t("remarksPlaceholder")}
          value={form.remarks}
          onChange={(event) => onChange({ remarks: event.target.value })}
          className={`${fieldClass} min-h-28 resize-none py-3`}
        />
      </div>
    </section>
  );
}
