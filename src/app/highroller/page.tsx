"use client";

import { getWeeklyHighScores, getHighRollerStats } from '@/utils/dataProcessing';
import { DollarSign, TrendingUp, Calendar, Crown, Sparkles, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import React, { useState, useRef } from 'react';
import { useModalEscape } from '@/hooks/useModalEscape';
import WeekLeaderboardModal from '@/components/WeekLeaderboardModal';
import HighRollerModal from '@/components/HighRollerModal';


function SeasonRecapModal({ year, onClose }: { year: string; onClose: () => void }) {
  const weeklyHighs = getWeeklyHighScores().filter(h => h.year === year).sort((a, b) => a.week - b.week);

  useModalEscape(onClose);

  const totalPayout = weeklyHighs.length * 15;
  const winCounts = weeklyHighs.reduce((acc, h) => { acc[h.manager] = (acc[h.manager] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">{year} Season</h2>
            <p className="text-sm text-slate-400 mt-0.5">{weeklyHighs.length} weeks · {Object.keys(winCounts).length} unique winners · <span className="text-emerald-400 font-medium">${totalPayout} paid out</span></p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-1.5">
          {weeklyHighs.map((h, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-12 shrink-0">Week {h.week}</span>
                <div className="flex items-center gap-2">
                  <Crown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-sm font-medium text-white">{h.manager}</span>
                  {winCounts[h.manager] > 1 && (
                    <span className="text-xs text-slate-500">×{winCounts[h.manager]}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold font-mono text-emerald-400">{h.points.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


function HighRollerContent() {
  const weeklyHighs = getWeeklyHighScores();
  const highRollerStats = getHighRollerStats();

  const years = ['2025', '2024'];
  const [topYear, setTopYear] = useState(0);
  const [yearDragX, setYearDragX] = useState(0);
  const [isDraggingYear, setIsDraggingYear] = useState(false);
  const yearStartX = useRef(0);
  const yearDragActive = useRef(false);
  const wasDragging = useRef(false);

  const onYearPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    yearStartX.current = e.clientX;
    yearDragActive.current = false;
  };
  const onYearPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const dx = e.clientX - yearStartX.current;
    if (!yearDragActive.current && Math.abs(dx) > 8) {
      yearDragActive.current = true;
      setIsDraggingYear(true);
    }
    if (yearDragActive.current) setYearDragX(dx);
  };
  const onYearPointerUp = () => {
    wasDragging.current = yearDragActive.current;
    if (yearDragActive.current) {
      setIsDraggingYear(false);
      if (yearDragX < -60 && topYear < years.length - 1) setTopYear(i => i + 1);
      else if (yearDragX > 60 && topYear > 0) setTopYear(i => i - 1);
      setYearDragX(0);
    }
    yearDragActive.current = false;
  };

  const [activeBar, setActiveBar] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'winners' | 'breakdown'>('winners');
  const [selectedWeek, setSelectedWeek] = useState<{ year: string; week: number; manager: string } | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [selectedSeasonYear, setSelectedSeasonYear] = useState<string | null>(null);

  const getWinnerColor = (manager: any, stats: any[]) => {
    const earnings = manager.totalEarnings;
    const sortedEarnings = [...new Set(stats.map(s => s.totalEarnings))].sort((a, b) => b - a);
    const rank = sortedEarnings.indexOf(earnings);
    if (rank === 0) return '#10b981';
    if (rank === 1) return '#06d6a0';
    if (rank === 2) return '#ffd166';
    return '#64748b';
  };

  const formatCurrency = (amount: number) => `$${amount}`;

  const ManagerTile = ({ stats }: { stats: typeof highRollerStats[number] }) => (
    <button
      onClick={() => setSelectedManager(stats.manager)}
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full text-left hover:border-slate-700 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">{stats.manager}</h3>
        <div className="text-right">
          <div className="flex items-center gap-1 text-emerald-400">
            <Crown className="w-5 h-5" />
            <span className="text-2xl font-bold">{stats.totalWins}</span>
          </div>
          <div className="text-lg font-bold text-green-400">{formatCurrency(stats.totalEarnings)}</div>
        </div>
      </div>
      <div className="space-y-3">
        {Object.entries(stats.seasons).map(([year, seasonStats]) => (
          <div key={year} className="flex items-center justify-between text-sm">
            <span className="text-slate-400">{year}:</span>
            <div className="flex items-center gap-3">
              <span className="text-white font-bold">{seasonStats.wins} wins</span>
              <span className="text-green-400 font-bold">{formatCurrency(seasonStats.earnings)}</span>
              <span className="text-slate-500">({seasonStats.avgScore} avg)</span>
            </div>
          </div>
        ))}
      </div>
    </button>
  );

  return (
    <>
      {selectedWeek && (
        <WeekLeaderboardModal
          year={selectedWeek.year}
          week={selectedWeek.week}
          highlightedManager={selectedWeek.manager}
          mode="glory"
          onClose={() => setSelectedWeek(null)}
        />
      )}
      {selectedManager && (
        <HighRollerModal
          manager={selectedManager}
          footerHref={`/managers/${encodeURIComponent(selectedManager)}`}
          footerLabel="View Full Profile →"
          onClose={() => setSelectedManager(null)}
        />
      )}
      {selectedSeasonYear && (
        <SeasonRecapModal year={selectedSeasonYear} onClose={() => setSelectedSeasonYear(null)} />
      )}
      <div className="space-y-8 md:space-y-16">
      <header className="border-b border-slate-800 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
            <DollarSign className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" />
            High Roller Leaderboard
          </h1>
          <span className="text-slate-500 text-xs md:text-lg md:text-slate-400">Established 2024</span>
        </div>
        <p className="mt-2 text-slate-500 text-xs md:text-lg md:text-slate-400 md:mt-4">
          Weekly high scores: Manager with the highest score each week gets money from the pot.
          <span className="block mt-2 text-emerald-400 font-medium">
            💰 Score big, get paid.
          </span>
        </p>
      </header>

      {/* HIGH ROLLER LEADERBOARD */}
      <section>
        <div className="mb-6">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="text-emerald-400" /> Money Leaders
          </h2>
          <p className="text-slate-400 mt-2">Total weekly high scores and earnings since the rule started.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6 overflow-x-auto" onClick={() => setActiveBar(null)}>
          <div style={{ minWidth: `${Math.max(500, highRollerStats.length * 65)}px`, height: '360px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={highRollerStats} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
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
                          <div className="text-emerald-400">{formatCurrency(payload[0].payload.totalEarnings)} earned</div>
                          <div className="text-slate-300">{payload[0].payload.totalWins} wins 👑</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="totalEarnings" name="Total Earnings" radius={[4, 4, 0, 0]}>
                  {highRollerStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getWinnerColor(entry, highRollerStats)}
                      onMouseEnter={() => { if (window.innerWidth > 768) setActiveBar(entry.manager); }}
                      onMouseLeave={() => { if (window.innerWidth > 768) setActiveBar(null); }}
                      onClick={(e) => { e.stopPropagation(); setActiveBar(entry.manager === activeBar ? null : entry.manager); }}
                      className="cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-6 flex gap-6 text-xs font-bold uppercase tracking-widest justify-center md:justify-start">
          <span className="flex items-center gap-2 text-emerald-500"><Crown className="w-4 h-4" /> Money King</span>
          <span className="flex items-center gap-2 text-teal-400"><Sparkles className="w-4 h-4" /> High Roller</span>
          <span className="flex items-center gap-2 text-yellow-400"><DollarSign className="w-4 h-4" /> Big Earner</span>
        </div>
      </section>

      {/* SEASON TOTALS */}
      <section>
        <div className="mb-6">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="text-blue-400" /> Season Summary
          </h2>
          <p className="text-slate-400 mt-2">Total money distributed each season.</p>
        </div>

        {/* Mobile: swipeable carousel */}
        <div className="md:hidden flex flex-col gap-4">
          <div
            className="overflow-hidden cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none' }}
            onPointerDown={onYearPointerDown}
            onPointerMove={onYearPointerMove}
            onPointerUp={onYearPointerUp}
          >
            <div
              className="flex gap-4"
              style={{
                transform: `translateX(calc(-${topYear * 85}% - ${topYear * 16}px + ${yearDragX}px))`,
                transition: isDraggingYear ? 'none' : 'transform 0.3s ease',
              }}
            >
              {years.map(year => {
                const yearHighs = weeklyHighs.filter(h => h.year === year);
                const totalPayout = yearHighs.length * 15;
                const uniqueWinners = new Set(yearHighs.map(h => h.manager)).size;
                const winCounts = yearHighs.reduce((acc, h) => { acc[h.manager] = (acc[h.manager] || 0) + 1; return acc; }, {} as Record<string, number>);
                const topWinner = Object.entries(winCounts).sort(([, a], [, b]) => b - a)[0];
                return (
                  <button key={year} style={{ minWidth: '85%' }} onClick={() => { if (wasDragging.current) { wasDragging.current = false; return; } setSelectedSeasonYear(year); }} className="bg-slate-900 border border-slate-800 rounded-xl p-6 select-none w-full text-left hover:border-slate-700 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-white">{year} Season</h3>
                      <div className="text-3xl font-bold text-emerald-400">{formatCurrency(totalPayout)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><div className="text-slate-400">Total Weeks</div><div className="text-xl font-bold text-white">{yearHighs.length}</div></div>
                      <div><div className="text-slate-400">Unique Winners</div><div className="text-xl font-bold text-white">{uniqueWinners}</div></div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <div className="text-slate-400 text-xs">Most Wins</div>
                      {topWinner && (
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-bold text-white">{topWinner[0]}</span>
                          <span className="text-emerald-400 font-bold">{topWinner[1]} wins</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-1.5 justify-center">
            {years.map((_, i) => (
              <div key={i} className={`rounded-full transition-all duration-300 ${i === topYear ? 'w-4 h-1.5 bg-emerald-400' : 'w-1.5 h-1.5 bg-slate-600'}`} />
            ))}
          </div>
        </div>

        {/* Desktop: grid of cards */}
        <div className="hidden md:grid md:grid-cols-2 gap-4">
          {years.map(year => {
            const yearHighs = weeklyHighs.filter(h => h.year === year);
            const totalPayout = yearHighs.length * 15;
            const uniqueWinners = new Set(yearHighs.map(h => h.manager)).size;
            const winCounts = yearHighs.reduce((acc, h) => { acc[h.manager] = (acc[h.manager] || 0) + 1; return acc; }, {} as Record<string, number>);
            const topWinner = Object.entries(winCounts).sort(([, a], [, b]) => b - a)[0];
            return (
              <button key={year} onClick={() => setSelectedSeasonYear(year)} className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full text-left hover:border-slate-700 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">{year} Season</h3>
                  <div className="text-3xl font-bold text-emerald-400">{formatCurrency(totalPayout)}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><div className="text-slate-400">Total Weeks</div><div className="text-xl font-bold text-white">{yearHighs.length}</div></div>
                  <div><div className="text-slate-400">Unique Winners</div><div className="text-xl font-bold text-white">{uniqueWinners}</div></div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="text-slate-400 text-xs">Most Wins</div>
                  {topWinner && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-white">{topWinner[0]}</span>
                      <span className="text-emerald-400 font-bold">{topWinner[1]} wins</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* RECENT WINNERS / EARNINGS BREAKDOWN */}
      <section>
        {/* Mobile: tab toggle */}
        <div className="md:hidden">
          <div className="flex border border-slate-700 rounded-lg overflow-hidden w-full mb-4">
            <button
              onClick={() => setActiveTab('winners')}
              className={`flex-1 px-5 py-2.5 text-sm font-medium transition-colors ${activeTab === 'winners' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              👑 Recent Winners
            </button>
            <button
              onClick={() => setActiveTab('breakdown')}
              className={`flex-1 px-5 py-2.5 text-sm font-medium transition-colors border-l border-slate-700 ${activeTab === 'breakdown' ? 'bg-green-500/20 text-green-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              💰 Year by Year
            </button>
          </div>
          {activeTab === 'winners' && (
            <div className="grid gap-3">
              {weeklyHighs.slice(0, 10).map((high) => (
                <button
                  key={`${high.year}-${high.week}-${high.manager}`}
                  onClick={() => setSelectedWeek({ year: high.year, week: high.week, manager: high.manager })}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between hover:bg-slate-800/50 hover:border-slate-700 transition-colors cursor-pointer w-full text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-400 font-mono text-sm">
                      <Calendar className="w-4 h-4" />
                      {high.year} Week {high.week}
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-emerald-400" />
                      <span className="text-lg font-bold text-white">{high.manager}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400">{high.points}</div>
                    <div className="text-sm text-emerald-300 font-medium">{formatCurrency(15)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {activeTab === 'breakdown' && (
            <div className="grid gap-4">
              {highRollerStats.map((stats) => <ManagerTile key={stats.manager} stats={stats} />)}
            </div>
          )}
        </div>

        {/* Desktop: side by side */}
        <div className="hidden md:grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">👑 Recent Winners</h2>
            <div className="grid gap-3">
              {weeklyHighs.slice(0, 10).map((high) => (
                <button
                  key={`${high.year}-${high.week}-${high.manager}`}
                  onClick={() => setSelectedWeek({ year: high.year, week: high.week, manager: high.manager })}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between hover:bg-slate-800/50 hover:border-slate-700 transition-colors cursor-pointer w-full text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-400 font-mono text-sm">
                      <Calendar className="w-4 h-4" />
                      {high.year} Week {high.week}
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-emerald-400" />
                      <span className="text-lg font-bold text-white">{high.manager}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400">{high.points}</div>
                    <div className="text-sm text-emerald-300 font-medium">{formatCurrency(15)}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><DollarSign className="text-green-400 w-6 h-6" /> Year by Year</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              {(() => {
                const leftCol: typeof highRollerStats = [];
                const rightCol: typeof highRollerStats = [];
                let leftHeight = 0;
                let rightHeight = 0;
                highRollerStats.forEach(stats => {
                  const weight = 3 + Object.keys(stats.seasons).length;
                  if (leftHeight <= rightHeight) { leftCol.push(stats); leftHeight += weight; }
                  else { rightCol.push(stats); rightHeight += weight; }
                });
                return (
                  <>
                    <div className="space-y-4">{leftCol.map(s => <ManagerTile key={s.manager} stats={s} />)}</div>
                    <div className="space-y-4">{rightCol.map(s => <ManagerTile key={s.manager} stats={s} />)}</div>
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

export default function HighRollerPage() {
  return <HighRollerContent />;
}
