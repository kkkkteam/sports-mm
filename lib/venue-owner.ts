import { getSessionUser } from "@/lib/profile";

export type VenueOwnerGateResult =
  | {
      ok: true;
      reason: null;
      supabase: NonNullable<Awaited<ReturnType<typeof getSessionUser>>["supabase"]>;
      user: NonNullable<Awaited<ReturnType<typeof getSessionUser>>["user"]>;
      profile: { id: string; nickname: string; is_venue_owner: boolean };
    }
  | {
      ok: false;
      reason: "unauthenticated" | "forbidden" | "error";
      supabase: Awaited<ReturnType<typeof getSessionUser>>["supabase"];
      user: Awaited<ReturnType<typeof getSessionUser>>["user"];
      profile: { id: string; nickname: string; is_venue_owner: boolean } | null;
      message?: string;
    };

export async function requireVenueOwner(): Promise<VenueOwnerGateResult> {
  const { supabase, user } = await getSessionUser();
  if (!supabase || !user) {
    return {
      ok: false,
      reason: "unauthenticated",
      supabase,
      user,
      profile: null,
    };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, nickname, is_venue_owner")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      reason: "error",
      supabase,
      user,
      profile: null,
      message: error.message,
    };
  }

  const normalized = {
    id: user.id,
    nickname: profile?.nickname ?? user.email?.split("@")[0] ?? "館主",
    is_venue_owner: profile?.is_venue_owner === true,
  };

  if (!normalized.is_venue_owner) {
    return {
      ok: false,
      reason: "forbidden",
      supabase,
      user,
      profile: normalized,
    };
  }

  return {
    ok: true,
    reason: null,
    supabase,
    user,
    profile: normalized,
  };
}
