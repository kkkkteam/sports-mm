"use client";

import { useLocale, useTranslations } from "next-intl";
import { SportIcon } from "@/components/host/sport-icon";
import type { HostGameFormData, HostMinSkill } from "@/lib/host-game-form";
import type { Sport } from "@/types/database";

const MIN_SKILL_OPTIONS: HostMinSkill[] = [
  "beginner",
  "intermediate",
  "advanced",
  "competitive",
  "any",
];

type HostGameStepSportProps = {
  form: HostGameFormData;
  sports: Sport[];
  onChange: (patch: Partial<HostGameFormData>) => void;
};

export function HostGameStepSport({
  form,
  sports,
  onChange,
}: HostGameStepSportProps) {
  const t = useTranslations("hostGame");
  const locale = useLocale();

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t("step1Title")}
        </h1>
        <p className="mt-2 text-sm text-muted">{t("step1Hint")}</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground">{t("sportLabel")}</p>
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {sports.map((sport) => {
            const selected = form.sportId === sport.id;
            const label = locale === "en" ? sport.name_en : sport.name_zh;

            return (
              <li key={sport.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    onChange({
                      sportId: sport.id,
                      maxPlayers: Math.max(2, sport.min_players),
                    })
                  }
                  className={[
                    "flex w-full flex-col items-center gap-2 rounded-2xl border bg-card px-2 py-4 transition-all",
                    selected
                      ? "border-[3px] border-primary shadow-md shadow-primary/15"
                      : "border-line-subtle hover:border-primary/40",
                  ].join(" ")}
                >
                  <span className={selected ? "text-primary" : "text-muted"}>
                    <SportIcon slug={sport.slug} />
                  </span>
                  <span className="text-center text-xs font-semibold text-foreground">
                    {label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground">{t("minSkillLabel")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {MIN_SKILL_OPTIONS.map((level) => {
            const selected = form.minSkill === level;
            const label =
              level === "any"
                ? t("skill_any")
                : t(`skill_${level}` as "skill_beginner");

            return (
              <button
                key={level}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange({ minSkill: level })}
                className={[
                  "rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                  selected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-line-subtle bg-card text-foreground hover:border-primary/40",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted">{t("minSkillHint")}</p>
      </div>
    </section>
  );
}
