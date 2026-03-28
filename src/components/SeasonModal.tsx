"use client";

import Link from 'next/link';
import { X } from 'lucide-react';
import { useModalEscape } from '@/hooks/useModalEscape';
import { SeasonTeam } from '@/utils/dataProcessing';
import { getTeamWeeklyResults, type WeeklyResult } from '@/utils/weeklyResults';

interface Props {
  team: SeasonTeam;
  year: string;
  footerHref: string;
  footerLabel: string;
  onClose: () => void;
}

export default function SeasonModal({ team, year, footerHref, footerLabel, onClose }: Props) {
  const results = getTeamWeeklyResults(year, team.owner);
  const regularResults = results.filter(r => !r.isPlayoff);
  const playoffResults = results.filter(r => r.isPlayoff);

  useModalEscape(onClose);

  const ResultRow = ({ r }: { r: WeeklyResult }) => (
    <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${
      r.isPlayoff ? 'bg-yellow-400/5 border border-yellow-400/10' : 'bg-slate-800/50'
    }`}>
      <div className="flex items-center gap-3">
        {r.result !== 'BYE' ? (
          <span className={`text-xs font-bold w-5 ${r.result === 'W' ? 'text-emerald-400' : 'text-red-400'}`}>
            {r.result}
          </span>
        ) : (
          <span className="text-xs font-bold w-5 text-slate-500">—</span>
        )}
        <span className={`text-sm ${r.isPlayoff ? 'text-yellow-400' : 'text-slate-300'}`}>
          {r.displayLabel}
        </span>
        {r.result !== 'BYE' && (
          <span className="text-xs text-slate-500">vs {r.opponent}</span>
        )}
      </div>
      {r.result !== 'BYE' ? (
        <div className="text-sm font-mono text-right">
          <span className={`font-bold ${r.result === 'W' ? 'text-white' : 'text-slate-400'}`}>
            {r.teamPoints.toFixed(1)}
          </span>
          <span className="text-slate-600 mx-1">–</span>
          <span className="text-slate-500">{r.oppPoints.toFixed(1)}</span>
        </div>
      ) : (
        <span className="text-xs text-slate-600">BYE</span>
      )}
    </div>
  );

  const wins = regularResults.filter(r => r.result === 'W').length;
  const losses = regularResults.filter(r => r.result === 'L').length;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">{team.team}</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {team.owner} · {year} · {wins}–{losses}
              {team.playoff_finish && <span className="ml-2 text-slate-500">· {team.playoff_finish}</span>}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Regular Season</div>
            <div className="space-y-1.5">
              {regularResults.map((r, i) => <ResultRow key={i} r={r} />)}
            </div>
          </div>

          {playoffResults.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Playoffs</div>
              <div className="space-y-1.5">
                {playoffResults.map((r, i) => <ResultRow key={i} r={r} />)}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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
