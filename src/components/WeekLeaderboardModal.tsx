"use client";

import Link from 'next/link';
import { X } from 'lucide-react';
import { useModalEscape } from '@/hooks/useModalEscape';
import { getWeekScores } from '@/utils/weeklyScores';

interface Props {
  year: string;
  week: number;
  /** The manager to highlight (shotgun victim or high roller winner) */
  highlightedManager: string;
  /** 'shame' sorts lowest→highest (rank 1 = worst); 'glory' sorts highest→lowest (rank 1 = best) */
  mode: 'shame' | 'glory';
  onClose: () => void;
}

export default function WeekLeaderboardModal({ year, week, highlightedManager, mode, onClose }: Props) {
  const scores = getWeekScores(year, week).sort((a, b) =>
    mode === 'shame' ? a.points - b.points : b.points - a.points
  );

  useModalEscape(onClose);

  const isHighlighted = (manager: string) => manager === highlightedManager;

  const highlightBg    = mode === 'shame' ? 'bg-red-500/15 border border-red-500/30'  : 'bg-emerald-500/15 border border-emerald-500/30';
  const highlightText  = mode === 'shame' ? 'text-red-300'    : 'text-emerald-300';
  const highlightScore = mode === 'shame' ? 'text-red-400'    : 'text-emerald-400';
  const icon           = mode === 'shame' ? '🍺' : '👑';

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">{year} — Week {week}</h2>
            <p className="text-sm text-slate-400 mt-0.5">Full weekly leaderboard</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scores */}
        <div className="overflow-y-auto flex-1 p-4 space-y-1.5">
          {scores.map((s, i) => {
            const active = isHighlighted(s.manager);
            return (
              <div
                key={s.manager}
                className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                  active ? highlightBg : 'bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-4 text-right">
                    {mode === 'shame' ? scores.length - i : i + 1}
                  </span>
                  <span className={`text-sm font-medium ${active ? highlightText : 'text-slate-300'}`}>
                    {s.manager}
                  </span>
                  {active && <span className="text-xs">{icon}</span>}
                </div>
                <span className={`text-sm font-bold font-mono ${active ? highlightScore : 'text-white'}`}>
                  {s.points.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <Link
            href={`/managers/${encodeURIComponent(highlightedManager)}`}
            className="block text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
            onClick={onClose}
          >
            See {highlightedManager}&apos;s profile →
          </Link>
        </div>
      </div>
    </div>
  );
}
