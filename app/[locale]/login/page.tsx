import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { AuthMethods } from "@/components/auth/auth-methods";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "入場｜Sports Map & Match 拼場",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/games";
  const oauthFailed = params.error === "oauth";

  return (
    <AuthShell
      title="入場"
      lede="用 Google 或香港手機號碼進入。也可以電郵註冊後再登入。"
      footer={
        <p className="text-sm text-paper/60">
          還沒有檔案？{" "}
          <Link href="/register" className="text-line hover:text-paper">
            註冊
          </Link>
          <span className="mx-3 text-paper/30">/</span>
          <Link href="/" className="hover:text-line">
            返回首頁
          </Link>
        </p>
      }
    >
      {oauthFailed ? (
        <p className="mb-6 text-sm text-line">Google 登入未能完成，請再試一次。</p>
      ) : null}
      <AuthMethods mode="login" nextPath={nextPath} />
    </AuthShell>
  );
}
