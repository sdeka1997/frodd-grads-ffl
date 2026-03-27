"use client";

import { getLuckIndex } from '@/utils/dataProcessing';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell, ReferenceLine } from 'recharts';
import { ScatterChart as ScatterIcon } from 'lucide-react';
import { useState } from 'react';

export default function LuckPage() {
  const luckData = getLuckIndex();
  const [activeTab, setActiveTab] = useState<'luck' | 'skill'>('luck');

  const getQuadrantColor = (x: number, y: number) => {
    if (x >= 0 && y <= 0) return '#34d399'; // Bottom Right: Good & Lucky
    if (x >= 0 && y > 0) return '#60a5fa';  // Top Right: Good & Unlucky
    if (x < 0 && y <= 0) return '#fbbf24';  // Bottom Left: Bad & Lucky
    return '#f87171'; // Top Left: Bad & Unlucky
  };

  return (
    <div className="space-y-16">
      <header className="border-b border-slate-800 pb-8">
        <h1 className="text-4xl font-extrabold flex items-center gap-3">
          <ScatterIcon className="w-10 h-10 text-purple-400" />
          The Luck Index
        </h1>
        <p className="mt-4 text-slate-400 text-lg">
          Plotting Points For vs Average (X-axis) against Points Against vs Average (Y-axis). Discover who's been blessed by the fantasy gods and who's been cursed by terrible luck.
        </p>
      </header>

      {/* LUCK INDEX CHART */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-200">Quadrant Analysis</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-emerald-400"></div>
              <span><span className="text-emerald-400 font-medium">Bottom Right:</span> Good & Lucky (Score High, Low PA)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-blue-400"></div>
              <span><span className="text-blue-400 font-medium">Top Right:</span> Good & Unlucky (Score High, High PA)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-amber-400"></div>
              <span><span className="text-amber-400 font-medium">Bottom Left:</span> Bad & Lucky (Score Low, Low PA)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-red-400"></div>
              <span><span className="text-red-400 font-medium">Top Left:</span> Bad & Unlucky (Score Low, High PA)</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 md:p-6 h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 40, right: 20, bottom: 20, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                type="number"
                dataKey="x"
                name="Points For vs Avg"
                stroke="#94a3b8"
                tick={{fill: '#94a3b8'}}
                domain={[-6, 5]}
                ticks={[-6, -4, -2, 0, 2, 4]}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Points Against vs Avg"
                stroke="#94a3b8"
                tick={{fill: '#94a3b8'}}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#cbd5e1' }}
              />
              <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
              <ReferenceLine x={0} stroke="#64748b" strokeDasharray="3 3" />
              <Scatter name="Managers" data={luckData}>
                {luckData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getQuadrantColor(entry.x, entry.y)} />
                ))}
                <LabelList
                  dataKey="name"
                  position="top"
                  fill="#cbd5e1"
                  fontSize={10}
                  offset={10}
                  content={({ x, y, value }: any) => (
                    <text x={x} y={(y as number) - 10} fill="#cbd5e1" fontSize={12} textAnchor="middle" style={{ whiteSpace: 'nowrap' }}>
                      {value}
                    </text>
                  )}
                />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* LUCK RANKINGS */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Luck & Skill Rankings</h2>
          <div className="flex border border-slate-700 rounded-lg overflow-hidden w-fit">
            <button
              onClick={() => setActiveTab('luck')}
              className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'luck'
                  ? 'bg-red-500/20 text-red-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              😰 Most Unlucky
            </button>
            <button
              onClick={() => setActiveTab('skill')}
              className={`px-5 py-2.5 text-sm font-medium transition-colors border-l border-slate-700 ${
                activeTab === 'skill'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              🎯 Most Skilled
            </button>
          </div>
        </div>

        {activeTab === 'luck' && (
          <div className="space-y-2">
            <p className="text-slate-400 text-sm mb-3">Points Against vs Average — higher means more unlucky</p>
            {[...luckData].sort((a, b) => b.y - a.y).map((manager, index) => {
              const getMiseryColor = (paVsAvg: number) => {
                if (paVsAvg >= 3) return 'bg-red-500/20 border-red-500/40 text-red-300';
                if (paVsAvg >= 1) return 'bg-orange-500/20 border-orange-500/40 text-orange-300';
                if (paVsAvg >= 0) return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300';
                if (paVsAvg >= -2) return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
                return 'bg-green-600/20 border-green-600/40 text-green-300';
              };
              return (
                <div key={manager.name} className={`${getMiseryColor(manager.y)} border rounded-lg p-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-slate-800 rounded-full text-xs font-bold text-slate-300">{index + 1}</div>
                    <span className="font-medium text-white">{manager.name}</span>
                  </div>
                  <div className="text-xl font-bold">{manager.y > 0 ? '+' : ''}{manager.y}</div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'skill' && (
          <div className="space-y-2">
            <p className="text-slate-400 text-sm mb-3">Points For vs Average — higher means more skilled</p>
            {[...luckData].sort((a, b) => b.x - a.x).map((manager, index) => {
              const getProwessColor = (pfVsAvg: number) => {
                if (pfVsAvg >= 3) return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
                if (pfVsAvg >= 1) return 'bg-green-500/20 border-green-500/40 text-green-300';
                if (pfVsAvg >= 0) return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300';
                if (pfVsAvg >= -2) return 'bg-orange-500/20 border-orange-500/40 text-orange-300';
                return 'bg-red-600/20 border-red-600/40 text-red-300';
              };
              return (
                <div key={manager.name} className={`${getProwessColor(manager.x)} border rounded-lg p-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-slate-800 rounded-full text-xs font-bold text-slate-300">{index + 1}</div>
                    <span className="font-medium text-white">{manager.name}</span>
                  </div>
                  <div className="text-xl font-bold">{manager.x > 0 ? '+' : ''}{manager.x}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}