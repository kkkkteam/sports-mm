"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { HostGameProgress } from "@/components/host/host-game-progress";
import { HostGameStepDetails } from "@/components/host/steps/host-game-step-details";
import { HostGameStepSport } from "@/components/host/steps/host-game-step-sport";
import { HostGameStepTimeLocation } from "@/components/host/steps/host-game-step-time-location";
import {
  buildGameInsertPayload,
  createInitialHostGameFormData,
  HOST_GAME_STEPS,
  validateHostGameStep,
  type HostGameFormData,
} from "@/lib/host-game-form";
import { createClient } from "@/lib/supabase/client";
import type { HkDistrict, Sport } from "@/types/database";

type HostGameWizardProps = {
  sports: Sport[];
  userId: string;
  defaultDistrict?: HkDistrict | null;
};

export function HostGameWizard({
  sports,
  userId,
  defaultDistrict,
}: HostGameWizardProps) {
  const t = useTranslations("hostGame");
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<HostGameFormData>(() =>
    createInitialHostGameFormData(sports, defaultDistrict),
  );
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const errorMessage = useMemo(() => {
    if (!errorKey) return null;
    if (errorKey.startsWith("supabase:")) {
      return errorKey.slice("supabase:".length);
    }
    return t(`error_${errorKey}` as "error_sport_required");
  }, [errorKey, t]);

  function patchForm(patch: Partial<HostGameFormData>) {
    setFormData((current) => ({ ...current, ...patch }));
    setErrorKey(null);
  }

  function handleBack() {
    if (step > 1) {
      setStep((current) => current - 1);
      setErrorKey(null);
      return;
    }
    router.push("/games");
  }

  function handleNext() {
    const validationError = validateHostGameStep(step, formData);
    if (validationError) {
      setErrorKey(validationError);
      return;
    }
    setStep((current) => Math.min(HOST_GAME_STEPS, current + 1));
  }

  async function handlePublish() {
    const validationError = validateHostGameStep(3, formData);
    if (validationError) {
      setErrorKey(validationError);
      return;
    }

    setLoading(true);
    setErrorKey(null);

    try {
      const payload = buildGameInsertPayload(formData, sports, userId);
      const supabase = createClient();
      const { data, error: insertError } = await supabase
        .from("games")
        .insert(payload)
        .select("id")
        .single();

      if (insertError || !data) {
        setErrorKey(`supabase:${insertError?.message ?? t("error_publish")}`);
        return;
      }

      setToast(t("publishSuccess"));
      window.setTimeout(() => {
        router.push(`/games/${data.id}`);
        router.refresh();
      }, 1200);
    } catch (caught) {
      if (caught instanceof Error && caught.message === "missing_sport") {
        setErrorKey("sport_required");
        setStep(1);
        return;
      }
      setErrorKey(
        `supabase:${caught instanceof Error ? caught.message : t("error_publish")}`,
      );
    } finally {
      setLoading(false);
    }
  }

  if (sports.length === 0) {
    return (
      <p className="px-4 py-8 text-sm text-muted">{t("sportsEmpty")}</p>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <HostGameProgress
        step={step}
        totalSteps={HOST_GAME_STEPS}
        onBack={handleBack}
        backLabel={step > 1 ? t("backStep") : t("backToGames")}
      />

      <div className="flex-1 px-4 pb-32 pt-4">
        {step === 1 ? (
          <HostGameStepSport form={formData} sports={sports} onChange={patchForm} />
        ) : null}
        {step === 2 ? (
          <HostGameStepTimeLocation form={formData} onChange={patchForm} />
        ) : null}
        {step === 3 ? (
          <HostGameStepDetails form={formData} onChange={patchForm} />
        ) : null}

        {errorMessage ? (
          <p className="mt-6 text-sm font-medium text-red-600">{errorMessage}</p>
        ) : null}
      </div>

      <footer className="fixed inset-x-0 bottom-[4.25rem] z-30 border-t border-line-subtle bg-canvas/95 px-4 py-4 backdrop-blur-sm pb-[max(1rem,env(safe-area-inset-bottom))] md:bottom-0">
        {step < HOST_GAME_STEPS ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-md shadow-primary/20 transition-opacity hover:opacity-90"
          >
            {t("nextStep")}
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePublish}
            disabled={loading || Boolean(toast)}
            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-md shadow-primary/20 transition-opacity hover:opacity-90 disabled:opacity-55"
          >
            {loading ? t("publishing") : t("publish")}
          </button>
        )}
      </footer>

      {toast ? (
        <div
          role="status"
          className="fixed inset-x-4 top-[calc(env(safe-area-inset-top)+4.5rem)] z-50 rounded-2xl border border-line-subtle bg-card px-4 py-3 text-center text-sm font-semibold text-foreground shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
