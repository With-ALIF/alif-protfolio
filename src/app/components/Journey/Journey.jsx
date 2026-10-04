"use client";

const circleClass = (label) =>
  `z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-blue-400 bg-zinc-950 font-bold text-white shadow-lg shadow-blue-950/40 ${
    label.length > 4 ? "text-[11px]" : "text-sm"
  }`;

function MilestoneCard({ milestone }) {
  return (
    <div className="h-full w-full rounded-lg border border-white/10 bg-zinc-900/70 p-4">
      <div className="space-y-3">
        {milestone.items.map((item) => (
          <div key={item.title}>
            <p className="text-sm font-semibold text-white">{item.title}</p>
            <p className="mt-0.5 text-xs leading-5 text-zinc-400">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Journey({ items }) {
  const list = items ?? [];
  const edge = list.length > 0 ? 100 / (list.length * 2) : 0;

  return (
    <section className="space-y-10 text-white">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-4xl font-bold tracking-normal text-blue-300 sm:text-5xl">Career path</p>
        <h2 className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">My Journey</h2>
        <div className="mt-4 flex items-center justify-center gap-1.5" aria-hidden="true">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
          <span className="ml-1 inline-block h-1 w-10 rounded-full bg-white" />
        </div>
      </div>

      {/* Mobile: vertical timeline (top to bottom) */}
      <div className="relative mx-auto w-full max-w-3xl space-y-6 before:absolute before:bottom-3 before:left-7 before:top-3 before:w-0.5 before:bg-blue-400/60 md:hidden">
        {list.map((milestone) => (
          <div key={milestone.label} className="relative flex items-start gap-4">
            <div className={circleClass(milestone.label)}>{milestone.label}</div>
            <div className="flex-1 pt-1">
              <MilestoneCard milestone={milestone} />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: horizontal timeline (left to right) */}
      <div className="relative mx-auto hidden w-full max-w-5xl md:block">
        <div className="relative flex gap-6">
          <div
            aria-hidden="true"
            className="absolute top-7 h-0.5 bg-blue-400/60"
            style={{ left: `${edge}%`, right: `${edge}%` }}
          />
          {list.map((milestone) => (
            <div key={milestone.label} className="relative flex flex-1 flex-col items-stretch">
              <div className="flex justify-center"><div className={circleClass(milestone.label)}>{milestone.label}</div></div>
              <div className="mt-4 flex w-full flex-1">
                <MilestoneCard milestone={milestone} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
