import { Actions } from "@/components/landing/actions";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { SiteFooter } from "@/components/landing/site-footer";
import { SportTicker } from "@/components/landing/sport-ticker";
import { Sports } from "@/components/landing/sports";

export default function Home() {
  return (
    <main>
      <Hero />
      <Problem />
      <SportTicker />
      <Actions />
      <Sports />
      <SiteFooter />
    </main>
  );
}
