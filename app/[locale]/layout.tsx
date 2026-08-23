import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getLocaleMessages } from "@/i18n/messages";
import { routing, type AppLocale } from "@/i18n/routing";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = getLocaleMessages(locale as AppLocale);

  return (
    <NextIntlClientProvider messages={messages}>
      <div lang={locale} className="h-full">
        <AppShell>{children}</AppShell>
      </div>
    </NextIntlClientProvider>
  );
}
