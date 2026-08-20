import { getSessionUser } from "@/lib/profile";

export type AdminGateResult =
  | {
      ok: true;
      reason: null;
      supabase: NonNullable<Awaited<ReturnType<typeof getSessionUser>>["supabase"]>;
      user: NonNullable<Awaited<ReturnType<typeof getSessionUser>>["user"]>;
      profile: { id: string; nickname: string; is_admin: boolean };
    }
  | {
      ok: false;
      reason: "unauthenticated" | "forbidden" | "error";
      supabase: Awaited<ReturnType<typeof getSessionUser>>["supabase"];
      user: Awaited<ReturnType<typeof getSessionUser>>["user"];
      profile: { id: string; nickname: string; is_admin: boolean } | null;
      message?: string;
    };

export async function requireAdmin(): Promise<AdminGateResult> {
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

  const [{ data: profile, error: profileError }, { data: rpcAdmin, error: rpcError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, nickname, is_admin")
        .eq("id", user.id)
        .maybeSingle(),
      supabase.rpc("is_admin"),
    ]);

  if (profileError || rpcError) {
    return {
      ok: false,
      reason: "error",
      supabase,
      user,
      profile: null,
      message: profileError?.message ?? rpcError?.message,
    };
  }

  const isAdmin = rpcAdmin === true || profile?.is_admin === true;
  const normalized = {
    id: user.id,
    nickname: profile?.nickname ?? user.email?.split("@")[0] ?? "Admin",
    is_admin: isAdmin,
  };

  if (!isAdmin) {
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
