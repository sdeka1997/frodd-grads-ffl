"use client";

import { getWeeklyLowScores, getShotgunStats } from '@/utils/dataProcessing';
import { Beer, TrendingDown, Calendar, Zap, Expand } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useState } from 'react';
import WeekLeaderboardModal from '@/components/WeekLeaderboardModal';
import ShotgunModal from '@/components/ShotgunModal';

function ShotgunContent() {
  const weeklyLows = getWeeklyLowScores();
  const shotgunStats = getShotgunStats();

  const [activeBar, setActiveBar] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'shame' | 'breakdown'>('shame');
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<{ year: string; week: number; manager: string } | null>(null);

  const getShameColor = (index: number) => {
    const total = shotgunStats.length;
    const t = total <= 1 ? 0 : index / (total - 1);
    // Red (#ef4444) → Amber (#f59e0b) → Green (#22c55e)
    if (t <= 0.5) {
      const s = t * 2;
      const r = Math.round(239 + (245 - 239) * s);
      const g = Math.round(68  + (158 - 68)  * s);
      const b = Math.round(68  + (11  - 68)  * s);
      return `rgb(${r},${g},${b})`;
    } else {
      const s = (t - 0.5) * 2;
      const r = Math.round(245 + (34  - 245) * s);
      const g = Math.round(158 + (197 - 158) * s);
      const b = Math.round(11  + (94  - 11)  * s);
      return `rgb(${r},${g},${b})`;
    }
  };

  const ManagerTile = ({ stats }: { stats: typeof shotgunStats[number] }) => (
    <button
      onClick={() => setSelectedManager(stats.manager)}
      className="relative bg-slate-900 border border-slate-800 rounded-xl p-6 block w-full text-left hover:border-slate-700 transition-colors cursor-pointer"
    >
      <Expand className="absolute top-3 right-3 w-3.5 h-3.5 text-slate-400" />
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">{stats.manager}</h3>
        <div className="flex items-center gap-2 text-red-400">
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
    </button>
  );

  return (
    <>
      {selectedManager && (
        <ShotgunModal
          manager={selectedManager}
          footerHref={`/managers/${encodeURIComponent(selectedManager)}`}
          footerLabel="View Full Profile →"
          onClose={() => setSelectedManager(null)}
        />
      )}
      {selectedWeek && (
        <WeekLeaderboardModal
          year={selectedWeek.year}
          week={selectedWeek.week}
          highlightedManager={selectedWeek.manager}
          mode="shame"
          onClose={() => setSelectedWeek(null)}
        />
      )}
      <div className="space-y-8 md:space-y-16">
      <header className="border-b border-slate-800 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
            <Beer className="w-8 h-8 md:w-10 md:h-10 text-amber-400" />
            Shotgun Shame Board
          </h1>
          <span className="text-slate-500 text-xs md:text-lg md:text-slate-400">
            Established 2023 Week 2
          </span>
        </div>
        <p className="mt-2 text-slate-500 text-xs md:text-lg md:text-slate-400 md:mt-4">
          Weekly low scores: Manager with the lowest score each week has to shotgun a beer.
          <span className="block mt-2 text-amber-400 font-medium">
            🍺 Embrace the shame, embrace the beer.
          </span>
        </p>
      </header>

      {/* SHOTGUN LEADERBOARD */}
      <section>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6 overflow-x-auto" onClick={() => setActiveBar(null)}>
          <div style={{ minWidth: `${Math.max(550, shotgunStats.length * 78)}px`, height: '360px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={shotgunStats}
                margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="manager" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} width={35} />
                <Tooltip
                  active={activeBar !== null}
                  cursor={false}
                  isAnimationActive={false}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0 && payload[0].payload.manager === activeBar) {
                      return (
                        <div className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 shadow-xl text-sm space-y-1">
                          <div className="font-bold text-white">{payload[0].payload.manager}</div>
                          <div className="text-slate-300">{payload[0].payload.totalShotguns} Shotguns 🍺</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="totalShotguns" name="Total Shotguns" radius={[4, 4, 0, 0]}>
                  {shotgunStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getShameColor(index)}
                      onMouseEnter={() => { if (window.innerWidth > 768) setActiveBar(entry.manager); }}
                      onMouseLeave={() => { if (window.innerWidth > 768) setActiveBar(null); }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveBar(entry.manager === activeBar ? null : entry.manager);
                      }}
                      className="cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
          <span className="text-red-400">Hall of Shame</span>
          <div className="flex-1 h-2 rounded-full" style={{ background: 'linear-gradient(to right, #ef4444, #f59e0b, #22c55e)' }} />
          <span className="text-green-400">Sober</span>
        </div>
      </section>

      {/* RECENT SHAME / SEASONAL BREAKDOWN */}
      <section>
        {/* Mobile: tab toggle */}
        <div className="md:hidden">
          <div className="flex border border-slate-700 rounded-lg overflow-hidden w-full mb-4">
            <button
              onClick={() => setActiveTab('shame')}
              className={`flex-1 px-5 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'shame'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              🍺 Recent Shame
            </button>
            <button
              onClick={() => setActiveTab('breakdown')}
              className={`flex-1 px-5 py-2.5 text-sm font-medium transition-colors border-l border-slate-700 ${
                activeTab === 'breakdown'
                  ? 'bg-red-500/20 text-red-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              ⚡ Year by Year
            </button>
          </div>
          {activeTab === 'shame' && (
            <div className="grid gap-3">
              {weeklyLows.slice(0, 10).map((low) => (
                <button
                  key={`${low.year}-${low.week}-${low.manager}`}
                  onClick={() => setSelectedWeek({ year: low.year, week: low.week, manager: low.manager })}
                  className="relative bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between hover:bg-slate-800/50 hover:border-slate-700 transition-colors cursor-pointer w-full text-left"
                >
                  <Expand className="absolute top-2 right-2 w-3.5 h-3.5 text-slate-400" />
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
                </button>
              ))}
            </div>
          )}
          {activeTab === 'breakdown' && (
            <div className="grid gap-4">
              {shotgunStats.map((stats) => (
                <ManagerTile key={stats.manager} stats={stats} />
              ))}
            </div>
          )}
        </div>

        {/* Desktop: side by side */}
        <div className="hidden md:grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">🍺 Recent Shame</h2>
            <div className="grid gap-3">
              {weeklyLows.slice(0, 10).map((low) => (
                <button
                  key={`${low.year}-${low.week}-${low.manager}`}
                  onClick={() => setSelectedWeek({ year: low.year, week: low.week, manager: low.manager })}
                  className="relative bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between hover:bg-slate-800/50 hover:border-slate-700 transition-colors cursor-pointer w-full text-left"
                >
                  <Expand className="absolute top-2 right-2 w-3.5 h-3.5 text-slate-400" />
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
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Zap className="text-amber-400 w-6 h-6" /> Year by Year</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              {(() => {
                const leftCol: typeof shotgunStats = [];
                const rightCol: typeof shotgunStats = [];
                let leftHeight = 0;
                let rightHeight = 0;

                shotgunStats.forEach(stats => {
                  const weight = 2 + Object.keys(stats.seasons).length;
                  if (leftHeight <= rightHeight) {
                    leftCol.push(stats);
                    leftHeight += weight;
                  } else {
                    rightCol.push(stats);
                    rightHeight += weight;
                  }
                });

                return (
                  <>
                    <div className="space-y-4">
                      {leftCol.map((stats) => <ManagerTile key={stats.manager} stats={stats} />)}
                    </div>
                    <div className="space-y-4">
                      {rightCol.map((stats) => <ManagerTile key={stats.manager} stats={stats} />)}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}

export default function ShotgunPage() {
  return <ShotgunContent />;
}
