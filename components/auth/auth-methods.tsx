"use client";

import { EmailAuth } from "@/components/auth/email-auth";
import { GoogleButton } from "@/components/auth/google-button";
import { PhoneAuth } from "@/components/auth/phone-auth";

export function AuthMethods({
  mode,
  nextPath,
}: {
  mode: "login" | "register";
  nextPath: string;
}) {
  return (
    <div className="flex flex-col gap-8">
      <GoogleButton
        nextPath={nextPath}
        label={mode === "register" ? "使用 Google 註冊" : "使用 Google 登入"}
      />
      <PhoneAuth
        nextPath={nextPath}
        sendLabel={mode === "register" ? "使用手機號碼註冊" : "使用手機號碼登入"}
      />
      <div>
        <p className="mb-3 font-display text-sm tracking-[0.2em] text-paper/45">
          OR EMAIL
        </p>
        <EmailAuth mode={mode} nextPath={nextPath} />
      </div>
    </div>
  );
}
