import { datetimeLocalToIso, defaultEndLocal, defaultStartLocal } from "@/lib/format";
import type { CostSplitMode, GamePaymentMethod, HkDistrict, SkillLevel, Sport } from "@/types/database";

export const HOST_GAME_STEPS = 3;

export type HostMinSkill = SkillLevel | "any";

export type HostGameFormData = {
  sportId: string;
  minSkill: HostMinSkill;
  date: string;
  startTime: string;
  endTime: string;
  district: HkDistrict;
  venueLabel: string;
  lat: number | null;
  lng: number | null;
  maxPlayers: number;
  totalCostHkd: number;
  costSplitMode: CostSplitMode;
  paymentMethod: GamePaymentMethod;
  remarks: string;
};

export function todayHkDateString() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Hong_Kong" });
}

function splitLocalDateTime(local: string) {
  const [date = "", time = ""] = local.split("T");
  return { date, time: time.slice(0, 5) };
}

export function createInitialHostGameFormData(
  sports: Sport[],
  defaultDistrict?: HkDistrict | null,
): HostGameFormData {
  const startLocal = defaultStartLocal();
  const endLocal = defaultEndLocal(startLocal);
  const { date, time: startTime } = splitLocalDateTime(startLocal);
  const { time: endTime } = splitLocalDateTime(endLocal);
  const firstSport = sports[0];

  return {
    sportId: firstSport?.id ?? "",
    minSkill: "any",
    date,
    startTime,
    endTime,
    district: defaultDistrict ?? "yau_tsim_mong",
    venueLabel: "",
    lat: null,
    lng: null,
    maxPlayers: Math.max(2, firstSport?.min_players ?? 4),
    totalCostHkd: 0,
    costSplitMode: "all_players",
    paymentMethod: "both",
    remarks: "",
  };
}

export function buildGameInsertPayload(
  form: HostGameFormData,
  sports: Sport[],
  hostId: string,
) {
  const sport = sports.find((item) => item.id === form.sportId);
  if (!sport) {
    throw new Error("missing_sport");
  }

  const venueLabel = form.venueLabel.trim();
  const startsAt = datetimeLocalToIso(`${form.date}T${form.startTime}`);
  const endsAt = datetimeLocalToIso(`${form.date}T${form.endTime}`);

  return {
    host_id: hostId,
    sport_id: form.sportId,
    venue_label: venueLabel,
    district: form.district,
    lat: form.lat,
    lng: form.lng,
    starts_at: startsAt,
    ends_at: endsAt,
    max_players: form.maxPlayers,
    total_cost_hkd: Math.max(0, form.totalCostHkd),
    cost_split_mode: form.costSplitMode,
    payment_method: form.paymentMethod,
    min_skill: form.minSkill === "any" ? null : form.minSkill,
    title: `${sport.name_zh}｜${venueLabel}`,
    description: form.remarks.trim() || null,
    status: "open" as const,
  };
}

export function validateHostGameStep(
  step: number,
  form: HostGameFormData,
): string | null {
  if (step === 1) {
    if (!form.sportId) return "sport_required";
    return null;
  }

  if (step === 2) {
    if (!form.date) return "date_required";
    if (form.date < todayHkDateString()) return "date_past";
    if (!form.startTime || !form.endTime) return "time_required";
    if (!form.venueLabel.trim()) return "venue_required";
    if (form.lat == null || form.lng == null) return "venue_location";
    const startsAt = datetimeLocalToIso(`${form.date}T${form.startTime}`);
    const endsAt = datetimeLocalToIso(`${form.date}T${form.endTime}`);
    if (new Date(endsAt) <= new Date(startsAt)) return "time_order";
    return null;
  }

  if (step === 3) {
    if (form.maxPlayers < 2) return "players_min";
    if (form.totalCostHkd < 0) return "cost_invalid";
    return null;
  }

  return null;
}
