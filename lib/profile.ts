import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

function defaultNickname(user: User) {
  const meta = user.user_metadata ?? {};
  const raw =
    meta.nickname ||
    meta.full_name ||
    meta.name ||
    user.email?.split("@")[0] ||
    user.phone ||
    "球員";
  return String(raw).slice(0, 24);
}

export async function getSessionUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return { supabase, user };
  } catch {
    return { supabase: null, user: null };
  }
}

export async function getOrCreateProfile(user: User) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return existing as Profile;
  }

  const { data: created, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      nickname: defaultNickname(user),
    })
    .select("*")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "無法建立會員檔案");
  }

  return created as Profile;
}
