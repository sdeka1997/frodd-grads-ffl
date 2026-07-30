'use client';

import { useState } from 'react';
import { ScrollText, Trophy, CalendarDays, Skull, Info } from 'lucide-react';
import { rulesYears, type RulesYear } from '@/data/rules';

function SectionHeader({ icon: Icon, iconClass, title }: { icon: React.ElementType; iconClass: string; title: string }) {
  return (
    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 mb-4">
      <Icon className={`w-6 h-6 shrink-0 ${iconClass}`} />
      {title}
    </h2>
  );
}

/* ---------------- Diagrams ---------------- */

function RegularSeasonDiagram({ data }: { data: RulesYear }) {
  const doubles = 3; // flex opponents played twice
  const singles = data.regularSeasonWeeks - 2 * doubles; // opponents played once
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-6 md:gap-x-8">
      {/* 8 opponents, once */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-1.5">
          {Array.from({ length: singles }, (_, i) => (
            <div key={i} className="w-3.5 h-3.5 rounded-full border-2 border-emerald-400" />
          ))}
        </div>
        <div className="text-xs text-slate-400 text-center">
          <span className="font-bold text-emerald-400">{singles} opponents</span> × 1
        </div>
      </div>

      <span className="text-2xl font-light text-slate-600">+</span>

      {/* 3 flex opponents, twice */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-1.5">
          {Array.from({ length: doubles }, (_, i) => (
            <div key={i} className="w-3.5 h-3.5 rounded-full border-2 border-purple-400 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            </div>
          ))}
        </div>
        <div className="text-xs text-slate-400 text-center">
          <span className="font-bold text-purple-400">{doubles} flex opponents</span> × 2
        </div>
      </div>

      <span className="text-2xl font-light text-slate-600">=</span>

      {/* Result */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="px-4 py-2 rounded-lg border border-emerald-400/40 bg-emerald-400/10 text-emerald-400 font-extrabold text-lg leading-none">
          {data.regularSeasonWeeks} games
        </div>
        <div className="text-xs text-slate-500">{data.regularSeasonWeeks}-week regular season</div>
      </div>
    </div>
  );
}

/* One team slot in a bracket: a writing line with the seed written above it, March Madness style */
function TeamLine({ x, y, label, color = '#cbd5e1', italic = false }: { x: number; y: number; label?: string; color?: string; italic?: boolean }) {
  return (
    <g>
      {label && (
        <text x={x + 2} y={y - 5} fill={color} fontSize={12} fontWeight={italic ? 500 : 700} fontStyle={italic ? 'italic' : 'normal'}>
          {label}
        </text>
      )}
      <line x1={x} y1={y} x2={x + 132} y2={y} stroke="#475569" strokeWidth={1.5} />
    </g>
  );
}

/* A matchup: two stacked team lines joined at the right edge */
function BracketSlot({ x, c, a, b, color = '#34d399' }: { x: number; c: number; a?: string; b?: string; color?: string }) {
  const top = c - 10;
  const bot = c + 14;
  const bIsQuestion = b === '?';
  return (
    <g>
      <TeamLine x={x} y={top} label={a} color={color} />
      <TeamLine x={x} y={bot} label={b} color={bIsQuestion ? '#64748b' : color} italic={bIsQuestion} />
      <line x1={x + 132} y1={top} x2={x + 132} y2={bot} stroke="#475569" strokeWidth={1.5} />
    </g>
  );
}

function PlayoffBracket() {
  // Columns: QF x=20, SF x=256, Final x=492 (box w=132 h=36)
  // Top half: seeds 1 & 4 · bottom half: seeds 2 & 3 — seeds 1/2 pick from 5–8
  const qf: [string, string][] = [['1', '?'], ['4', '?'], ['2', '?'], ['3', '?']];
  const qfY = [78, 140, 230, 292]; // QF box center ys
  const sf = [109, 261]; // SF box center ys
  const f = 185; // Final center y
  const elbow1 = 204; // QF->SF elbow x
  const elbow2 = 440; // SF->Final elbow x
  const path = (x1: number, y1: number, xe: number, y2: number, x2: number) =>
    `M${x1},${y1} H${xe} V${y2} H${x2}`;
  return (
    <svg viewBox="0 0 664 336" className="block mx-auto h-64 md:h-80 w-auto max-w-full" role="img" aria-label="Playoff bracket: quarterfinals week 15, semifinals week 16, championship week 17">
      {/* Column labels */}
      <text x={86} y={16} textAnchor="middle" fill="#64748b" fontSize={12} fontWeight={600}>Week 15</text>
      <text x={322} y={16} textAnchor="middle" fill="#64748b" fontSize={12} fontWeight={600}>Week 16</text>
      <text x={558} y={16} textAnchor="middle" fill="#64748b" fontSize={12} fontWeight={600}>Week 17</text>

      {/* Connectors */}
      <g stroke="#475569" strokeWidth={1.5} fill="none">
        <path d={path(152, qfY[0], elbow1, sf[0], 256)} />
        <path d={path(152, qfY[1], elbow1, sf[0], 256)} />
        <path d={path(152, qfY[2], elbow1, sf[1], 256)} />
        <path d={path(152, qfY[3], elbow1, sf[1], 256)} />
        <path d={path(388, sf[0], elbow2, f, 492)} />
        <path d={path(388, sf[1], elbow2, f, 492)} />
      </g>

      {/* Slots — seeds written on the line; later rounds left blank */}
      {qf.map(([a, b], i) => <BracketSlot key={i} x={20} c={qfY[i]} a={a} b={b} />)}
      {sf.map((c, i) => <BracketSlot key={i} x={256} c={c} />)}
      <BracketSlot x={492} c={f} />
      <text x={634} y={f} textAnchor="start" dominantBaseline="central" fontSize={18}>🏆</text>
    </svg>
  );
}

function SackoBracket() {
  // Same 336-tall viewBox as the playoff bracket; bowl aligned with championship y=185
  const sfY = [109, 261];
  const bowl = 185;
  const elbow = 226;
  return (
    <svg viewBox="0 0 472 336" className="block mx-auto h-64 md:h-80 w-auto max-w-full" role="img" aria-label="Sacko bracket: 9 vs 12 and 10 vs 11 semifinals week 15, losers advance to the Sacko Bowl week 16">
      <text x={86} y={16} textAnchor="middle" fill="#64748b" fontSize={12} fontWeight={600}>Week 15</text>
      <text x={366} y={16} textAnchor="middle" fill="#64748b" fontSize={12} fontWeight={600}>Week 16</text>

      {/* Dashed connectors — losers advance */}
      <g stroke="#f87171" strokeWidth={1.5} strokeDasharray="5 4" fill="none" opacity={0.7}>
        <path d={`M152,${sfY[0]} H${elbow} V${bowl} H300`} />
        <path d={`M152,${sfY[1]} H${elbow} V${bowl} H300`} />
      </g>
      <text x={140} y={bowl} textAnchor="middle" dominantBaseline="central" fill="#f87171" fontSize={10} fontStyle="italic">losers advance</text>

      <BracketSlot x={20} c={sfY[0]} a="9" b="12" color="#f87171" />
      <BracketSlot x={20} c={sfY[1]} a="10" b="11" color="#f87171" />
      <BracketSlot x={300} c={bowl} />
      <text x={440} y={bowl} textAnchor="start" dominantBaseline="central" fontSize={18}>🤡</text>
    </svg>
  );
}

/* ---------------- Page ---------------- */

export default function RulesExplorer() {
  const [year, setYear] = useState(rulesYears[0].year);
  const [yearOpen, setYearOpen] = useState(false);
  const data = rulesYears.find(y => y.year === year) ?? rulesYears[0];

  return (
    <div className="space-y-6 md:space-y-10">
      <header className="border-b border-slate-800 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
            <ScrollText className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" />
            League Rules
          </h1>

          {/* Year dropdown */}
          <div className="relative self-start sm:self-auto">
            <button
              onClick={() => setYearOpen(o => !o)}
              className="flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors"
            >
              {year}
              <svg
                className={`w-4 h-4 shrink-0 transition-transform duration-200 ${yearOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {yearOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setYearOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 min-w-24 bg-slate-900 border border-slate-800 rounded-md shadow-xl overflow-hidden">
                  {rulesYears.map(y => (
                    <button
                      key={y.year}
                      onClick={() => { setYear(y.year); setYearOpen(false); }}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-800 hover:text-emerald-400 ${y.year === year ? 'text-emerald-400 bg-slate-800/60' : 'text-slate-300'}`}
                    >
                      {y.year}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <p className="mt-2 text-slate-500 text-xs md:text-lg md:text-slate-400 md:mt-4">
          The official rules of the league — fees, payouts, schedule, and the Sacko.
        </p>
      </header>

      {/* REWARDS & FEES */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8">
        <SectionHeader icon={Trophy} iconClass="text-yellow-400" title="League Rewards & Fees" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:flex lg:flex-nowrap">
          {data.rewards.length > 0 ? (
            data.rewards.map((r) => (
              <div key={r.label} className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 lg:flex-1">
                <div className="text-xs text-slate-400">{r.label}</div>
                <div className="text-2xl font-extrabold text-emerald-400 mt-1">{r.value}</div>
                {r.note && <div className="text-xs text-slate-500 mt-1">{r.note}</div>}
              </div>
            ))
          ) : (
            <div className="col-span-full text-sm text-slate-500 italic">TBD</div>
          )}
        </div>
        <div className="mt-4 space-y-2">
          {data.notes?.map((note, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-400">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>{note}</span>
            </div>
          ))}
          {data.trophyNote && (
            <div className="flex items-start gap-2 text-sm text-slate-400">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>{data.trophyNote}</span>
            </div>
          )}
        </div>
      </section>

      {/* LEAGUE SCHEDULE */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8">
        <SectionHeader icon={CalendarDays} iconClass="text-purple-400" title="League Schedule" />
        <p className="text-slate-300 text-sm md:text-base mb-6">
          This year {data.teamCount} teams will compete in a {data.regularSeasonWeeks}-week regular season followed by a {data.postseasonWeeks}-week postseason.
        </p>

        <div className="space-y-8">
          {/* Regular season */}
          <div>
            <h3 className="text-base md:text-lg font-bold text-slate-200 mb-4">Regular Season</h3>
            {data.useDiagrams ? (
              <RegularSeasonDiagram data={data} />
            ) : data.regularSeasonDetail ? (
              <p className="text-sm text-slate-400">{data.regularSeasonDetail}</p>
            ) : (
              <p className="text-sm text-slate-500 italic">TBD</p>
            )}
          </div>

          {/* Playoffs + Sacko side by side */}
          <div className="border-t border-slate-800 pt-8 grid gap-8 lg:grid-cols-2">
            {/* Playoffs */}
            <div>
              <h3 className="text-base md:text-lg font-bold text-slate-200 mb-1">Playoffs</h3>
              <p className="text-sm text-slate-400 mb-5">
                The top {data.playoffTeamCount} teams advance to a single-elimination playoff.
              </p>
              {data.useDiagrams ? (
                <>
                  <PlayoffBracket />
                  <p className="mt-3 text-xs text-slate-500">
                    Seeds 1 &amp; 2 choose their Week 15 opponent from seeds 5–8.
                  </p>
                </>
              ) : data.playoffWeeks.length > 0 ? (
                <ul className="space-y-2">
                  {data.playoffWeeks.map((w) => (
                    <li key={w.week} className="flex gap-3 text-sm">
                      <span className="shrink-0 font-bold text-emerald-400 w-20">{w.week}</span>
                      <span className="text-slate-300">{w.detail}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic">TBD</p>
              )}
            </div>

            {/* Sacko */}
            <div className="border-t border-slate-800 pt-8 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-8">
              <h3 className="text-base md:text-lg font-bold text-slate-200 mb-1">Sacko</h3>
              <p className="text-sm text-slate-400 mb-5">
                The {data.sackoTeamCount} non-playoff teams play in a Sacko tournament.
              </p>
              {data.useDiagrams ? (
                <SackoBracket />
              ) : data.sackoWeeks.length > 0 ? (
                <ul className="space-y-2">
                  {data.sackoWeeks.map((w) => (
                    <li key={w.week} className="flex gap-3 text-sm">
                      <span className="shrink-0 font-bold text-red-400 w-20">{w.week}</span>
                      <span className="text-slate-300">{w.detail}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic">TBD</p>
              )}
              {data.sackoNote && (
                <p className="mt-3 text-xs text-slate-500">{data.sackoNote}</p>
              )}
            </div>
          </div>

          {/* Consolation (2021 only) */}
          {data.consolation && (
            <div className="border-t border-slate-800 pt-8">
              <h3 className="text-base md:text-lg font-bold text-slate-200 mb-1">{data.consolation.title}</h3>
              <p className="text-sm text-slate-400 mb-3">{data.consolation.detail}</p>
              <ul className="space-y-2">
                {data.consolation.weeks.map((w) => (
                  <li key={w.week} className="flex gap-3 text-sm">
                    <span className="shrink-0 font-bold text-blue-400 w-20">{w.week}</span>
                    <span className="text-slate-300">{w.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* SACKO PUNISHMENT */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8">
        <SectionHeader icon={Skull} iconClass="text-red-400" title="Sacko Punishment" />
        <p className="text-slate-300 text-sm md:text-base">
          {data.sackoDescription ?? data.sackoPunishment}
        </p>
        <p className="mt-2 text-sm md:text-base font-bold text-red-400">
          {data.sackoWarning}
        </p>
      </section>
    </div>
  );
}
