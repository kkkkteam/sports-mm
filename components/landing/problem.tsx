import { InView } from "@/components/in-view";

export function Problem() {
  return (
    <section className="relative overflow-hidden bg-paper px-5 py-24 md:px-12 md:py-32">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(to_right,rgba(20,26,22,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,26,22,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />
      <InView className="relative mx-auto max-w-4xl">
        <div className="reveal-line mb-10 h-1.5 w-24 bg-court" />
        <h2 className="reveal max-w-3xl text-[clamp(2.4rem,7vw,4.6rem)] font-black leading-[1.05] tracking-tight text-ink">
          場少。場貴。
          <br />
          仲差人。
        </h2>
        <p
          className="reveal mt-8 max-w-2xl text-lg leading-relaxed text-ink/75 md:text-xl"
          style={{ animationDelay: "120ms" }}
        >
          香港公共場地一位難求，私人場開支高。籃球、健球、匹克球湊不齊人，場就空著。拼場把已訂的局打開，讓人來補位、分擔費用。
        </p>
      </InView>
    </section>
  );
}
