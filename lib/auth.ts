export function translateAuthError(message: string | undefined) {
  if (!message) return "登入失敗，請再試一次。";

  const text = message.toLowerCase();

  if (text.includes("provider is not enabled") || text.includes("unsupported provider")) {
    return "此登入方式尚未在 Supabase 開啟。請到 Authentication → Providers 啟用 Google 或 Phone。";
  }
  if (text.includes("error sending confirmation otp") || text.includes("sms")) {
    return "未能送出短訊驗證碼。請在 Supabase 設定 Phone provider（例如 Twilio）。";
  }
  if (text.includes("invalid login credentials")) {
    return "電郵或密碼不正確。";
  }
  if (text.includes("user already registered")) {
    return "此電郵已註冊，請直接入場。";
  }
  if (text.includes("email not confirmed")) {
    return "請先到電郵確認帳戶。";
  }
  if (text.includes("invalid otp") || text.includes("token has expired") || text.includes("otp_expired")) {
    return "驗證碼不正確或已過期。";
  }
  if (text.includes("rate limit") || text.includes("over_sms_send_rate_limit")) {
    return "嘗試次數過多，請稍後再試。";
  }
  if (text.includes("signup is disabled")) {
    return "目前暫停註冊。";
  }

  return message;
}

export function normalizeHkPhone(input: string) {
  const digits = input.replace(/\D/g, "");

  if (digits.startsWith("852") && digits.length === 11) {
    return `+${digits}`;
  }

  if (digits.length === 8) {
    return `+852${digits}`;
  }

  return null;
}
