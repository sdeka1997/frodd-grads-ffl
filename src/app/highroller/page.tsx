"use client";

import { getWeeklyHighScores, getHighRollerStats } from '@/utils/dataProcessing';
import { DollarSign, TrendingUp, Calendar, Crown, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import React, { useState, useEffect, useRef } from 'react';

export default function HighRollerPage() {
  const weeklyHighs = getWeeklyHighScores();
  const highRollerStats = getHighRollerStats();

  const [activeTab, setActiveTab] = useState<'winners' | 'breakdown'>('winners');

  const years = ['2024', '2025'];
  const [topYear, setTopYear] = useState(0);
  const [yearDragX, setYearDragX] = useState(0);
  const [isDraggingYear, setIsDraggingYear] = useState(false);
  const yearStartX = useRef(0);

  const onYearPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    yearStartX.current = e.clientX;
    setIsDraggingYear(true);
  };
  const onYearPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingYear) return;
    setYearDragX(e.clientX - yearStartX.current);
  };
  const onYearPointerUp = () => {
    if (!isDraggingYear) return;
    setIsDraggingYear(false);
    if (yearDragX < -60 && topYear < years.length - 1) {
      setTopYear(i => i + 1);
    } else if (yearDragX > 60 && topYear > 0) {
      setTopYear(i => i - 1);
    }
    setYearDragX(0);
  };

  const [tooltip, setTooltip] = useState<{
    manager: string;
    earnings: number;
    wins: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const close = () => setTooltip(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const handleBarClick = (data: any, _index: number, event: any) => {
    event.stopPropagation();
    if (tooltip?.manager === data.manager) {
      setTooltip(null);
      return;
    }
    setTooltip({
      manager: data.manager,
      earnings: data.totalEarnings,
      wins: data.totalWins,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const getWinnerColor = (manager: any, stats: any[]) => {
    const earnings = manager.totalEarnings;
    const sortedEarnings = [...new Set(stats.map(s => s.totalEarnings))].sort((a, b) => b - a);
    const rank = sortedEarnings.indexOf(earnings);

    if (rank === 0) return '#10b981'; // Most dominant - emerald
    if (rank === 1) return '#06d6a0'; // Second - teal
    if (rank === 2) return '#ffd166'; // Third - gold
    return '#64748b'; // Others - slate
  };

  const formatCurrency = (amount: number) => `$${amount}`;

  return (
    <div className="space-y-16">
      <header className="border-b border-slate-800 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
            <DollarSign className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" />
            High Roller Leaderboard
          </h1>
          <span className="text-slate-500 text-sm">
            Established 2024
          </span>
        </div>
        <p className="mt-4 text-slate-400 text-lg">
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
          <p className="text-slate-400 mt-2">
            Total weekly high scores and earnings since the rule started.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6">
          <div className="overflow-x-auto">
            <div style={{ minWidth: `${Math.max(500, highRollerStats.length * 65)}px`, height: '360px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={highRollerStats}
                  margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="manager" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} width={35} />
                  <Bar dataKey="totalEarnings" name="Total Earnings" radius={[4, 4, 0, 0]} onClick={handleBarClick} style={{ cursor: 'pointer' }}>
                    {highRollerStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getWinnerColor(entry, highRollerStats)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {tooltip && (
          <div
            style={{ position: 'fixed', left: tooltip.x, top: tooltip.y - 12, transform: 'translate(-50%, -100%)', pointerEvents: 'none' }}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 z-50 shadow-xl text-sm"
          >
            <div className="font-bold text-white">{tooltip.manager}</div>
            <div className="text-emerald-400">{formatCurrency(tooltip.earnings)} earned</div>
            <div className="text-slate-300">{tooltip.wins} wins 👑</div>
          </div>
        )}

        <div className="mt-6 flex gap-6 text-xs font-bold uppercase tracking-widest justify-center md:justify-start">
          <span className="flex items-center gap-2 text-emerald-500">
            <Crown className="w-4 h-4" />
            Money King
          </span>
          <span className="flex items-center gap-2 text-teal-400">
            <Sparkles className="w-4 h-4" />
            High Roller
          </span>
          <span className="flex items-center gap-2 text-yellow-400">
            <DollarSign className="w-4 h-4" />
            Big Earner
          </span>
        </div>
      </section>

      {/* SEASON TOTALS */}
      <section>
        <div className="mb-6">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="text-blue-400" /> Season Summary
          </h2>
          <p className="text-slate-400 mt-2">
            Total money distributed each season.
          </p>
        </div>

        <div className="flex flex-col gap-4">
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
                const winCounts = yearHighs.reduce((acc, h) => {
                  acc[h.manager] = (acc[h.manager] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                const topWinner = Object.entries(winCounts).sort(([, a], [, b]) => b - a)[0];

                return (
                  <div key={year} style={{ minWidth: '85%' }} className="bg-slate-900 border border-slate-800 rounded-xl p-6 select-none">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-white">{year} Season</h3>
                      <div className="text-3xl font-bold text-emerald-400">{formatCurrency(totalPayout)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-slate-400">Total Weeks</div>
                        <div className="text-xl font-bold text-white">{yearHighs.length}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Unique Winners</div>
                        <div className="text-xl font-bold text-white">{uniqueWinners}</div>
                      </div>
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
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-1.5 justify-center">
            {years.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${i === topYear ? 'w-4 h-1.5 bg-emerald-400' : 'w-1.5 h-1.5 bg-slate-600'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* RECENT WINNERS / EARNINGS BREAKDOWN TABS */}
      <section>
        <div className="mb-4">
          <div className="flex border border-slate-700 rounded-lg overflow-hidden w-full">
            <button
              onClick={() => setActiveTab('winners')}
              className={`flex-1 px-5 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'winners'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              👑 Recent Winners
            </button>
            <button
              onClick={() => setActiveTab('breakdown')}
              className={`flex-1 px-5 py-2.5 text-sm font-medium transition-colors border-l border-slate-700 ${
                activeTab === 'breakdown'
                  ? 'bg-green-500/20 text-green-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              💰 Year by Year
            </button>
          </div>
        </div>

        {activeTab === 'winners' && (
          <div className="grid gap-4">
            {weeklyHighs.slice(0, 10).map((high) => (
              <div
                key={`${high.year}-${high.week}-${high.manager}`}
                className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
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
              </div>
            ))}
          </div>
        )}

        {activeTab === 'breakdown' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highRollerStats.map((stats) => (
              <div key={stats.manager} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
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
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}