'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Scale, Trophy, Skull, ListOrdered, AlertTriangle, Info, ArrowLeft } from 'lucide-react';
import type { SeasonWhatIf, PlayedGame, GameSide, Bye, BracketName } from '@/utils/medianScoring';
import { SectionHeader, PlaceDelta, FinishBadge, ordinal } from '@/components/MedianShared';

/* Real vs median outcome for one title (champion or Sacko) */
function OutcomeCard({ label, icon: Icon, iconClass, real, whatIf }: {
  label: string; icon: React.ElementType; iconClass: string; real: string; whatIf: string;
}) {
  const changed = whatIf !== real;
  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 md:p-5">
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
        <Icon className={`w-4 h-4 ${iconClass}`} />
        {label}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500">Real</div>
          <div className="text-lg md:text-xl font-bold text-slate-200 mt-0.5">{real}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500">With median</div>
          <div className={`text-lg md:text-xl font-extrabold mt-0.5 ${changed ? 'text-emerald-400' : 'text-slate-200'}`}>
            {whatIf}
            {!changed && <span className="block text-xs font-normal text-slate-500">no change</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* A bracket laid out as one column per week; works for any year's format */
function BracketView({ games, byes, finalMark }: {
  games: PlayedGame[];
  byes: Bye[];
  /** Emoji shown next to this manager in the last week's games (champion or Sacko) */
  finalMark?: { manager: string; emoji: string };
}) {
  const weeks = [...new Set([...games.map(g => g.week), ...byes.map(b => b.week)])].sort((a, b) => a - b);
  const lastWeek = weeks[weeks.length - 1];

  const side = (g: PlayedGame, s: GameSide) => {
    const won = s.manager === g.winner;
    return (
      <div className={`flex items-center justify-between gap-2 px-3 py-1.5 ${won ? 'text-slate-100' : 'text-slate-500'}`}>
        <span className="flex items-center gap-2 min-w-0">
          <span className="w-4 shrink-0 text-right text-xs text-slate-500 tabular-nums">{s.seed}</span>
          <span className={`truncate ${won ? 'font-semibold' : ''}`}>{s.manager}</span>
          {g.week === lastWeek && finalMark?.manager === s.manager && <span>{finalMark.emoji}</span>}
        </span>
        <span className={`tabular-nums text-sm ${won ? 'font-semibold' : ''}`}>{s.points.toFixed(2)}</span>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
      <div className="flex gap-3 min-w-max">
        {weeks.map(week => {
          const weekByes = byes.filter(b => b.week === week);
          return (
            <div key={week} className="w-40 flex flex-col">
              <div className="text-xs font-semibold text-slate-500 text-center mb-3">Week {week}</div>
              {weekByes.length > 0 && (
                <div className="mb-3 rounded-lg border border-dashed border-slate-700 px-3 py-2 text-xs text-slate-400">
                  <span className="uppercase tracking-wide text-[11px] text-slate-500">Bye</span>
                  {weekByes.map(b => (
                    <div key={b.manager} className="flex items-center gap-2 mt-1">
                      <span className="w-4 text-right text-slate-500 tabular-nums">{b.seed}</span>
                      <span className="text-slate-300">{b.manager}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex-1 flex flex-col justify-around gap-3">
                {games.filter(g => g.week === week).map((g, i) => (
                  <div key={i} className="rounded-lg border border-slate-800 bg-slate-950/60 overflow-hidden text-sm">
                    <div className="px-3 pt-2 pb-0.5 text-[11px] uppercase tracking-wide text-slate-500 truncate">{g.round}</div>
                    {side(g, g.a)}
                    <div className="border-t border-slate-800/60" />
                    {side(g, g.b)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function YearDropdown({ year, years }: { year: string; years: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative self-start sm:self-auto">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors"
      >
        {year}
        <svg
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 min-w-24 bg-slate-900 border border-slate-800 rounded-md shadow-xl overflow-hidden">
            {years.map(y => (
              <Link
                key={y}
                href={`/median/${y}`}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2 text-sm transition-colors hover:bg-slate-800 hover:text-emerald-400 ${y === year ? 'text-emerald-400 bg-slate-800/60' : 'text-slate-300'}`}
              >
                {y}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FinalStandingsTable({ data }: { data: SeasonWhatIf }) {
  const median = data.medianResult;
  return (
    <>
      <div className="overflow-x-auto -mx-6 md:mx-0">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="text-left text-xs text-slate-500 border-b border-slate-800">
              <th className="py-2 pl-6 md:pl-0 pr-3 font-medium">Finish</th>
              <th className="py-2 pr-3 font-medium">Manager</th>
              <th className="py-2 pr-3 font-medium text-right">Record</th>
              <th className="py-2 pr-3 font-medium text-right">PF</th>
              <th className="py-2 pr-6 md:pr-0 font-medium text-right">Real finish</th>
            </tr>
          </thead>
          <tbody>
            {median.finish.map((manager, i) => {
              const row = median.standings.find(r => r.manager === manager)!;
              const realPlace = data.realFinish[manager];
              return (
                <tr key={manager} className="border-b border-slate-800/60">
                  <td className="py-2.5 pl-6 md:pl-0 pr-3"><FinishBadge place={i + 1} last={median.finish.length} /></td>
                  <td className="py-2.5 pr-3 font-medium">{manager}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums font-semibold">{row.wins}-{row.losses}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums text-slate-400">{row.pf.toFixed(2)}</td>
                  <td className="py-2.5 pr-6 md:pr-0 text-right tabular-nums">
                    <span className="text-slate-500 mr-2">{ordinal(realPlace)}</span>
                    <PlaceDelta from={realPlace} to={i + 1} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-500">Record is the regular-season record with median results counted.</p>
    </>
  );
}

function RegularSeasonTable({ data }: { data: SeasonWhatIf }) {
  const realSeed = new Map(data.real.map(r => [r.manager, r.seed]));
  return (
    <>
      <div className="overflow-x-auto -mx-6 md:mx-0">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-left text-xs text-slate-500 border-b border-slate-800">
              <th className="py-2 pl-6 md:pl-0 pr-3 font-medium">Seed</th>
              <th className="py-2 pr-3 font-medium">Manager</th>
              <th className="py-2 pr-3 font-medium text-right">Record</th>
              <th className="py-2 pr-3 font-medium text-right">H2H</th>
              <th className="py-2 pr-3 font-medium text-right">vs Median</th>
              <th className="py-2 pr-3 font-medium text-right">PF</th>
              <th className="py-2 pr-6 md:pr-0 font-medium text-right">Real seed</th>
            </tr>
          </thead>
          <tbody>
            {data.medianResult.standings.map(r => (
              <tr
                key={r.manager}
                className={`border-b border-slate-800/60 ${r.seed === data.playoffTeamCount ? 'border-b-2 border-b-emerald-500/40' : ''} ${r.seed > data.playoffTeamCount ? 'text-slate-400' : ''}`}
              >
                <td className="py-2.5 pl-6 md:pl-0 pr-3 font-bold tabular-nums">{r.seed}</td>
                <td className="py-2.5 pr-3 font-medium">{r.manager}</td>
                <td className="py-2.5 pr-3 text-right tabular-nums font-semibold">{r.wins}-{r.losses}</td>
                <td className="py-2.5 pr-3 text-right tabular-nums text-slate-400">{r.h2hWins}-{r.h2hLosses}</td>
                <td className="py-2.5 pr-3 text-right tabular-nums text-slate-400">{r.medianWins}-{r.medianLosses}</td>
                <td className="py-2.5 pr-3 text-right tabular-nums text-slate-400">{r.pf.toFixed(2)}</td>
                <td className="py-2.5 pr-6 md:pr-0 text-right tabular-nums">
                  <span className="text-slate-500 mr-2">{realSeed.get(r.manager)}</span>
                  <PlaceDelta from={realSeed.get(r.manager)!} to={r.seed} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Seeds use {data.year}’s rules with median results counted. The line marks the playoff cutoff (top {data.playoffTeamCount}).
      </p>
    </>
  );
}

export default function MedianSeason({ data, years }: { data: SeasonWhatIf; years: string[] }) {
  const [standingsView, setStandingsView] = useState<'final' | 'regular'>('final');
  const median = data.medianResult;
  const of = (b: BracketName) => ({ games: median.games.filter(g => g.bracket === b), byes: median.byes.filter(x => x.bracket === b) });
  // Bracket and ladder Sackos fit beside the playoff bracket; round-robin years stack with their table
  const sideBySide = !median.sackoTable;

  return (
    <div className="space-y-6 md:space-y-10">
      <header className="border-b border-slate-800 pb-8">
        <Link href="/median" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-emerald-400 transition-colors mb-3">
          <ArrowLeft className="w-4 h-4" />
          All seasons
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
            <Scale className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" />
            What If: Median Scoring
          </h1>
          <YearDropdown year={data.year} years={years} />
        </div>
      </header>

      {/* OUTCOME */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8">
        <SectionHeader icon={Trophy} iconClass="text-yellow-400" title={`${data.year} Outcome`} />
        <div className="grid gap-3 md:grid-cols-2">
          <OutcomeCard label="Champion" icon={Trophy} iconClass="text-yellow-400" real={data.realChampion} whatIf={median.champion} />
          <OutcomeCard label="Sacko" icon={Skull} iconClass="text-red-400" real={data.realSacko} whatIf={median.sacko} />
        </div>
        <div className="mt-4 text-sm">
          <div className="flex items-start gap-2 text-slate-400">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span><span className="font-semibold text-slate-300">{data.year} rules:</span> {data.formatNote}</span>
          </div>
          {median.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-amber-300 mt-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PLAYOFF + SACKO */}
      <div className={sideBySide ? 'grid gap-6 md:gap-10 xl:grid-cols-2' : 'space-y-6 md:space-y-10'}>
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 min-w-0">
          <SectionHeader icon={Trophy} iconClass="text-yellow-400" title="Playoff Bracket" />
          <BracketView {...of('playoff')} finalMark={{ manager: median.champion, emoji: '🏆' }} />
        </section>
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 min-w-0">
          <SectionHeader icon={Skull} iconClass="text-red-400" title="Sacko" />
          <BracketView {...of('sacko')} finalMark={median.sackoTable ? undefined : { manager: median.sacko, emoji: '🤡' }} />
          {median.sackoTable && (
            <div className="mt-6 overflow-x-auto -mx-6 md:mx-0">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-slate-800">
                    <th className="py-2 pl-6 md:pl-0 pr-3 font-medium">Manager</th>
                    <th className="py-2 pr-3 font-medium text-right">Regular season</th>
                    <th className="py-2 pr-3 font-medium text-right">Round robin</th>
                    <th className="py-2 pr-3 font-medium text-right">Total</th>
                    <th className="py-2 pr-6 md:pr-0 font-medium text-right">PF</th>
                  </tr>
                </thead>
                <tbody>
                  {median.sackoTable.map(r => (
                    <tr key={r.manager} className={`border-b border-slate-800/60 ${r.manager === median.sacko ? 'text-red-400' : ''}`}>
                      <td className="py-2.5 pl-6 md:pl-0 pr-3 font-medium">
                        <span className="text-xs text-slate-500 mr-2 tabular-nums">{r.seed}</span>
                        {r.manager}{r.manager === median.sacko && ' 🤡'}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-slate-400">{r.regWins}-{r.regLosses}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-slate-400">{r.rrWins}-{r.rrLosses}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums font-semibold">{r.wins}-{r.losses}</td>
                      <td className="py-2.5 pr-6 md:pr-0 text-right tabular-nums text-slate-400">{r.pf.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-slate-500">Worst combined record takes the Sacko; ties go to whoever scored fewer total points.</p>
            </div>
          )}
        </section>
      </div>

      {/* STANDINGS — final / regular season toggle */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8">
        <SectionHeader icon={ListOrdered} iconClass="text-purple-400" title="Standings">
          <div className="inline-flex rounded-lg border border-slate-800 bg-slate-950/60 p-1 text-sm">
            {([['final', 'Final'], ['regular', 'Regular season']] as const).map(([view, label]) => (
              <button
                key={view}
                onClick={() => setStandingsView(view)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${standingsView === view ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </SectionHeader>
        {standingsView === 'final' ? <FinalStandingsTable data={data} /> : <RegularSeasonTable data={data} />}
      </section>
    </div>
  );
}
