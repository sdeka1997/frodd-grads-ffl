'use client';

import { useEffect, useRef, useState } from 'react';
import { Dices, Shuffle, Copy, Check, RefreshCw, AlertTriangle, Info } from 'lucide-react';
import {
  FLEX_WEEKS, TIER_SIZE, drawSchedule, scheduleAt, totalSchedules, randomSeed, tierOf, matchupKind,
  type Schedule, type Matchup, type MatchupKind,
} from '@/utils/flexSchedule';
import {
  fetchRoundRobinStandings, rankTeams, ROUND_ROBIN_WEEKS, SLEEPER_LEAGUE_IDS,
  type StandingsResult, type RankBy, type TeamStanding,
} from '@/utils/sleeperStandings';

const SEASON = Object.keys(SLEEPER_LEAGUE_IDS).sort().reverse()[0];
const SPIN_MS = 2800;

const TIERS = [
  { name: 'Tier 1', text: 'text-amber-300', bg: 'bg-amber-400/10', border: 'border-amber-400/40', dot: 'bg-amber-400' },
  { name: 'Tier 2', text: 'text-sky-300', bg: 'bg-sky-400/10', border: 'border-sky-400/40', dot: 'bg-sky-400' },
  { name: 'Tier 3', text: 'text-rose-300', bg: 'bg-rose-400/10', border: 'border-rose-400/40', dot: 'bg-rose-400' },
];

const KIND_ORDER: MatchupKind[] = ['in-tier', '1v2', '1v3', '2v3'];
const KIND_LABEL: Record<MatchupKind, string> = { 'in-tier': 'In-tier', '1v2': 'T1 vs T2', '1v3': 'T1 vs T3', '2v3': 'T2 vs T3' };

const fmt = (n: number) => n.toLocaleString('en-US');
const fmtPts = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const record = (t: TeamStanding) => `${t.wins}-${t.losses}${t.ties ? `-${t.ties}` : ''}`;

const sortWeek = (week: Matchup[]) =>
  [...week].sort((x, y) => KIND_ORDER.indexOf(matchupKind(x)) - KIND_ORDER.indexOf(matchupKind(y)) || x[0] - y[0]);

type Loaded = { reloadTick: number; data?: StandingsResult; error?: string };
type Draw = { seed: number; index: number; total: number; schedule: Schedule };

