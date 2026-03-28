"use client";

import Link from 'next/link';
import { Crown, Calendar, X } from 'lucide-react';
import { useModalEscape } from '@/hooks/useModalEscape';
import { getWeeklyHighScores } from '@/utils/dataProcessing';

interface Props {
  manager: string;
  footerHref: string;
  footerLabel: string;
  onClose: () => void;
}

export default function HighRollerModal({ manager, footerHref, footerLabel, onClose }: Props) {
  const weeklyHighs = getWeeklyHighScores();
  const managerGames = weeklyHighs.filter(h => h.manager === manager);

  useModalEscape(onClose);

  const byYear = managerGames.reduce<Record<string, typeof managerGames>>((acc, g) => {
    if (!acc[g.year]) acc[g.year] = [];
    acc[g.year].push(g);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-emerald-400" /> {manager}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">{managerGames.length} high score{managerGames.length !== 1 ? 's' : ''} all-time</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {Object.keys(byYear).sort((a, b) => parseInt(b) - parseInt(a)).map(year => (
            <div key={year}>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>{year}</span>
                <span className="text-emerald-400">{byYear[year].length} 👑</span>
              </div>
              <div className="space-y-1.5">
                {byYear[year]
                  .sort((a, b) => b.week - a.week)
                  .map((g, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-sm text-slate-300">Week {g.week}</span>
                      </div>
                      <span className="text-sm font-bold font-mono text-emerald-400">{g.points}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800">
          <Link
            href={footerHref}
            className="block text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
            onClick={onClose}
          >
            {footerLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
