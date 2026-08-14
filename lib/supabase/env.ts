export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ""
  ).trim();

  return { url, key };
}

export function requireSupabaseEnv() {
  const { url, key } = getSupabaseEnv();

  if (!url || !key) {
    throw new Error(
      "缺少 NEXT_PUBLIC_SUPABASE_URL，或 NEXT_PUBLIC_SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  return { url, key };
}
