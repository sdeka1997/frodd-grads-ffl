import Link from 'next/link';
import { Scale, Trophy, Skull, TrendingUp, TrendingDown, CalendarDays, Users, ChevronRight } from 'lucide-react';
import type { SeasonWhatIf } from '@/utils/medianScoring';
import { SectionHeader, RealToMedian, PlaceDelta, ordinal } from '@/components/MedianShared';

interface Move {
  year: string;
  manager: string;
  real: number;
  median: number;
}

interface ManagerLedger {
  manager: string;
  seasons: number;
  realTitles: number;
  medianTitles: number;
  realSackos: number;
  medianSackos: number;
  /** Sum over seasons of places gained (positive = median scoring helps) */
  netPlaces: number;
}

// Left out of the manager table; still shown in each season's standings
const HIDDEN_FROM_LEDGER = ['Voldemort', 'Saiesh'];

function summarize(seasons: SeasonWhatIf[]) {
  const moves: Move[] = seasons.flatMap(s =>
    s.medianResult.finish.map((manager, i) => ({ year: s.year, manager, real: s.realFinish[manager], median: i + 1 })),
  );
  const byGain = [...moves].sort((a, b) => (b.real - b.median) - (a.real - a.median));

  const ledger = new Map<string, ManagerLedger>();
  for (const s of seasons) {
    const last = s.medianResult.finish.length;
    for (const m of moves.filter(x => x.year === s.year)) {
      const row = ledger.get(m.manager) ?? { manager: m.manager, seasons: 0, realTitles: 0, medianTitles: 0, realSackos: 0, medianSackos: 0, netPlaces: 0 };
      row.seasons++;
      if (m.real === 1) row.realTitles++;
      if (m.median === 1) row.medianTitles++;
      if (m.real === last) row.realSackos++;
      if (m.median === last) row.medianSackos++;
      row.netPlaces += m.real - m.median;
      ledger.set(m.manager, row);
    }
  }

  return {
    championsChanged: seasons.filter(s => s.medianResult.champion !== s.realChampion).length,
    sackosChanged: seasons.filter(s => s.medianResult.sacko !== s.realSacko).length,
    biggestClimb: byGain[0],
    biggestFall: byGain[byGain.length - 1],
    ledger: [...ledger.values()]
      .filter(r => !HIDDEN_FROM_LEDGER.includes(r.manager))
      .sort((a, b) => b.netPlaces - a.netPlaces || a.manager.localeCompare(b.manager)),
  };
}

function StatTile({ icon: Icon, iconClass, label, value, detail }: {
  icon: React.ElementType; iconClass: string; label: string; value: string; detail: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Icon className={`w-4 h-4 ${iconClass}`} />
        {label}
      </div>
      <div className="text-2xl font-extrabold text-slate-100 mt-2">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{detail}</div>
    </div>
  );
}

/** Real → median count; green when the change is good for the manager */
const countChange = (real: number, median: number, moreIsGood: boolean) =>
  real === median ? <span className="text-slate-400">{real}</span> : (
    <span>
      <span className="text-slate-500">{real}</span>
      <span className={`ml-1.5 font-bold ${(median > real) === moreIsGood ? 'text-emerald-400' : 'text-red-400'}`}>→ {median}</span>
    </span>
  );

export default function MedianLanding({ seasons }: { seasons: SeasonWhatIf[] }) {
  const { championsChanged, sackosChanged, biggestClimb, biggestFall, ledger } = summarize(seasons);

  return (
    <div className="space-y-6 md:space-y-10">
      <header className="border-b border-slate-800 pb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
          <Scale className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" />
          What If: Median Scoring
        </h1>
        <p className="mt-2 text-slate-500 text-xs md:text-lg md:text-slate-400 md:mt-4">
          What if every week, the top 6 scores earned an extra win and the bottom 6 an extra loss? Same scores, same schedule —
          every season replayed under its own playoff and Sacko rules with the new standings.
        </p>
      </header>

      {/* HEADLINES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatTile icon={Trophy} iconClass="text-yellow-400" label="Champions changed" value={`${championsChanged} of ${seasons.length}`} detail="seasons with a different champion" />
        <StatTile icon={Skull} iconClass="text-red-400" label="Sackos changed" value={`${sackosChanged} of ${seasons.length}`} detail="seasons with a different Sacko" />
        <StatTile
          icon={TrendingUp} iconClass="text-emerald-400" label="Biggest climb"
          value={`${biggestClimb.manager} ▲${biggestClimb.real - biggestClimb.median}`}
          detail={`${biggestClimb.year}: ${ordinal(biggestClimb.real)} → ${ordinal(biggestClimb.median)}`}
        />
        <StatTile
          icon={TrendingDown} iconClass="text-red-400" label="Biggest fall"
          value={`${biggestFall.manager} ▼${biggestFall.median - biggestFall.real}`}
          detail={`${biggestFall.year}: ${ordinal(biggestFall.real)} → ${ordinal(biggestFall.median)}`}
        />
      </div>

      {/* SEASONS */}
      <section>
        <SectionHeader icon={CalendarDays} iconClass="text-purple-400" title="Every Season" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {seasons.map(s => (
            <Link
              key={s.year}
              href={`/median/${s.year}`}
              className="group bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/40 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl font-extrabold">{s.year}</span>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <RealToMedian real={s.realChampion} median={s.medianResult.champion} />
                </div>
                <div className="flex items-start gap-2">
                  <Skull className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <RealToMedian real={s.realSacko} median={s.medianResult.sacko} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* MANAGERS */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8">
        <SectionHeader icon={Users} iconClass="text-blue-400" title="Who Median Scoring Helps" />
        <div className="overflow-x-auto -mx-6 md:mx-0">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-800">
                <th className="py-2 pl-6 md:pl-0 pr-3 font-medium">Manager</th>
                <th className="py-2 pr-3 font-medium text-right">Titles</th>
                <th className="py-2 pr-3 font-medium text-right">Sackos</th>
                <th className="py-2 pr-3 font-medium text-right">Seasons</th>
                <th className="py-2 pr-6 md:pr-0 font-medium text-right">Net places</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map(r => (
                <tr key={r.manager} className="border-b border-slate-800/60">
                  <td className="py-2.5 pl-6 md:pl-0 pr-3 font-medium">{r.manager}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">{countChange(r.realTitles, r.medianTitles, true)}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">{countChange(r.realSackos, r.medianSackos, false)}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums text-slate-400">{r.seasons}</td>
                  <td className="py-2.5 pr-6 md:pr-0 text-right tabular-nums"><PlaceDelta from={r.netPlaces} to={0} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Titles and Sackos show real → median. Net places adds up how many spots each manager would have gained or lost in the final standings across 2019–2025.
        </p>
      </section>
    </div>
  );
}
