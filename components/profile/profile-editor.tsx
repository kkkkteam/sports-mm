"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  GENDER_LABELS,
  PROFILE_SKILL_LEVELS,
  SKILL_LEVEL_LABELS,
  type Gender,
  type Profile,
  type SkillLevel,
  type Sport,
} from "@/types/database";

const genders = Object.keys(GENDER_LABELS) as Gender[];

export function ProfileEditor({
  profile,
  sports,
  skills,
}: {
  profile: Profile;
  sports: Sport[];
  skills: Record<string, SkillLevel>;
}) {
  const router = useRouter();
  const [nickname, setNickname] = useState(profile.nickname);
  const [gender, setGender] = useState<Gender | null>(profile.gender);
  const [levels, setLevels] = useState<Record<string, SkillLevel>>(skills);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSport, setSavingSport] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveIdentity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const name = nickname.trim();
    if (name.length < 1 || name.length > 24) {
      setError("暱稱需為 1 至 24 個字。");
      return;
    }

    setSavingProfile(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ nickname: name, gender })
        .eq("id", profile.id);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setMessage("檔案已更新。");
      router.refresh();
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveSkill(sportId: string, level: SkillLevel) {
    setError(null);
    setSavingSport(sportId);
    const previous = levels[sportId];
    setLevels((current) => ({ ...current, [sportId]: level }));

    try {
      const supabase = createClient();
      const { error: upsertError } = await supabase.from("user_sport_skills").upsert(
        {
          user_id: profile.id,
          sport_id: sportId,
          level,
        },
        { onConflict: "user_id,sport_id" },
      );

      if (upsertError) {
        setLevels((current) => {
          const next = { ...current };
          if (previous) next[sportId] = previous;
          else delete next[sportId];
          return next;
        });
        setError(upsertError.message);
      }
    } finally {
      setSavingSport(null);
    }
  }

  return (
    <div className="flex flex-col gap-16 md:gap-24">
      <form onSubmit={saveIdentity} className="max-w-xl">
        <p className="font-display text-sm tracking-[0.22em] text-court">PROFILE</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">你是誰</h2>

        <label className="mt-8 block text-sm font-medium text-ink/70" htmlFor="profile-nickname">
          暱稱
        </label>
        <input
          id="profile-nickname"
          name="nickname"
          maxLength={24}
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          className="mt-2 min-h-12 w-full border-2 border-ink/20 bg-transparent px-4 text-lg outline-none focus:border-court"
        />

        <p className="mt-8 text-sm font-medium text-ink/70">性別</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {genders.map((value) => {
            const selected = gender === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setGender(value)}
                className={`min-h-11 px-4 text-sm font-bold transition-colors ${
                  selected
                    ? "bg-ink text-paper"
                    : "border-2 border-ink/20 text-ink hover:border-ink"
                }`}
              >
                {GENDER_LABELS[value]}
              </button>
            );
          })}
        </div>

        <button
          type="submit"
          disabled={savingProfile}
          className="mt-8 inline-flex min-h-12 items-center bg-ink px-8 text-base font-bold text-paper transition-colors hover:bg-court disabled:opacity-55"
        >
          {savingProfile ? "儲存中…" : "儲存檔案"}
        </button>
        {message ? <p className="mt-3 text-sm text-court">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-court">{error}</p> : null}
      </form>

      <section>
        <p className="font-display text-sm tracking-[0.22em] text-court">LEVELS</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">運動能力</h2>
        <p className="mt-3 max-w-xl text-base text-ink/70">
          點選等級即可儲存：新手、進階、高手、競技。
        </p>
        <ul className="mt-8 divide-y divide-ink/15 border-y border-ink/15">
          {sports.length === 0 ? (
            <li className="py-8 text-ink/70">
              尚未載入運動項目。請在 Supabase SQL Editor 執行
              <code className="mx-1 font-mono text-sm">supabase/migrations</code>
              裡的 migration。
            </li>
          ) : (
            sports.map((sport) => (
            <li
              key={sport.id}
              className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-2xl font-black tracking-tight">{sport.name_zh}</p>
                <p className="font-display text-sm tracking-[0.16em] text-ink/35">
                  {sport.name_en.toUpperCase()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {PROFILE_SKILL_LEVELS.map((level) => {
                  const selected = levels[sport.id] === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      disabled={savingSport === sport.id}
                      onClick={() => saveSkill(sport.id, level)}
                      className={`min-h-11 min-w-20 px-4 text-sm font-bold transition-colors ${
                        selected
                          ? "bg-line text-ink"
                          : "border-2 border-ink/20 text-ink hover:border-ink"
                      }`}
                    >
                      {SKILL_LEVEL_LABELS[level]}
                    </button>
                  );
                })}
              </div>
            </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
