"use client";

import { useState, useMemo } from 'react';
import { getAllH2HManagers, getLifetimeH2H } from '@/utils/h2hProcessing';
import { getCurrentManagers } from '@/utils/dataProcessing';
import { Swords, Search, Trophy, History, ArrowUpDown } from 'lucide-react';

export default function RivalriesPage() {
  const allManagers = useMemo(() => getAllH2HManagers(), []);
  const activeManagers = useMemo(() => getCurrentManagers().sort(), []);
  
  const [manager1, setManager1] = useState(activeManagers[0] || allManagers[0]);
  const [manager2, setManager2] = useState(activeManagers[1] || allManagers[1]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({
    key: 'winPct',
    direction: 'desc'
  });

  const stats = useMemo(() => {
    if (manager1 === manager2) return null;
    return getLifetimeH2H(manager1, manager2);
  }, [manager1, manager2]);

  const getDominanceColor = (wins: number, losses: number) => {
    if (wins > losses) return 'text-emerald-400';
    if (losses > wins) return 'text-red-400';
    return 'text-slate-400';
  };

  const tableData = useMemo(() => {
    const data = allManagers
      .filter(m => m !== manager1)
      .map(m => {
        const s = getLifetimeH2H(manager1, m);
        const total = s.total.wins + s.total.losses;
        const winPct = total > 0 ? (s.total.wins / total) : 0;
        return { name: m, total, wins: s.total.wins, losses: s.total.losses, winPct };
      })
      .filter(d => d.total > 0);

    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      let aVal = (a as any)[sortConfig.key];
      let bVal = (b as any)[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [manager1, allManagers, sortConfig]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return <ArrowUpDown className={`w-3 h-3 ml-1 inline-block ${sortConfig.direction === 'asc' ? 'rotate-180' : ''} text-emerald-400`} />;
    }
    return <ArrowUpDown className="w-3 h-3 ml-1 inline-block opacity-20 group-hover:opacity-100" />;
  };

  return (
    <div className="space-y-16">
      <header className="border-b border-slate-800 pb-8 text-center md:text-left">
        <h1 className="text-4xl font-extrabold flex items-center justify-center md:justify-start gap-3">
          <Swords className="w-10 h-10 text-red-500" />
          Rivalry Hub
        </h1>
        <p className="mt-4 text-slate-400 text-lg">
          Lifetime series records between any two managers. Find out who really runs the league.
        </p>
      </header>

      {/* MATCHUP TOOL */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <div className="flex flex-col items-center gap-4 w-full md:w-auto">
            <label className="text-slate-500 text-sm font-bold uppercase tracking-widest">Manager A</label>
            <select 
              value={manager1}
              onChange={(e) => {
                setManager1(e.target.value);
                setSortConfig(null);
              }}
              className="bg-slate-950 border border-slate-700 text-white text-2xl font-bold rounded-xl p-4 w-full md:w-64 focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
            >
              {allManagers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="text-slate-700 font-black text-4xl hidden md:block italic">VS</div>

          <div className="flex flex-col items-center gap-4 w-full md:w-auto">
            <label className="text-slate-500 text-sm font-bold uppercase tracking-widest">Manager B</label>
            <select 
              value={manager2}
              onChange={(e) => setManager2(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white text-2xl font-bold rounded-xl p-4 w-full md:w-64 focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
            >
              {allManagers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {stats && manager1 !== manager2 ? (
          <div className="mt-16 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800 text-center space-y-2">
                <div className="flex justify-center mb-2"><History className="text-blue-400 w-6 h-6" /></div>
                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Regular Season</div>
                <div className={`text-4xl font-black ${getDominanceColor(stats.regular.wins, stats.regular.losses)}`}>
                  {stats.regular.wins} - {stats.regular.losses}
                </div>
              </div>

              <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800 text-center space-y-2 transform md:scale-110 md:-translate-y-2 ring-2 ring-emerald-500/20 shadow-2xl">
                <div className="flex justify-center mb-2"><Swords className="text-emerald-400 w-8 h-8" /></div>
                <div className="text-emerald-400/80 text-xs font-bold uppercase tracking-wider">Lifetime Series</div>
                <div className={`text-5xl font-black ${getDominanceColor(stats.total.wins, stats.total.losses)}`}>
                  {stats.total.wins} - {stats.total.losses}
                </div>
                <div className="text-slate-500 text-sm italic mt-2">
                  {stats.total.wins > stats.total.losses ? `${manager1} dominates` : stats.total.losses > stats.total.wins ? `${manager2} dominates` : "Dead Heat"}
                </div>
              </div>

              <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800 text-center space-y-2">
                <div className="flex justify-center mb-2"><Trophy className="text-yellow-400 w-6 h-6" /></div>
                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Postseason</div>
                <div className={`text-4xl font-black ${getDominanceColor(stats.playoffs.wins, stats.playoffs.losses)}`}>
                  {stats.playoffs.wins} - {stats.playoffs.losses}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/30">
            <div className="text-slate-600 mb-4"><Swords className="w-12 h-12 opacity-20" /></div>
            <p className="text-slate-500 font-medium text-lg">
              Select two different managers to see their series history.
            </p>
            <p className="text-slate-600 text-sm mt-1">You can't have a rivalry with yourself (unless you're Josh).</p>
          </div>
        )}
      </section>

      {/* SERIES BREAKDOWN TABLE */}
      <section>
        <h2 className="text-xl md:text-3xl font-bold mb-6 flex items-center gap-2">
          <Search className="text-emerald-400 shrink-0 w-5 h-5 md:w-6 md:h-6" /> <span className="truncate">Series Breakdown: {manager1}</span>
        </h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto shadow-2xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 cursor-pointer group hover:bg-slate-800 transition-colors whitespace-nowrap" onClick={() => handleSort('name')}>
                  Opponent {getSortIcon('name')}
                </th>
                <th className="px-6 py-4 text-center cursor-pointer group hover:bg-slate-800 transition-colors whitespace-nowrap" onClick={() => handleSort('total')}>
                  Total Meetings {getSortIcon('total')}
                </th>
                <th className="px-6 py-4 text-center cursor-pointer group hover:bg-slate-800 transition-colors whitespace-nowrap min-w-[100px]" onClick={() => handleSort('wins')}>
                  Record {getSortIcon('wins')}
                </th>
                <th className="px-6 py-4 text-center cursor-pointer group hover:bg-slate-800 transition-colors whitespace-nowrap" onClick={() => handleSort('winPct')}>
                  Dominance {getSortIcon('winPct')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {tableData.map(d => (
                <tr key={d.name} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-white group-hover:text-emerald-400 transition-colors">{d.name}</td>
                  <td className="px-6 py-4 text-center text-slate-400">{d.total}</td>
                  <td className={`px-6 py-4 text-center font-mono font-bold ${getDominanceColor(d.wins, d.losses)}`}>
                    {d.wins} - {d.losses}
                  </td>
                  <td className="px-6 py-4 text-center min-w-[150px]">
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-1000" 
                        style={{ width: `${d.winPct * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
