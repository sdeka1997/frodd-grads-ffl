"use client";

import { getWeeklyLowScores, getShotgunStats } from '@/utils/dataProcessing';
import { Beer, TrendingDown, Calendar, Trophy, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ShotgunPage() {
  const weeklyLows = getWeeklyLowScores();
  const shotgunStats = getShotgunStats();

  const getShameColor = (index: number) => {
    if (index === 0) return '#dc2626'; // Most shameful - red
    if (index === 1) return '#ea580c'; // Second - orange
    if (index === 2) return '#d97706'; // Third - amber
    return '#64748b'; // Others - slate
  };

  return (
    <div className="space-y-16">
      <header className="border-b border-slate-800 pb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-extrabold flex items-center gap-3">
            <Beer className="w-10 h-10 text-amber-400" />
            The Shotgun Shame Board
          </h1>
          <span className="text-slate-500 text-sm">
            Established 2023 Week 2
          </span>
        </div>
        <p className="mt-4 text-slate-400 text-lg">
          Weekly low scores: Manager with the lowest score each week has to shotgun a beer.
          <span className="block mt-2 text-amber-400 font-medium">
            🍺 Embrace the shame, embrace the beer.
          </span>
        </p>
      </header>

      {/* SHOTGUN LEADERBOARD */}
      <section>
        <div className="mb-6">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <TrendingDown className="text-red-400" /> Hall of Shame
          </h2>
          <p className="text-slate-400 mt-2">
            Total shotguns by manager since the rule started.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={shotgunStats}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="manager" stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
              <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  color: '#f8fafc',
                  borderRadius: '0.5rem'
                }}
                itemStyle={{ color: '#cbd5e1' }}
              />
              <Bar dataKey="totalShotguns" name="Total Shotguns" radius={[4, 4, 0, 0]}>
                {shotgunStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getShameColor(index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 flex gap-6 text-xs font-bold uppercase tracking-widest justify-center md:justify-start">
          <span className="flex items-center gap-2 text-red-600">
            <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.6)]" />
            Most Shameful
          </span>
          <span className="flex items-center gap-2 text-orange-600">
            <div className="w-2 h-2 rounded-full bg-orange-600 shadow-[0_0_8px_rgba(234,88,12,0.6)]" />
            Runner-up Shame
          </span>
          <span className="flex items-center gap-2 text-amber-600">
            <div className="w-2 h-2 rounded-full bg-amber-600 shadow-[0_0_8px_rgba(217,119,6,0.6)]" />
            Bronze Shame
          </span>
        </div>
      </section>

      {/* RECENT WEEKLY LOWS */}
      <section>
        <div className="mb-6">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="text-purple-400" /> Recent Shame
          </h2>
          <p className="text-slate-400 mt-2">
            The most recent weekly low scorers.
          </p>
        </div>

        <div className="grid gap-4">
          {weeklyLows.slice(0, 10).map((low, index) => (
            <div
              key={`${low.year}-${low.week}-${low.manager}`}
              className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-400 font-mono text-sm">
                  <Calendar className="w-4 h-4" />
                  {low.year} Week {low.week}
                </div>
                <div className="flex items-center gap-2">
                  <Beer className="w-5 h-5 text-amber-400" />
                  <span className="text-lg font-bold text-white">{low.manager}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-400">{low.points}</div>
                <div className="text-xs text-slate-500 uppercase font-bold">Points</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEASONAL BREAKDOWN */}
      <section>
        <div className="mb-6">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="text-yellow-400" /> Seasonal Breakdown
          </h2>
          <p className="text-slate-400 mt-2">
            How the shame is distributed across seasons.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shotgunStats.slice(0, 6).map((stats, index) => (
            <div key={stats.manager} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{stats.manager}</h3>
                <div className="flex items-center gap-1 text-red-400">
                  <Beer className="w-5 h-5" />
                  <span className="text-2xl font-bold">{stats.totalShotguns}</span>
                </div>
              </div>

              <div className="space-y-3">
                {Object.entries(stats.seasons).map(([year, seasonStats]) => (
                  <div key={year} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{year}:</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold">{seasonStats.shotguns} beers</span>
                      <span className="text-slate-500">({seasonStats.avgScore} avg)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}