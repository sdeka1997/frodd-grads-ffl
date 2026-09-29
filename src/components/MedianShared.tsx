// Presentational pieces shared by the median landing page (server) and season page (client).
import { Medal, Trash2 } from 'lucide-react';

export function SectionHeader({ icon: Icon, iconClass, title, children }: {
  icon: React.ElementType;
  iconClass: string;
  title: string;
  /** Optional controls shown on the right of the header */
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
        <Icon className={`w-6 h-6 shrink-0 ${iconClass}`} />
        {title}
      </h2>
      {children}
    </div>
  );
}

export const ordinal = (n: number) =>
  `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;

/** Places moved from `from` to `to`; up is good */
export function PlaceDelta({ from, to }: { from: number; to: number }) {
  const diff = from - to;
  if (diff === 0) return <span className="text-slate-600">—</span>;
  return diff > 0
    ? <span className="text-emerald-400 font-semibold">▲{diff}</span>
    : <span className="text-red-400 font-semibold">▼{-diff}</span>;
}

/* Finish badge, styled like the Seasons page */
export function FinishBadge({ place, last }: { place: number; last: number }) {
  const style =
    place === 1 ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20' :
    place === 2 ? 'bg-slate-300/10 text-slate-300 border border-slate-300/20' :
    place === 3 ? 'bg-amber-600/10 text-amber-600 border border-amber-600/20' :
    place === last ? 'bg-red-500/10 text-red-400 border border-red-400/20' :
    'bg-slate-800 text-slate-400';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${style}`}>
      {place <= 3 && <Medal className="w-3 h-3" />}
      {place === last && <Trash2 className="w-3 h-3" />}
      {ordinal(place)}
    </span>
  );
}

/** "Real → median" for a title; highlights the median name when it changed */
export function RealToMedian({ real, median }: { real: string; median: string }) {
  if (real === median) {
    return (
      <span className="text-slate-200 font-semibold">
        {real} <span className="text-xs font-normal text-slate-500">no change</span>
      </span>
    );
  }
  return (
    <span>
      <span className="line-through text-slate-500">{real}</span>
      <span className="ml-2 font-bold text-emerald-400">→ {median}</span>
    </span>
  );
}
