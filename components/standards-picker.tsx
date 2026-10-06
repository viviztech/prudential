"use client";

import { useState } from "react";
import { Search } from "lucide-react";

type StandardOption = { id: number; name: string; code: string };

export function StandardsPicker({ standards }: { standards: StandardOption[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const normalized = query.trim().toLocaleLowerCase();
  const shown = standards.filter((standard) =>
    `${standard.name} ${standard.code}`.toLocaleLowerCase().includes(normalized),
  );

  function toggle(id: number, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return <fieldset className="min-w-0">
    <legend className="text-sm font-bold text-[#0d2a3d]">Standards</legend>
    <p className="mt-1 text-xs text-[#607880]">Select each standard that needs its own certificate record.</p>
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <label className="relative min-w-[210px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#607880]" aria-hidden="true" />
        <span className="sr-only">Search standards</span>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or code" className="h-11 w-full rounded-lg border border-[#c7d4d6] bg-white pl-10 pr-3 text-sm text-[#0d2a3d] outline-none transition focus:border-[#08766f] focus:ring-2 focus:ring-[#08766f]/20" />
      </label>
      <span className="rounded-full bg-[#e7f3ef] px-3 py-1.5 text-xs font-bold text-[#086b65]" aria-live="polite">{selected.size} selected</span>
    </div>
    <div className="mt-3 max-h-80 overflow-y-auto rounded-xl border border-[#dce7e3] bg-white" aria-label="Available standards">
      {standards.map((standard) => {
        const visible = shown.some((item) => item.id === standard.id);
        return <label key={standard.id} className={visible ? "group flex min-h-12 cursor-pointer items-center gap-3 border-b border-[#edf1ef] px-4 py-2.5 last:border-b-0 hover:bg-[#f3f8f6] has-[:checked]:bg-[#eaf5f1]" : "hidden"}>
          <input type="checkbox" name="certificationIds" value={standard.id} checked={selected.has(standard.id)} onChange={(event) => toggle(standard.id, event.target.checked)} className="size-4 shrink-0 accent-[#08766f]" />
          <span className="min-w-0 flex-1 text-sm font-medium text-[#183742]">{standard.name}</span>
          <span className="shrink-0 text-[11px] font-semibold text-[#607880]">{standard.code}</span>
        </label>;
      })}
      {!shown.length ? <p className="px-4 py-6 text-center text-sm text-[#607880]">No matching standards. Try a different name or code.</p> : null}
    </div>
    <p className="mt-2 text-xs text-[#607880]" aria-live="polite">Showing {shown.length} of {standards.length} standards. Scroll to see more.</p>
  </fieldset>;
}
