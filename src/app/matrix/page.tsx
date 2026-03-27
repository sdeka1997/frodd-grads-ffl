"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { getCurrentManagers } from '@/utils/dataProcessing';
import { getLifetimeH2H } from '@/utils/h2hProcessing';
import { Grid3X3, Trophy, Target, Users } from 'lucide-react';

export default function MatrixPage() {
  const activeManagers = useMemo(() => getCurrentManagers().sort(), []);

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
    let dominated = 0; // Managers they have winning record against
    let dominatedBy = 0; // Managers with winning record against them

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
    <div className="space-y-16">
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
      <section>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">How to Read the Matrix</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="w-4 h-4 bg-emerald-500/20"></div>
              <span>Winning record against opponent</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="w-4 h-4 bg-red-500/20"></div>
              <span>Losing record against opponent</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
              <div className="w-4 h-4 bg-slate-900"></div>
              <span>Even record or no games</span>
            </div>
          </div>
        </div>
      </section>

      {/* SUPREMACY MATRIX */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-200">Head-to-Head Matrix</h2>
          <p className="text-slate-400 mt-2">
            Complete historical records between all active managers.
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
                      return (
                        <td
                          key={m2}
                          className={`p-3 border border-slate-800 transition-colors ${getHeatmapColor(m1, m2)}`}
                          title={`${m1} vs ${m2}: ${s.total.wins}-${s.total.losses}`}
                        >
                          {m1 === m2 ? '-' : `${s.total.wins}-${s.total.losses}`}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-3 px-1">
            <span className="text-emerald-400/70 font-medium">Row Manager</span> record vs <span className="text-blue-400/70 font-medium">Column Manager</span>.
          </p>
        </div>
      </section>

      {/* DOMINANCE RANKINGS */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-200">Dominance Rankings</h2>
          <p className="text-slate-400 mt-2">
            Managers ranked by their head-to-head dominance across all matchups.
          </p>
        </div>

        <div className="grid gap-4">
          {dominanceStats.map((stats, index) => (
            <Link key={stats.manager} href={`/managers/${encodeURIComponent(stats.manager)}`} className={`border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors flex items-center justify-between ${
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
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}