export default function FlexScheduleGenerator() {
  const [rankBy, setRankBy] = useState<RankBy>('pf');
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  const [seedInput, setSeedInput] = useState('');
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'done'>('idle');
  const [display, setDisplay] = useState<{ index: number; schedule: Schedule } | null>(null);
  const [result, setResult] = useState<Draw | null>(null);
  const [revealKey, setRevealKey] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchRoundRobinStandings(SEASON)
      .then(data => { if (!cancelled) setLoaded({ reloadTick, data }); })
      .catch(err => { if (!cancelled) setLoaded({ reloadTick, error: String(err?.message ?? err) }); });
    return () => { cancelled = true; };
  }, [reloadTick]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const loading = !loaded || loaded.reloadTick !== reloadTick;
  const standings = loading ? null : loaded.data ?? null;
  const error = loading ? null : loaded.error ?? null;
  const ranked = standings ? rankTeams(standings.teams, rankBy) : [];
  const ready = ranked.length === TIER_SIZE * 3;
  const provisional = standings ? standings.weeksCounted < ROUND_ROBIN_WEEKS : false;

  const resetDraw = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPhase('idle'); setDisplay(null); setResult(null);
  };

  const generate = () => {
    if (!ready || phase === 'spinning') return;
    const parsed = parseInt(seedInput, 10);
    const seed = Number.isFinite(parsed) && parsed >= 0 ? parsed : randomSeed();
    setSeedInput(String(seed));
    const final = drawSchedule(seed);
    const total = totalSchedules();

    setResult(null);
    setPhase('spinning');
    const start = performance.now();
    let lastFlip = 0;
    const tick = (now: number) => {
      const t = (now - start) / SPIN_MS;
      if (t >= 1) {
        setDisplay({ index: final.index, schedule: final.schedule });
        setResult(final);
        setPhase('done');
        setRevealKey(k => k + 1);
        rafRef.current = null;
        return;
      }
      // Flip fast at first, then slow down like a slot machine
      const interval = 35 + 320 * t * t;
      if (now - lastFlip >= interval) {
        lastFlip = now;
        const k = Math.floor(Math.random() * total);
        setDisplay({ index: k, schedule: scheduleAt(k) });
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const copyText = () => {
    if (!result || !standings) return;
    const name = (i: number) => ranked[i].manager;
    const lines = [
      `Frodd FFL ${standings.season} Flex Schedule`,
      `Seed ${result.seed} · schedule #${fmt(result.index + 1)} of ${fmt(result.total)}`,
      `Tiers by ${rankBy === 'pf' ? 'points for' : 'record'} through week ${standings.weeksCounted}:`,
      ...TIERS.map((t, ti) => `  ${t.name}: ${ranked.slice(ti * TIER_SIZE, ti * TIER_SIZE + TIER_SIZE).map(x => x.manager).join(', ')}`),
      '',
      ...result.schedule.flatMap((week, wi) => [
        `Week ${FLEX_WEEKS[wi]}:`,
        ...sortWeek(week).map(([a, b]) => `  ${name(a)} vs ${name(b)}`),
      ]),
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const spinning = phase === 'spinning';
  const shown = display?.schedule ?? null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Shuffle className="w-7 h-7 text-emerald-400" />
          <h1 className="text-3xl font-extrabold tracking-tight">Flex Schedule Generator</h1>
        </div>
        <p className="text-slate-400 max-w-3xl">
          Weeks 1–{ROUND_ROBIN_WEEKS} are a round robin. For weeks 12–14 the league splits into three tiers of four
          and every team plays one opponent from each other tier and one from its own. Tiers come live from Sleeper;
          the schedule is drawn at random from every schedule that fits the rules.
        </p>
      </header>

      {/* Controls */}
      <section className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <span className="block text-xs text-slate-400">Rank tiers by</span>
          <div className="inline-flex rounded-md border border-slate-700 overflow-hidden text-sm">
            {(['pf', 'record'] as RankBy[]).map(r => (
              <button
                key={r}
                disabled={spinning}
                onClick={() => { setRankBy(r); resetDraw(); }}
                className={`px-3 py-2 transition-colors ${rankBy === r ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
              >
                {r === 'pf' ? 'Points for' : 'Record'}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => { setReloadTick(t => t + 1); resetDraw(); }}
          disabled={spinning || loading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-slate-700 bg-slate-900 text-slate-300 hover:text-emerald-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh from Sleeper
        </button>
      </section>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> Couldn’t load standings from Sleeper: {error}
        </div>
      )}

      {/* Tiers */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Tiers</h2>
          {standings && (
            <span className={`text-xs px-2 py-1 rounded-full border ${provisional ? 'border-amber-500/40 text-amber-300 bg-amber-500/10' : 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'}`}>
              {provisional
                ? `Provisional · through week ${standings.weeksCounted} of ${ROUND_ROBIN_WEEKS}`
                : `Final · weeks 1–${ROUND_ROBIN_WEEKS}`}
            </span>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {TIERS.map((tier, ti) => (
            <div key={tier.name} className={`rounded-xl border ${tier.border} ${tier.bg} p-4`}>
              <div className={`text-sm font-bold ${tier.text} mb-3`}>{tier.name}</div>
              <ol className="space-y-1.5">
                {(ready ? ranked.slice(ti * TIER_SIZE, ti * TIER_SIZE + TIER_SIZE) : Array.from({ length: TIER_SIZE }, () => null)).map((t, j) => {
                  const idx = ti * TIER_SIZE + j;
                  return (
                    <li
                      key={t?.rosterId ?? j}
                      onMouseEnter={() => setHovered(idx)}
                      onMouseLeave={() => setHovered(null)}
                      className={`flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors ${hovered === idx ? 'bg-slate-800' : ''}`}
                    >
                      <span className="w-5 text-right text-xs text-slate-500 tabular-nums">{idx + 1}</span>
                      {t ? (
                        <>
                          <span className="flex-1 min-w-0">
                            <span className="block font-semibold text-slate-100 truncate">{t.manager}</span>
                            <span className="block text-xs text-slate-500 truncate">{t.teamName}</span>
                          </span>
                          <span className="text-right text-xs tabular-nums">
                            <span className={`block ${rankBy === 'pf' ? 'text-slate-200 font-semibold' : 'text-slate-400'}`}>{fmtPts(t.pf)}</span>
                            <span className={`block ${rankBy === 'record' ? 'text-slate-200 font-semibold' : 'text-slate-500'}`}>{record(t)}</span>
                          </span>
                        </>
                      ) : (
                        <span className="flex-1 h-8 rounded bg-slate-800/60 animate-pulse" />
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* Draw */}
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-5">
        <div className="flex flex-wrap items-end gap-3">
          <label className="space-y-1">
            <span className="block text-xs text-slate-400">Seed (blank = random)</span>
            <div className="flex">
              <input
                inputMode="numeric"
                value={seedInput}
                onChange={e => setSeedInput(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 67"
                disabled={spinning}
                className="w-32 bg-slate-950 border border-slate-700 rounded-l-md px-3 py-2 text-sm tabular-nums"
              />
              <button
                onClick={() => setSeedInput(String(randomSeed()))}
                disabled={spinning}
                aria-label="Roll a random seed"
                className="px-3 border border-l-0 border-slate-700 rounded-r-md bg-slate-800 text-slate-300 hover:text-emerald-300"
              >
                <Dices className="w-4 h-4" />
              </button>
            </div>
          </label>
          <button
            onClick={generate}
            disabled={!ready || spinning}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shuffle className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
            {spinning ? 'Drawing…' : phase === 'done' ? 'Draw again' : 'Generate schedule'}
          </button>
          {result && (
            <button
              onClick={copyText}
              className="inline-flex items-center gap-2 px-3 py-2.5 text-sm rounded-md border border-slate-700 text-slate-300 hover:text-emerald-300"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy for group chat'}
            </button>
          )}
        </div>

        {/* Schedule odometer */}
        <div className="text-sm text-slate-400">
          {display ? (
            <span>
              Schedule{' '}
              <span className={`font-mono text-lg font-bold tabular-nums ${spinning ? 'text-slate-300' : 'text-emerald-300'}`}>
                #{fmt(display.index + 1)}
              </span>{' '}
              of {fmt(10_492_416)} valid schedules
              {result && <> · seed <span className="font-mono text-slate-200">{result.seed}</span></>}
            </span>
          ) : (
            <span>There are {fmt(10_492_416)} schedules that satisfy the rules. Press generate to draw one.</span>
          )}
        </div>

        {/* Weeks */}
        {shown && ready && (
          <div className="grid gap-4 md:grid-cols-3">
            {shown.map((week, wi) => (
              <div key={wi} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Week {FLEX_WEEKS[wi]}</div>
                <ul className="space-y-1.5">
                  {sortWeek(week).map(([a, b], mi) => {
                    const kind = matchupKind([a, b]);
                    const lit = hovered === null || hovered === a || hovered === b;
                    return (
                      <li
                        key={spinning ? mi : `${revealKey}-${a}-${b}`}
                        className={`flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-2.5 py-2 text-sm transition-opacity ${spinning ? 'opacity-60 blur-[0.5px]' : 'flex-reveal'} ${lit ? '' : 'opacity-25'}`}
                        style={spinning ? undefined : { animationDelay: `${wi * 450 + mi * 90}ms` }}
                      >
                        <TeamChip team={a} name={ranked[a].manager} onHover={setHovered} />
                        <span className="text-slate-600 text-xs">vs</span>
                        <TeamChip team={b} name={ranked[b].manager} onHover={setHovered} />
                        <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-500 whitespace-nowrap">{KIND_LABEL[kind]}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Per-team view */}
      {result && ready && phase === 'done' && (
        <section className="space-y-3 flex-reveal" style={{ animationDelay: '1500ms' }}>
          <h2 className="text-lg font-bold">By team</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-xs text-slate-400">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Team</th>
                  {FLEX_WEEKS.map(w => <th key={w} className="text-left px-3 py-2 font-medium">Week {w}</th>)}
                </tr>
              </thead>
              <tbody>
                {ranked.map((t, i) => (
                  <tr
                    key={t.rosterId}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    className={`border-t border-slate-800 ${hovered === i ? 'bg-slate-800/60' : ''}`}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${TIERS[tierOf(i)].dot}`} />
                      <span className="font-semibold">{t.manager}</span>
                    </td>
                    {result.schedule.map((week, wi) => {
                      const m = week.find(([a, b]) => a === i || b === i)!;
                      const opp = m[0] === i ? m[1] : m[0];
                      return (
                        <td key={wi} className="px-3 py-2 whitespace-nowrap">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${TIERS[tierOf(opp)].dot}`} />
                          <span className={TIERS[tierOf(opp)].text}>{ranked[opp].manager}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-200 font-semibold"><Info className="w-4 h-4 text-emerald-400" /> How the draw works</div>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Standings are rebuilt from Sleeper’s week-by-week matchups for weeks 1–{ROUND_ROBIN_WEEKS} only, so later weeks never leak in.</li>
          <li>Teams are ranked 1–12 ({rankBy === 'pf' ? 'by points for, record breaks ties' : 'by record, points for breaks ties'}). Ranks 1–4 are Tier 1, 5–8 Tier 2, 9–12 Tier 3.</li>
          <li>Over weeks 12–14 each team plays exactly one game per week: one against each other tier and one against its own tier. Exactly {fmt(10_492_416)} schedules satisfy these rules. The league’s earlier Z3 scripts (below) encode the same constraints.</li>
          <li>Every valid schedule is numbered. The seed picks one number uniformly at random, so each schedule is equally likely and re-entering the same seed reproduces the same draw.</li>
        </ol>
      </section>
    </div>
  );
}

function TeamChip({ team, name, onHover }: { team: number; name: string; onHover: (t: number | null) => void }) {
  const tier = TIERS[tierOf(team)];
  return (
    <span
      onMouseEnter={() => onHover(team)}
      onMouseLeave={() => onHover(null)}
      className={`inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 ${tier.bg} ${tier.text} font-semibold truncate`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${tier.dot}`} />
      {name}
    </span>
  );
}
