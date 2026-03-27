"use client";

import { useState } from 'react';
import Link from 'next/link';
import { getPlayoffClutchness } from '@/utils/dataProcessing';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { BarChart3, Trophy, Target } from 'lucide-react';

export default function ClutchnessPage() {
  const clutchData = getPlayoffClutchness();
  const [activeBar, setActiveBar] = useState<string | null>(null);

  return (
    <div className="space-y-16">
      <header className="border-b border-slate-800 pb-8">
        <h1 className="text-4xl font-extrabold flex items-center gap-3">
          <BarChart3 className="w-10 h-10 text-blue-400" />
          Playoff Clutchness
        </h1>
        <p className="mt-4 text-slate-400 text-lg">
          Comparing regular season points per game to playoff points per game. Discover who rises to the occasion when the stakes are highest, and who crumbles under pressure.
        </p>
      </header>

      {/* CLUTCHNESS LEGEND */}
      <section>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Performance Categories</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 bg-emerald-400/10 border border-emerald-400/20 rounded-lg">
              <Trophy className="w-8 h-8 text-emerald-400" />
              <div>
                <div className="font-bold text-emerald-400">Clutch Performers</div>
                <div className="text-sm text-slate-300">Score higher in playoffs than regular season</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-red-400/10 border border-red-400/20 rounded-lg">
              <Target className="w-8 h-8 text-red-400" />
              <div>
                <div className="font-bold text-red-400">Pressure Sensitive</div>
                <div className="text-sm text-slate-300">Score lower in playoffs than regular season</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLUTCHNESS CHART */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-200">Performance Differential</h2>
          <p className="text-slate-400 mt-2">
            Points per game difference between playoff and regular season performance.
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
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0 && payload[0].payload.name === activeBar) {
                      return (
                        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg shadow-2xl text-xs space-y-1">
                          <p className="font-bold text-emerald-400">{payload[0].payload.name}</p>
                          <p className="text-slate-300">Reg Season PPG: {payload[0].payload.regularPPG}</p>
                          <p className="text-slate-300">Playoff PPG: {payload[0].payload.playoffPPG}</p>
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
                <Bar dataKey="differential" name="Playoff vs Reg Season PPG Diff" radius={[4, 4, 0, 0]}>
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
            All managers ranked by their playoff performance differential.
          </p>
        </div>

        <div className="grid gap-4">
          {clutchData.map((manager, index) => (
            <Link key={manager.name} href={`/managers/${encodeURIComponent(manager.name)}`} className={`border border-slate-800 rounded-lg p-4 flex items-center justify-between hover:border-slate-700 transition-colors ${
              manager.differential > 0 ? 'bg-emerald-400/5' : 'bg-red-400/5'
            }`}>
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
                  {manager.regularPPG} → {manager.playoffPPG} PPG
                </div>
                <div className="text-xs text-slate-500">
                  {manager.playoffGames} playoff games
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}