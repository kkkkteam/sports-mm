const SPORTS = [
  { zh: "籃球", en: "Basketball" },
  { zh: "健球", en: "Dodgebee" },
  { zh: "匹克球", en: "Pickleball" },
  { zh: "足球", en: "Football" },
  { zh: "羽毛球", en: "Badminton" },
  { zh: "排球", en: "Volleyball" },
  { zh: "網球", en: "Tennis" },
  { zh: "乒乓球", en: "Table Tennis" },
];

export function Sports() {
  return (
    <section className="bg-paper px-5 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-[clamp(2.2rem,6vw,3.8rem)] font-black tracking-tight text-ink">
          先從這些開始。
        </h2>
        <p className="mt-4 max-w-xl text-lg text-ink/70">
          需要湊人才能開波的項目，優先支援。
        </p>
        <ul className="mt-14 divide-y divide-ink/15 border-y border-ink/15">
          {SPORTS.map((sport) => (
            <li
              key={sport.en}
              className="group flex items-baseline justify-between gap-4 py-5"
            >
              <span className="text-3xl font-black tracking-tight text-ink transition-colors duration-300 group-hover:text-court md:text-5xl">
                {sport.zh}
              </span>
              <span className="font-display text-lg tracking-[0.18em] text-ink/35 md:text-2xl">
                {sport.en.toUpperCase()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
