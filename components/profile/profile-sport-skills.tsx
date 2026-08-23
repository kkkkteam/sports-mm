"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import {
  PROFILE_SKILL_LEVELS,
  type SkillLevel,
  type Sport,
} from "@/types/database";

export function ProfileSportSkills({
  userId,
  sports,
  skills,
  onSkillsChange,
}: {
  userId: string;
  sports: Sport[];
  skills: Record<string, SkillLevel>;
  onSkillsChange: (next: Record<string, SkillLevel>) => void;
}) {
  const t = useTranslations("profile");
  const locale = useLocale();
  const [savingSportId, setSavingSportId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveSkill(sportId: string, level: SkillLevel) {
    setError(null);
    setSavingSportId(sportId);
    const previous = skills[sportId];

    onSkillsChange({ ...skills, [sportId]: level });

    try {
      const supabase = createClient();
      const { error: upsertError } = await supabase.from("user_sport_skills").upsert(
        {
          user_id: userId,
          sport_id: sportId,
          level,
        },
        { onConflict: "user_id,sport_id" },
      );

      if (upsertError) {
        const reverted = { ...skills };
        if (previous) reverted[sportId] = previous;
        else delete reverted[sportId];
        onSkillsChange(reverted);
        setError(upsertError.message);
      }
    } finally {
      setSavingSportId(null);
    }
  }

  return (
    <section className="mt-8" aria-label={t("skillsTitle")}>
      <h2 className="text-base font-bold text-foreground">{t("skillsTitle")}</h2>
      <p className="mt-1 text-sm text-muted">{t("skillsHint")}</p>

      {error ? (
        <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
      ) : null}

      <ul className="mt-4 space-y-2">
        {sports.length === 0 ? (
          <li className="rounded-xl border border-line-subtle bg-card px-4 py-6 text-sm text-muted">
            {t("skillsEmpty")}
          </li>
        ) : (
          sports.map((sport) => {
            const currentLevel = skills[sport.id];
            const saving = savingSportId === sport.id;
            const sportName =
              locale === "en" ? sport.name_en : sport.name_zh;

            return (
              <li
                key={sport.id}
                className="rounded-xl border border-line-subtle bg-card px-4 py-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{sportName}</p>
                    {locale !== "en" ? (
                      <p className="text-xs text-muted">{sport.name_en}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PROFILE_SKILL_LEVELS.map((level) => {
                      const selected = currentLevel === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          disabled={saving}
                          onClick={() => saveSkill(sport.id, level)}
                          className={[
                            "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                            selected
                              ? "bg-primary text-primary-foreground"
                              : "border border-line-subtle bg-background text-muted hover:border-primary/30 hover:text-foreground",
                          ].join(" ")}
                        >
                          {t(`skill_${level}`)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}
