function initialsFromNickname(nickname: string) {
  const trimmed = nickname.trim();
  if (!trimmed) return "?";
  return trimmed.slice(0, 1).toUpperCase();
}

export function ProfileAvatar({
  nickname,
  avatarUrl,
  size = "lg",
}: {
  nickname: string;
  avatarUrl: string | null;
  size?: "md" | "lg";
}) {
  const dimension = size === "lg" ? "h-16 w-16 text-xl" : "h-12 w-12 text-base";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={nickname}
        className={`${dimension} shrink-0 rounded-full object-cover ring-2 ring-primary/15`}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`${dimension} flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary ring-2 ring-primary/20`}
    >
      {initialsFromNickname(nickname)}
    </span>
  );
}
