"use client";

import { useState } from 'react';
import { useModalEscape } from '@/hooks/useModalEscape';
import Link from 'next/link';
import { getPlayoffClutchness } from '@/utils/dataProcessing';
import { getManagerHighStakesGames, type HighStakesGame } from '@/utils/highStakesGames';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { BarChart3, Trophy, Target, X, TrendingUp, TrendingDown } from 'lucide-react';
import CollapsibleLegend from '@/components/CollapsibleLegend';

function HighStakesModal({ managerName, regularPPG, onClose }: { managerName: string; regularPPG: number; onClose: () => void }) {
  const games = getManagerHighStakesGames(managerName);

  useModalEscape(onClose);

  // Group by year
  const byYear = games.reduce<Record<string, HighStakesGame[]>>((acc, g) => {
    if (!acc[g.year]) acc[g.year] = [];
    acc[g.year].push(g);
    return acc;
  }, {});

  const totalPF = games.reduce((sum, g) => sum + g.myPoints, 0);
  const totalGames = games.length;
  const wins = games.filter(g => g.result === 'W').length;

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
            <h2 className="text-xl font-bold text-white">{managerName}</h2>
            <p className="text-sm text-slate-400 mt-0.5">High-Stakes Game Log</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800">
          <div className="p-4 text-center">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Games</div>
            <div className="text-2xl font-bold text-white mt-1">{totalGames}</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Record</div>
            <div className="text-2xl font-bold text-white mt-1">{wins}-{totalGames - wins}</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-xs text-slate-500 uppercase tracking-wider">PPG</div>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <div className="text-2xl font-bold text-white">{totalGames > 0 ? (totalPF / totalGames).toFixed(1) : '—'}</div>
              {totalGames > 0 && ((totalPF / totalGames) >= regularPPG
                ? <TrendingUp className="w-5 h-5 text-emerald-400" />
                : <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{regularPPG} reg season</div>
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
                      <span className="text-sm text-slate-300">{g.displayLabel}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-white">{g.myPoints.toFixed(1)}</span>
                      <span className="text-xs text-slate-500 ml-1">vs {g.opponent} ({g.oppPoints.toFixed(1)})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <Link
            href={`/managers/${encodeURIComponent(managerName)}`}
            className="block text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            View Full Profile →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ClutchnessPage() {
  const clutchData = getPlayoffClutchness();
  const [activeBar, setActiveBar] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);

  return (
    <>
      {selectedManager && (
        <HighStakesModal
          managerName={selectedManager}
          regularPPG={clutchData.find(m => m.name === selectedManager)?.regularPPG ?? 0}
          onClose={() => setSelectedManager(null)}
        />
      )}
      <div className="space-y-8 md:space-y-16">
      <header className="border-b border-slate-800 pb-8">
        <h1 className="text-4xl font-extrabold flex items-center gap-3">
          <BarChart3 className="w-10 h-10 text-blue-400" />
          High-Stakes Clutchness
        </h1>
        <p className="mt-4 text-slate-400 text-lg">
          Comparing regular season points per game to high-stakes postseason PPG — championship bracket and sacko games only. Discover who rises to the occasion when it matters most, and who crumbles under pressure.
        </p>
      </header>

      {/* CLUTCHNESS LEGEND */}
      <CollapsibleLegend title="Performance Categories">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4 p-4 bg-emerald-400/10 border border-emerald-400/20 rounded-lg">
            <Trophy className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-emerald-400">Clutch Performers</div>
              <div className="text-sm text-slate-300">Score higher in high-stakes games than regular season</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-red-400/10 border border-red-400/20 rounded-lg">
            <Target className="w-8 h-8 text-red-400 shrink-0" />
            <div>
              <div className="font-bold text-red-400">Pressure Sensitive</div>
              <div className="text-sm text-slate-300">Score lower in high-stakes games than regular season</div>
            </div>
          </div>
        </div>
      </CollapsibleLegend>

      {/* CLUTCHNESS CHART */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-200">Performance Differential</h2>
          <p className="text-slate-400 mt-2">
            Points per game difference between high-stakes postseason and regular season performance.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 md:p-6 h-[600px] overflow-x-auto no-scrollbar" onClick={() => setActiveBar(null)}>
          <div className="min-w-[800px] h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={clutchData}
                margin={{ top: 20, right: 30, left: -30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
                <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} tickFormatter={(tick) => `${tick}`} />
                <Tooltip
                  active={activeBar !== null}
                  cursor={false}
                  isAnimationActive={false}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0 && payload[0].payload.name === activeBar) {
                      return (
                        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg shadow-2xl text-xs space-y-1">
                          <p className="font-bold text-emerald-400">{payload[0].payload.name}</p>
                          <p className="text-slate-300">Reg Season PPG: {payload[0].payload.regularPPG}</p>
                          <p className="text-slate-300">High-Stakes PPG: {payload[0].payload.playoffPPG}</p>
                          <p className="pt-1 border-t border-slate-800 font-bold text-white">
                            Differential: {payload[0].payload.differential > 0 ? '+' : ''}{payload[0].payload.differential}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={0} stroke="#64748b" />
                <Bar dataKey="differential" name="High-Stakes vs Reg Season PPG Diff" radius={[4, 4, 0, 0]}>
                  {clutchData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.differential > 0 ? '#34d399' : '#f87171'}
                      onMouseEnter={() => { if (window.innerWidth > 768) setActiveBar(entry.name); }}
                      onMouseLeave={() => { if (window.innerWidth > 768) setActiveBar(null); }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveBar(entry.name === activeBar ? null : entry.name);
                      }}
                      className="cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* CLUTCHNESS RANKINGS */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-200">Clutchness Rankings</h2>
          <p className="text-slate-400 mt-2">
            All managers ranked by their high-stakes performance differential. Tap a card to see the full game log.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[clutchData.slice(0, Math.ceil(clutchData.length / 2)), clutchData.slice(Math.ceil(clutchData.length / 2))].map((half, col) => (
            <div key={col} className="grid gap-4">
              {half.map((manager, i) => {
                const index = col * Math.ceil(clutchData.length / 2) + i;
                return (
                  <button
                    key={manager.name}
                    onClick={() => setSelectedManager(manager.name)}
                    className={`border border-slate-800 rounded-lg p-4 flex items-center justify-between hover:border-slate-700 transition-colors text-left w-full cursor-pointer ${
                      manager.differential > 0 ? 'bg-emerald-400/5' : 'bg-red-400/5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-slate-500">#{index + 1}</div>
                      <div className="flex items-center gap-3">
                        {manager.differential > 0 ? (
                          <Trophy className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <Target className="w-6 h-6 text-red-400" />
                        )}
                        <div>
                          <div className="text-lg font-bold text-white">{manager.name}</div>
                          <div className={`text-sm font-medium ${
                            manager.differential > 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {manager.differential > 0 ? 'Clutch Performer' : 'Pressure Sensitive'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        manager.differential > 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {manager.differential > 0 ? '+' : ''}{manager.differential}
                      </div>
                      <div className="text-sm text-slate-400">
                        {manager.regularPPG} → {manager.playoffPPG} PPG (high-stakes)
                      </div>
                      <div className="text-xs text-slate-500">
                        {manager.playoffGames} high-stakes games
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
