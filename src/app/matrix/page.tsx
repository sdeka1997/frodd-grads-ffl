"use client";

import { useMemo, useState } from 'react';
import { useModalEscape } from '@/hooks/useModalEscape';
import Link from 'next/link';
import { getCurrentManagers } from '@/utils/dataProcessing';
import { getLifetimeH2H } from '@/utils/h2hProcessing';
import { getH2HGameLog, type H2HGame } from '@/utils/h2hGameLog';
import { Grid3X3, Trophy, Target, Users, X, TrendingUp, TrendingDown } from 'lucide-react';
import CollapsibleLegend from '@/components/CollapsibleLegend';

function DominanceModal({ manager, onClose }: { manager: string; onClose: () => void }) {
  useModalEscape(onClose);

  const activeManagers = getCurrentManagers().sort();

  const rivalryStats = activeManagers
    .filter(m => m !== manager)
    .map(opponent => ({
      name: opponent,
      ...getLifetimeH2H(manager, opponent)
    }))
    .filter(r => r.total.wins + r.total.losses > 0);

  const sons = [...rivalryStats]
    .sort((a, b) => (b.total.wins - b.total.losses) - (a.total.wins - a.total.losses))
    .filter(r => r.total.wins > r.total.losses);

  const kryptonites = [...rivalryStats]
    .sort((a, b) => (b.total.losses - b.total.wins) - (a.total.losses - a.total.wins))
    .filter(r => r.total.losses > r.total.wins);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">{manager}</h2>
            <p className="text-sm text-slate-400 mt-0.5">Head-to-Head Rivalries</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Punching Bags */}
          <div>
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4" /> Punching Bags
            </h3>
            {sons.length > 0 ? (
              <div className="space-y-2">
                {sons.map(r => (
                  <div key={r.name} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                    <span className="font-medium text-white">{r.name}</span>
                    <span className="text-emerald-400 font-bold">{r.total.wins}–{r.total.losses}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic text-sm">No dominant records yet.</p>
            )}
          </div>

          {/* Kryptonites */}
          <div>
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4" /> Kryptonite
            </h3>
            {kryptonites.length > 0 ? (
              <div className="space-y-2">
                {kryptonites.map(r => (
                  <div key={r.name} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                    <span className="font-medium text-white">{r.name}</span>
                    <span className="text-red-400 font-bold">{r.total.wins}–{r.total.losses}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic text-sm">No significant losing records.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <Link
            href={`/managers/${encodeURIComponent(manager)}`}
            className="block text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            View Full Profile →
          </Link>
        </div>
      </div>
    </div>
  );
}

function H2HModal({ m1, m2, onClose }: { m1: string; m2: string; onClose: () => void }) {
  const games = getH2HGameLog(m1, m2);

  useModalEscape(onClose);

  const wins = games.filter(g => g.result === 'W').length;
  const losses = games.filter(g => g.result === 'L').length;

  // Group by year
  const byYear = games.reduce<Record<string, H2HGame[]>>((acc, g) => {
    if (!acc[g.year]) acc[g.year] = [];
    acc[g.year].push(g);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">{m1} vs {m2}</h2>
            <p className="text-sm text-slate-400 mt-0.5">All-time Head-to-Head</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800">
          <div className="p-4 text-center">
            <div className="text-xs text-slate-500 uppercase tracking-wider">{m1}</div>
            <div className={`text-2xl font-bold mt-1 ${wins > losses ? 'text-emerald-400' : wins < losses ? 'text-red-400' : 'text-slate-400'}`}>{wins}</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Games</div>
            <div className="text-2xl font-bold text-white mt-1">{games.length}</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-xs text-slate-500 uppercase tracking-wider">{m2}</div>
            <div className={`text-2xl font-bold mt-1 ${losses > wins ? 'text-emerald-400' : losses < wins ? 'text-red-400' : 'text-slate-400'}`}>{losses}</div>
          </div>
        </div>

        {/* Game log */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {Object.keys(byYear).sort((a, b) => parseInt(b) - parseInt(a)).map(year => (
            <div key={year}>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{year}</div>
              <div className="space-y-1.5">
                {byYear[year].map((g, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold w-5 ${g.result === 'W' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {g.result}
                      </span>
                      <span className={`text-sm ${g.isPlayoff ? 'text-yellow-400' : 'text-slate-300'}`}>
                        {g.displayLabel}
                      </span>
                    </div>
                    <div className="text-right text-sm font-mono">
                      <span className="font-bold text-white">{g.m1Points.toFixed(1)}</span>
                      <span className="text-slate-500 mx-1">–</span>
                      <span className="text-slate-400">{g.m2Points.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-between text-sm">
          <Link href={`/managers/${encodeURIComponent(m1)}`} className="text-blue-400 hover:text-blue-300 transition-colors">
            {m1}'s Profile →
          </Link>
          <Link href={`/managers/${encodeURIComponent(m2)}`} className="text-blue-400 hover:text-blue-300 transition-colors">
            {m2}'s Profile →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MatrixPage() {
  const activeManagers = useMemo(() => getCurrentManagers().sort(), []);
  const [selectedPair, setSelectedPair] = useState<{ m1: string; m2: string } | null>(null);
  const [selectedDominance, setSelectedDominance] = useState<string | null>(null);

  const getHeatmapColor = (m1: string, m2: string) => {
    if (m1 === m2) return 'bg-slate-950';
    const s = getLifetimeH2H(m1, m2);
    const total = s.total.wins + s.total.losses;
    if (total === 0) return 'bg-slate-900/50 text-slate-700';
    const diff = s.total.wins - s.total.losses;
    if (diff > 0) return 'bg-emerald-500/20 text-emerald-400';
    if (diff < 0) return 'bg-red-500/20 text-red-400';
    return 'bg-slate-900 text-slate-500';
  };

  // Calculate dominance statistics
  const dominanceStats = activeManagers.map(manager => {
    let wins = 0;
    let losses = 0;
    let dominated = 0;
    let dominatedBy = 0;

    activeManagers.forEach(opponent => {
      if (manager !== opponent) {
        const h2h = getLifetimeH2H(manager, opponent);
        wins += h2h.total.wins;
        losses += h2h.total.losses;

        const diff = h2h.total.wins - h2h.total.losses;
        if (diff > 0) dominated++;
        if (diff < 0) dominatedBy++;
      }
    });

    return {
      manager,
      wins,
      losses,
      winRate: wins + losses > 0 ? (wins / (wins + losses) * 100).toFixed(1) : '0.0',
      dominated,
      dominatedBy,
      netDominance: dominated - dominatedBy
    };
  }).sort((a, b) => b.netDominance - a.netDominance);

  return (
    <>
      {selectedPair && (
        <H2HModal m1={selectedPair.m1} m2={selectedPair.m2} onClose={() => setSelectedPair(null)} />
      )}
      {selectedDominance && (
        <DominanceModal manager={selectedDominance} onClose={() => setSelectedDominance(null)} />
      )}
      <div className="space-y-8 md:space-y-16">
      <header className="border-b border-slate-800 pb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
          <Grid3X3 className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" />
          Supremacy Matrix
        </h1>
        <p className="mt-4 text-slate-400 text-lg">
          An interactive matrix showing the historical records between managers. Discover who dominates head-to-head matchups and who struggles against specific opponents.
        </p>
      </header>

      {/* MATRIX LEGEND */}
      <CollapsibleLegend title="How to Read the Matrix">
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="w-4 h-4 bg-emerald-500/20 shrink-0"></div>
            <span>Winning record against opponent</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="w-4 h-4 bg-red-500/20 shrink-0"></div>
            <span>Losing record against opponent</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
            <div className="w-4 h-4 bg-slate-900 shrink-0"></div>
            <span>Even record or no games</span>
          </div>
        </div>
      </CollapsibleLegend>

      {/* SUPREMACY MATRIX */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-200">Head-to-Head Matrix</h2>
          <p className="text-slate-400 mt-2">
            Complete historical records between all active managers. Click any cell to see the full game log.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-3 bg-slate-950 border border-slate-800 text-slate-500 font-bold uppercase italic">vs</th>
                  {activeManagers.map(m => (
                    <th key={m} className="p-3 bg-slate-950 border border-slate-800 text-blue-400 font-bold min-w-[80px]">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeManagers.map(m1 => (
                  <tr key={m1}>
                    <td className="p-3 bg-slate-950 border border-slate-800 text-emerald-400 font-bold text-left">{m1}</td>
                    {activeManagers.map(m2 => {
                      const s = getLifetimeH2H(m1, m2);
                      const isSelf = m1 === m2;
                      return (
                        <td
                          key={m2}
                          className={`p-3 border border-slate-800 transition-colors ${getHeatmapColor(m1, m2)} ${!isSelf ? 'cursor-pointer hover:brightness-125' : ''}`}
                          title={isSelf ? '' : `${m1} vs ${m2}: ${s.total.wins}-${s.total.losses} — click for game log`}
                          onClick={() => !isSelf && setSelectedPair({ m1, m2 })}
                        >
                          {isSelf ? '-' : `${s.total.wins}-${s.total.losses}`}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3 px-1">
          <span className="font-semibold">Reading tip:</span> The record shown is the <span className="text-emerald-400/70 font-medium">Row Manager</span> vs the <span className="text-blue-400/70 font-medium">Column Manager</span>.
        </p>
      </section>

      {/* DOMINANCE RANKINGS */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-200">Dominance Rankings</h2>
          <p className="text-slate-400 mt-2">
            Managers ranked by their head-to-head dominance across all matchups.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[dominanceStats.slice(0, Math.ceil(dominanceStats.length / 2)), dominanceStats.slice(Math.ceil(dominanceStats.length / 2))].map((half, col) => (
            <div key={col} className="grid gap-4">
              {half.map((stats, i) => {
                const index = col * Math.ceil(dominanceStats.length / 2) + i;
                return (
                  <button key={stats.manager} onClick={() => setSelectedDominance(stats.manager)} className={`w-full text-left border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors flex items-center justify-between cursor-pointer ${
                    stats.netDominance > 0 ? 'bg-emerald-400/5' :
                    stats.netDominance < 0 ? 'bg-red-400/5' : 'bg-slate-900/50'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-slate-500">#{index + 1}</div>
                      <div className="flex items-center gap-3">
                        {stats.netDominance > 0 ? (
                          <Trophy className="w-6 h-6 text-emerald-400" />
                        ) : stats.netDominance < 0 ? (
                          <Target className="w-6 h-6 text-red-400" />
                        ) : (
                          <Users className="w-6 h-6 text-slate-400" />
                        )}
                        <div>
                          <div className="text-lg font-bold text-white">{stats.manager}</div>
                          <div className="text-sm text-slate-400">
                            Dominates {stats.dominated} • Fears {stats.dominatedBy}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        stats.netDominance > 0 ? 'text-emerald-400' :
                        stats.netDominance < 0 ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {stats.netDominance > 0 ? '+' : ''}{stats.netDominance}
                      </div>
                      <div className="text-sm text-slate-400">
                        {stats.wins}-{stats.losses} ({stats.winRate}%)
                      </div>
                      <div className="text-xs text-slate-500">
                        Net dominance
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
    </>
  );
}
