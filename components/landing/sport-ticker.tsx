const ITEMS = [
  "籃球 BASKETBALL",
  "匹克球 PICKLEBALL",
  "足球 FOOTBALL",
  "羽毛球 BADMINTON",
  "排球 VOLLEYBALL",
  "網球 TENNIS",
  "乒乓球 TABLE TENNIS",
];

export function SportTicker() {
  const loop = [...ITEMS, ...ITEMS];

  return (
    <div className="overflow-hidden border-y-[6px] border-line bg-ink py-4">
      <div className="animate-ticker flex w-max gap-0 whitespace-nowrap">
        {loop.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="px-8 font-display text-3xl tracking-[0.12em] text-line md:text-4xl"
          >
            {item}
            <span className="ml-8 text-court">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}
