"use client";

import { useMemo, useState } from 'react';
import { getLuckIndex, getPlayoffClutchness, getCurrentManagers } from '@/utils/dataProcessing';
import { getLifetimeH2H } from '@/utils/h2hProcessing';
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell, ReferenceLine } from 'recharts';
import { BarChart3, ScatterChart as ScatterIcon, Grid3X3 } from 'lucide-react';

export default function AnalyticsPage() {
  const luckData = getLuckIndex();
  // Filter out managers with no playoff appearances
  const clutchData = getPlayoffClutchness();
  const activeManagers = useMemo(() => getCurrentManagers().sort(), []);
  const [activeBar, setActiveBar] = useState<string | null>(null);

  const getQuadrantColor = (x: number, y: number) => {
    if (x >= 0 && y <= 0) return '#34d399'; // Bottom Right: Good & Lucky
    if (x >= 0 && y > 0) return '#60a5fa';  // Top Right: Good & Unlucky
    if (x < 0 && y <= 0) return '#fbbf24';  // Bottom Left: Bad & Lucky
    return '#f87171'; // Top Left: Bad & Unlucky
  };

  // Helper for Heatmap cell color
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

  return (
    <div className="space-y-16">
      <header className="border-b border-slate-800 pb-8">
        <h1 className="text-4xl font-extrabold flex items-center gap-3">
          <BarChart3 className="w-10 h-10 text-emerald-400" />
          Analytics
        </h1>
        <p className="mt-4 text-slate-400 text-lg">
          Dive into the numbers behind the narratives. Discover who actually dominates, who gets lucky, and who chokes when it matters most.
        </p>
      </header>

      {/* LUCK INDEX */}
      <section>
        <div className="mb-6">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <ScatterIcon className="text-purple-400" /> The Luck Index
          </h2>
          <p className="text-slate-400 mt-2">
            Plotting Points For vs Average (X-axis) against Points Against vs Average (Y-axis). <br/>
            <span className="text-emerald-400 font-medium">Bottom Right:</span> Good & Lucky (Score High, Low PA) <br/>
            <span className="text-blue-400 font-medium">Top Right:</span> Good & Unlucky (Score High, High PA) <br/>
            <span className="text-amber-400 font-medium">Bottom Left:</span> Bad & Lucky (Score Low, Low PA) <br/>
            <span className="text-red-400 font-medium">Top Left:</span> Bad & Unlucky (Score Low, High PA)
          </p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 md:p-6 h-[500px] min-w-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 40, right: 30, bottom: 20, left: 20 }}>
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

      {/* CLUTCHNESS */}
      <section>
        <div className="mb-6">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="text-blue-400" /> Playoff Clutchness
          </h2>
          <p className="text-slate-400 mt-2">
            Comparing regular season points per game to playoff points per game.
          </p>
          <div className="mt-4 flex flex-wrap gap-6 text-xs font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2 text-emerald-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              Rises to the Occasion
            </span>
            <span className="flex items-center gap-2 text-red-400">
              <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]" />
              Shrinks from the Moment
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 md:p-6 h-[500px] overflow-x-auto no-scrollbar" onClick={() => setActiveBar(null)}>
          <div className="min-w-[800px] h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={clutchData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
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

      {/* DOMINANCE HEATMAP (Moved from Rivalries) */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Grid3X3 className="text-emerald-400" /> The Supremacy Matrix
        </h2>
        <p className="text-slate-400 mt-2">
          An interactive matrix showing the historical records between managers. <br/>
          <span className="text-emerald-400 font-medium text-xs font-bold uppercase">Reading the Grid:</span> The record shown is the <span className="underline decoration-emerald-500 underline-offset-4">Row Manager</span> vs the <span className="underline decoration-blue-500 underline-offset-4">Column Manager</span>.
        </p>
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
        </div>
        <div className="flex gap-6 text-xs font-bold uppercase tracking-widest justify-center md:justify-start">
          <span className="flex items-center gap-2 text-emerald-400"><div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500/50"></div> Winning Record</span>
          <span className="flex items-center gap-2 text-red-400"><div className="w-3 h-3 bg-red-500/20 border border-red-500/50"></div> Losing Record</span>
          <span className="flex items-center gap-2 text-slate-500"><div className="w-3 h-3 bg-slate-900 border border-slate-800"></div> Even</span>
        </div>
      </section>
    </div>
  );
}
