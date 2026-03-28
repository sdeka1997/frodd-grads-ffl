"use client";

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAllH2HManagers, getLifetimeH2H } from '@/utils/h2hProcessing';
import { getCurrentManagers } from '@/utils/dataProcessing';
import { getH2HGameLog, type H2HGame } from '@/utils/h2hGameLog';
import { Swords, Trophy, History, X } from 'lucide-react';
import { useModalEscape } from '@/hooks/useModalEscape';

function GameLogModal({
  games,
  title,
  manager1,
  manager2,
  onClose,
}: {
  games: H2HGame[];
  title: string;
  manager1: string;
  manager2: string;
  onClose: () => void;
}) {
  useModalEscape(onClose);

  const byYear = games.reduce<Record<string, H2HGame[]>>((acc, g) => {
    if (!acc[g.year]) acc[g.year] = [];
    acc[g.year].push(g);
    return acc;
  }, {});

  const wins = games.filter(g => g.result === 'W').length;
  const losses = games.filter(g => g.result === 'L').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              <span className="text-emerald-400">{manager1}</span>
              <span className="text-slate-600 mx-1.5">vs</span>
              <span className="text-blue-400">{manager2}</span>
              <span className="ml-3 text-slate-500">{wins}–{losses}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {games.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12 text-slate-500">
            No games found.
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 p-4 space-y-4">
            {Object.keys(byYear).sort((a, b) => parseInt(b) - parseInt(a)).map(year => (
              <div key={year} className="bg-slate-800/40 rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{year}</span>
                  <span className="text-xs text-slate-600">
                    {byYear[year].filter(g => g.result === 'W').length}–{byYear[year].filter(g => g.result === 'L').length}
                  </span>
                </div>
                <div className="divide-y divide-slate-800/60">
                  {byYear[year].map((g, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold w-5 ${g.result === 'W' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {g.result}
                        </span>
                        <span className={`text-sm ${g.isPlayoff ? 'text-yellow-400' : 'text-slate-300'}`}>
                          {g.displayLabel}
                        </span>
                      </div>
                      <div className="text-sm font-mono">
                        <span className="font-bold text-white">{g.m1Points.toFixed(1)}</span>
                        <span className="text-slate-500 mx-1.5">–</span>
                        <span className="text-slate-400">{g.m2Points.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-3 border-t border-slate-800 text-xs text-slate-600 text-center">
          Score and result from <span className="text-emerald-400/70">{manager1}</span>'s perspective · <span className="text-yellow-400/70">Yellow</span> = playoff
        </div>
      </div>
    </div>
  );
}

function RivalriesContent() {
  const allManagers = useMemo(() => getAllH2HManagers(), []);
  const activeManagers = useMemo(() => getCurrentManagers().sort(), []);
  const searchParams = useSearchParams();

  const [manager1, setManager1] = useState(() => {
    const m = searchParams.get('m1');
    return m && allManagers.includes(m) ? m : (activeManagers[0] || allManagers[0]);
  });
  const [manager2, setManager2] = useState(() => {
    const m = searchParams.get('m2');
    return m && allManagers.includes(m) ? m : (activeManagers[1] || allManagers[1]);
  });

  const stats = useMemo(() => {
    if (manager1 === manager2) return null;
    return getLifetimeH2H(manager1, manager2);
  }, [manager1, manager2]);

  const games = useMemo(() => {
    if (manager1 === manager2) return [];
    return getH2HGameLog(manager1, manager2);
  }, [manager1, manager2]);

  const byYear = useMemo(() => {
    return games.reduce<Record<string, H2HGame[]>>((acc, g) => {
      if (!acc[g.year]) acc[g.year] = [];
      acc[g.year].push(g);
      return acc;
    }, {});
  }, [games]);

  const [activeModal, setActiveModal] = useState<'regular' | 'playoffs' | 'total' | null>(null);

  const getDominanceColor = (wins: number, losses: number) => {
    if (wins > losses) return 'text-emerald-400';
    if (losses > wins) return 'text-red-400';
    return 'text-slate-400';
  };

  const regularGames = games.filter(g => !g.isPlayoff);
  const playoffGames = games.filter(g => g.isPlayoff);

  return (
    <div className="space-y-16">
      {activeModal && (
        <GameLogModal
          games={
            activeModal === 'regular' ? regularGames :
            activeModal === 'playoffs' ? playoffGames :
            games
          }
          title={
            activeModal === 'regular' ? 'Regular Season Games' :
            activeModal === 'playoffs' ? 'Postseason Games' :
            'All Games'
          }
          manager1={manager1}
          manager2={manager2}
          onClose={() => setActiveModal(null)}
        />
      )}

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
              onChange={(e) => setManager1(e.target.value)}
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
              <button
                onClick={() => regularGames.length > 0 && setActiveModal('regular')}
                className={`bg-slate-950/50 p-6 rounded-xl border border-slate-800 text-center space-y-2 w-full transition-colors ${regularGames.length > 0 ? 'hover:border-slate-600 cursor-pointer' : 'cursor-default'}`}
              >
                <div className="flex justify-center mb-2"><History className="text-blue-400 w-6 h-6" /></div>
                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Regular Season</div>
                <div className={`text-4xl font-black ${getDominanceColor(stats.regular.wins, stats.regular.losses)}`}>
                  {stats.regular.wins} - {stats.regular.losses}
                </div>
              </button>

              <button
                onClick={() => games.length > 0 && setActiveModal('total')}
                className={`bg-slate-950/50 p-6 rounded-xl border border-slate-800 text-center space-y-2 transform md:scale-110 md:-translate-y-2 ring-2 ring-emerald-500/20 shadow-2xl w-full transition-colors ${games.length > 0 ? 'hover:border-slate-600 cursor-pointer' : 'cursor-default'}`}
              >
                <div className="flex justify-center mb-2"><Swords className="text-emerald-400 w-8 h-8" /></div>
                <div className="text-emerald-400/80 text-xs font-bold uppercase tracking-wider">Lifetime Series</div>
                <div className={`text-5xl font-black ${getDominanceColor(stats.total.wins, stats.total.losses)}`}>
                  {stats.total.wins} - {stats.total.losses}
                </div>
                <div className="text-slate-500 text-sm italic mt-2">
                  {stats.total.wins > stats.total.losses ? `${manager1} dominates` : stats.total.losses > stats.total.wins ? `${manager2} dominates` : "Dead Heat"}
                </div>
              </button>

              <button
                onClick={() => playoffGames.length > 0 && setActiveModal('playoffs')}
                className={`bg-slate-950/50 p-6 rounded-xl border border-slate-800 text-center space-y-2 w-full transition-colors ${playoffGames.length > 0 ? 'hover:border-slate-600 cursor-pointer' : 'cursor-default'}`}
              >
                <div className="flex justify-center mb-2"><Trophy className="text-yellow-400 w-6 h-6" /></div>
                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Postseason</div>
                <div className={`text-4xl font-black ${getDominanceColor(stats.playoffs.wins, stats.playoffs.losses)}`}>
                  {stats.playoffs.wins} - {stats.playoffs.losses}
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/30">
            <div className="text-slate-600 mb-4"><Swords className="w-12 h-12 opacity-20" /></div>
            <p className="text-slate-500 font-medium text-lg">
              Select two different managers to see their series history.
            </p>
            <p className="text-slate-600 text-sm mt-1">You can't have a rivalry with yourself (unless you're Smeet).</p>
          </div>
        )}
      </section>

      {/* GAME LOG */}
      {manager1 !== manager2 && games.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-slate-200 mb-6">
            Game Log: <span className="text-emerald-400">{manager1}</span> vs <span className="text-blue-400">{manager2}</span>
          </h2>
          <div className="space-y-6">
            {Object.keys(byYear).sort((a, b) => parseInt(b) - parseInt(a)).map(year => (
              <div key={year} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-5 py-3 bg-slate-950 border-b border-slate-800">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{year}</span>
                  <span className="ml-3 text-xs text-slate-600">
                    {byYear[year].filter(g => g.result === 'W').length}–{byYear[year].filter(g => g.result === 'L').length}
                  </span>
                </div>
                <div className="divide-y divide-slate-800/60">
                  {byYear[year].map((g, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-4">
                        <span className={`text-xs font-bold w-5 ${g.result === 'W' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {g.result}
                        </span>
                        <span className={`text-sm ${g.isPlayoff ? 'text-yellow-400' : 'text-slate-300'}`}>
                          {g.displayLabel}
                        </span>
                      </div>
                      <div className="text-sm font-mono">
                        <span className="font-bold text-white">{g.m1Points.toFixed(1)}</span>
                        <span className="text-slate-500 mx-1.5">–</span>
                        <span className="text-slate-400">{g.m2Points.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3 px-1">
            <span className="font-semibold">Reading tip:</span> Result and score are from <span className="text-emerald-400/70 font-medium">{manager1}</span>'s perspective. <span className="text-yellow-400/70">Yellow</span> = playoff game.
          </p>
        </section>
      )}

      {manager1 !== manager2 && games.length === 0 && (
        <section className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/30">
          <p className="text-slate-500 font-medium">No game history found between these two managers.</p>
        </section>
      )}
    </div>
  );
}

export default function RivalriesPage() {
  return <Suspense><RivalriesContent /></Suspense>;
}
