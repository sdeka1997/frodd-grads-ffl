"use client";

import { getLuckIndex, getManagerScoringByYear } from '@/utils/dataProcessing';
import CenteredBar from '@/components/CenteredBar';
import CollapsibleLegend from '@/components/CollapsibleLegend';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell, ReferenceLine } from 'recharts';
import { ScatterChart as ScatterIcon, X } from 'lucide-react';
import { useState } from 'react';
import { useModalEscape } from '@/hooks/useModalEscape';
import Link from 'next/link';

function LuckModal({ managerName, pfVsAvg, paVsAvg, focus, onClose }: {
  managerName: string;
  pfVsAvg: number;
  paVsAvg: number;
  focus: 'luck' | 'skill';
  onClose: () => void;
}) {
  const yearlyData = getManagerScoringByYear(managerName);

  useModalEscape(onClose);

  const maxAbs = Math.max(1, ...yearlyData.map(d => Math.abs(focus === 'luck' ? d.paVsAvg : d.pfVsAvg)));

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">{managerName}</h2>
            <p className="text-sm text-slate-400 mt-0.5">Scoring Metrics</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Overall scoring metric */}
          <div className="p-6">
            {focus === 'skill' ? (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400 font-medium">Points For vs Average</span>
                  <span className={`font-bold text-lg ${pfVsAvg > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pfVsAvg > 0 ? '+' : ''}{pfVsAvg}
                  </span>
                </div>
                <CenteredBar value={pfVsAvg} isGoodWhenPositive={true} />
              </div>
            ) : (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400 font-medium">Points Against vs Average</span>
                  <span className={`font-bold text-lg ${paVsAvg < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {paVsAvg > 0 ? '+' : ''}{paVsAvg}
                  </span>
                </div>
                <CenteredBar value={paVsAvg} isGoodWhenPositive={false} />
              </div>
            )}
          </div>

          {/* Year-by-year breakdown */}
          <div className="px-6 pb-6 border-t border-slate-800 pt-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
              {focus === 'luck' ? 'Points Against vs Avg — Year by Year' : 'Points For vs Avg — Year by Year'}
            </h3>
            <div className="space-y-3">
              {yearlyData.map(({ year, pfVsAvg: pf, paVsAvg: pa }) => {
                const value = focus === 'luck' ? pa : pf;
                const isGoodWhenPositive = focus === 'skill';
                const isGood = isGoodWhenPositive ? value > 0 : value < 0;
                return (
                  <div key={year}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-slate-400">{year}</span>
                      <span className={`text-xs font-bold ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
                        {value > 0 ? '+' : ''}{value}
                      </span>
                    </div>
                    <CenteredBar value={value} isGoodWhenPositive={isGoodWhenPositive} maxAbs={maxAbs} height="h-2" />
                  </div>
                );
              })}
            </div>
          </div>
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

export default function LuckPage() {
  const luckData = getLuckIndex();
  const [activeTab, setActiveTab] = useState<'luck' | 'skill'>('luck');
  const [selectedManager, setSelectedManager] = useState<{ name: string; x: number; y: number; focus: 'luck' | 'skill' } | null>(null);

  const getQuadrantColor = (x: number, y: number) => {
    if (x >= 0 && y <= 0) return '#34d399'; // Bottom Right: Good & Lucky
    if (x >= 0 && y > 0) return '#60a5fa';  // Top Right: Good & Unlucky
    if (x < 0 && y <= 0) return '#fbbf24';  // Bottom Left: Bad & Lucky
    return '#f87171'; // Top Left: Bad & Unlucky
  };

  const getMiseryColor = (paVsAvg: number) => {
    if (paVsAvg >= 3) return 'bg-red-500/20 border-red-500/40 text-red-300';
    if (paVsAvg >= 1) return 'bg-orange-500/20 border-orange-500/40 text-orange-300';
    if (paVsAvg >= 0) return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300';
    if (paVsAvg >= -2) return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
    return 'bg-green-600/20 border-green-600/40 text-green-300';
  };

  const getProwessColor = (pfVsAvg: number) => {
    if (pfVsAvg >= 3) return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
    if (pfVsAvg >= 1) return 'bg-green-500/20 border-green-500/40 text-green-300';
    if (pfVsAvg >= 0) return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300';
    if (pfVsAvg >= -2) return 'bg-orange-500/20 border-orange-500/40 text-orange-300';
    return 'bg-red-600/20 border-red-600/40 text-red-300';
  };

  const ManagerTile = ({ manager, value, colorFn, index, focus }: {
    manager: { name: string; x: number; y: number };
    value: number;
    colorFn: (v: number) => string;
    index: number;
    focus: 'luck' | 'skill';
  }) => (
    <button
      onClick={() => setSelectedManager({ ...manager, focus })}
      className={`${colorFn(value)} border rounded-lg p-3 flex items-center justify-between hover:opacity-80 transition-opacity w-full cursor-pointer`}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-6 h-6 bg-slate-800 rounded-full text-xs font-bold text-slate-300">{index + 1}</div>
        <span className="font-medium text-white">{manager.name}</span>
      </div>
      <div className="text-xl font-bold">{value > 0 ? '+' : ''}{value}</div>
    </button>
  );

  return (
    <div className="space-y-16">
      {selectedManager && (
        <LuckModal
          managerName={selectedManager.name}
          pfVsAvg={selectedManager.x}
          paVsAvg={selectedManager.y}
          focus={selectedManager.focus}
          onClose={() => setSelectedManager(null)}
        />
      )}

      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-4xl font-extrabold flex items-center gap-3">
          <ScatterIcon className="w-10 h-10 text-purple-400" />
          Luck Index
        </h1>
        <p className="mt-4 text-slate-400 text-lg">
          Plotting Points For vs Average (X-axis) against Points Against vs Average (Y-axis). Discover who's been blessed by the fantasy gods and who's been cursed by terrible luck.
        </p>
      </header>

      {/* QUADRANT LEGEND */}
      <CollapsibleLegend title="Quadrant Analysis">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3 p-3 bg-emerald-400/10 border border-emerald-400/20 rounded-lg">
            <div className="w-4 h-4 rounded bg-emerald-400 shrink-0"></div>
            <span><span className="text-emerald-400 font-medium">Bottom Right:</span> Good &amp; Lucky (Score High, Low PA)</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-400/10 border border-blue-400/20 rounded-lg">
            <div className="w-4 h-4 rounded bg-blue-400 shrink-0"></div>
            <span><span className="text-blue-400 font-medium">Top Right:</span> Good &amp; Unlucky (Score High, High PA)</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-amber-400/10 border border-amber-400/20 rounded-lg">
            <div className="w-4 h-4 rounded bg-amber-400 shrink-0"></div>
            <span><span className="text-amber-400 font-medium">Bottom Left:</span> Bad &amp; Lucky (Score Low, Low PA)</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-400/10 border border-red-400/20 rounded-lg">
            <div className="w-4 h-4 rounded bg-red-400 shrink-0"></div>
            <span><span className="text-red-400 font-medium">Top Left:</span> Bad &amp; Unlucky (Score Low, High PA)</span>
          </div>
        </div>
      </CollapsibleLegend>

      {/* LUCK INDEX CHART */}
      <section>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 md:p-6 h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 40, right: 5, bottom: 20, left: -30 }}>
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
        <h2 className="text-2xl font-bold text-slate-200 mb-6">Luck & Skill Rankings</h2>

        {/* Mobile: tab toggle */}
        <div className="md:hidden">
          <div className="flex border border-slate-700 rounded-lg overflow-hidden w-full mb-4">
            <button
              onClick={() => setActiveTab('luck')}
              className={`flex-1 px-5 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'luck'
                  ? 'bg-red-500/20 text-red-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              😰 Most Unlucky
            </button>
            <button
              onClick={() => setActiveTab('skill')}
              className={`flex-1 px-5 py-2.5 text-sm font-medium transition-colors border-l border-slate-700 ${
                activeTab === 'skill'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              🎯 Most Skilled
            </button>
          </div>
          {activeTab === 'luck' && (
            <div>
              <p className="text-slate-400 text-sm mb-3">Points Against vs Average — higher means more unlucky</p>
              <div className="space-y-2">
                {[...luckData].sort((a, b) => b.y - a.y).map((manager, index) => (
                  <ManagerTile key={manager.name} manager={manager} value={manager.y} colorFn={getMiseryColor} index={index} focus="luck" />
                ))}
              </div>
            </div>
          )}
          {activeTab === 'skill' && (
            <div>
              <p className="text-slate-400 text-sm mb-3">Points For vs Average — higher means more skilled</p>
              <div className="space-y-2">
                {[...luckData].sort((a, b) => b.x - a.x).map((manager, index) => (
                  <ManagerTile key={manager.name} manager={manager} value={manager.x} colorFn={getProwessColor} index={index} focus="skill" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Desktop: side by side */}
        <div className="hidden md:grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-red-300 mb-1">😰 Most Unlucky</h3>
            <p className="text-slate-400 text-sm mb-3">Points Against vs Average — higher means more unlucky</p>
            <div className="space-y-2">
              {[...luckData].sort((a, b) => b.y - a.y).map((manager, index) => (
                <ManagerTile key={manager.name} manager={manager} value={manager.y} colorFn={getMiseryColor} index={index} focus="luck" />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-300 mb-1">🎯 Most Skilled</h3>
            <p className="text-slate-400 text-sm mb-3">Points For vs Average — higher means more skilled</p>
            <div className="space-y-2">
              {[...luckData].sort((a, b) => b.x - a.x).map((manager, index) => (
                <ManagerTile key={manager.name} manager={manager} value={manager.x} colorFn={getProwessColor} index={index} focus="skill" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
