import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { AuthMethods } from "@/components/auth/auth-methods";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "註冊｜Sports Map & Match 拼場",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="開檔"
      lede="建立會員檔案。Google 與手機第一次驗證即完成註冊。"
      footer={
        <p className="text-sm text-paper/60">
          已有檔案？{" "}
          <Link href="/login" className="text-line hover:text-paper">
            入場
          </Link>
          <span className="mx-3 text-paper/30">/</span>
          <Link href="/" className="hover:text-line">
            返回首頁
          </Link>
        </p>
      }
    >
      <AuthMethods mode="register" nextPath="/profile" />
    </AuthShell>
  );
}
