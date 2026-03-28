"use client";

import { useState, useEffect, Suspense } from 'react';
import { useModalEscape } from '@/hooks/useModalEscape';
import { useSearchParams, useRouter } from 'next/navigation';
import { getLeagueData, SeasonTeam } from '@/utils/dataProcessing';
import { getTeamWeeklyResults, type WeeklyResult } from '@/utils/weeklyResults';
import { Calendar, Medal, ArrowUpDown, Trash2, X } from 'lucide-react';
import Link from 'next/link';

const parseFinish = (finish: string | undefined): number => {
  if (!finish) return 999;
  const match = finish.match(/\d+/);
  return match ? parseInt(match[0]) : 999;
};

function SeasonModal({ team, year, onClose }: { team: SeasonTeam; year: string; onClose: () => void }) {
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
          {/* Regular season */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Regular Season</div>
            <div className="space-y-1.5">
              {regularResults.map((r, i) => <ResultRow key={i} r={r} />)}
            </div>
          </div>

          {/* Playoffs */}
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
            href={`/managers/${encodeURIComponent(team.owner)}`}
            className="block text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            View {team.owner}'s Profile →
          </Link>
        </div>
      </div>
    </div>
  );
}

function SeasonsContent() {
  const data = getLeagueData();
  const years = Object.keys(data.seasons).sort((a, b) => parseInt(b) - parseInt(a));
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    const y = searchParams.get('year');
    return y && years.includes(y) ? y : years[0];
  });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({
    key: 'playoff_finish',
    direction: 'asc'
  });
  const [selectedTeam, setSelectedTeam] = useState<SeasonTeam | null>(null);

  // Auto-open a team modal when navigating from the manager profile, then clean up the URL
  useEffect(() => {
    const owner = searchParams.get('owner');
    if (!owner) return;
    const timer = setTimeout(() => {
      const team = data.seasons[selectedYear]?.find(t => t.owner === owner);
      if (team) {
        setSelectedTeam(team);
        router.replace(`/seasons?year=${selectedYear}`, { scroll: false });
      }
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const seasonData = data.seasons[selectedYear];

  const sortedSeason = [...seasonData].sort((a, b) => {
    let aVal: any;
    let bVal: any;
    let direction = sortConfig?.direction || 'asc';

    if (!sortConfig) {
      const aFinish = parseFinish(a.playoff_finish);
      const bFinish = parseFinish(b.playoff_finish);
      if (aFinish !== bFinish) return aFinish - bFinish;
      const aWins = a.regular_season.wins;
      const bWins = b.regular_season.wins;
      if (aWins !== bWins) return bWins - aWins;
      return b.regular_season.pf - a.regular_season.pf;
    }

    const key = sortConfig.key;
    if (key === 'playoff_finish') {
      aVal = parseFinish(a.playoff_finish);
      bVal = parseFinish(b.playoff_finish);
    } else if (key === 'record') {
      aVal = a.regular_season.wins;
      bVal = b.regular_season.wins;
    } else if (key === 'pf') {
      aVal = a.regular_season.pf;
      bVal = b.regular_season.pf;
    } else if (key === 'pa') {
      aVal = a.regular_season.pa;
      bVal = b.regular_season.pa;
    } else if (key === 'team' || key === 'owner') {
      aVal = a[key as keyof SeasonTeam];
      bVal = b[key as keyof SeasonTeam];
    } else {
      aVal = (a as any)[key];
      bVal = (b as any)[key];
    }

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return <ArrowUpDown className={`w-3 h-3 ml-1 inline-block ${sortConfig.direction === 'desc' ? 'rotate-180' : ''} text-emerald-400`} />;
    }
    return <ArrowUpDown className="w-3 h-3 ml-1 inline-block opacity-20 group-hover:opacity-100" />;
  };

  return (
    <div className="space-y-8">
      {selectedTeam && (
        <SeasonModal team={selectedTeam} year={selectedYear} onClose={() => setSelectedTeam(null)} />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-extrabold flex items-center gap-3">
          <Calendar className="w-10 h-10 text-emerald-400" />
          Season History
        </h1>
        <select
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(e.target.value);
            setSortConfig(null);
            router.replace(`?year=${e.target.value}`, { scroll: false });
          }}
          className="bg-slate-900 border border-slate-700 text-white text-lg rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none cursor-pointer"
        >
          {years.map(year => (
            <option key={year} value={year}>{year} Season</option>
          ))}
        </select>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 cursor-pointer group hover:bg-slate-800 transition-colors whitespace-nowrap" onClick={() => handleSort('playoff_finish')}>
                  <div className="flex items-center">Standing {getSortIcon('playoff_finish')}</div>
                </th>
                <th className="px-6 py-4 cursor-pointer group hover:bg-slate-800 transition-colors whitespace-nowrap" onClick={() => handleSort('team')}>
                  <div className="flex items-center">Team Name {getSortIcon('team')}</div>
                </th>
                <th className="px-6 py-4 cursor-pointer group hover:bg-slate-800 transition-colors whitespace-nowrap" onClick={() => handleSort('owner')}>
                  <div className="flex items-center">Manager {getSortIcon('owner')}</div>
                </th>
                <th className="px-6 py-4 cursor-pointer group hover:bg-slate-800 transition-colors whitespace-nowrap" onClick={() => handleSort('record')}>
                  <div className="flex items-center justify-end">Record {getSortIcon('record')}</div>
                </th>
                <th className="px-6 py-4 cursor-pointer group hover:bg-slate-800 transition-colors whitespace-nowrap" onClick={() => handleSort('pf')}>
                  <div className="flex items-center justify-end">Points For {getSortIcon('pf')}</div>
                </th>
                <th className="px-6 py-4 cursor-pointer group hover:bg-slate-800 transition-colors whitespace-nowrap" onClick={() => handleSort('pa')}>
                  <div className="flex items-center justify-end">Points Against {getSortIcon('pa')}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedSeason.map((team, index) => (
                <tr
                  key={index}
                  onClick={() => setSelectedTeam(team)}
                  className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    {team.playoff_finish ? (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        team.playoff_finish.includes('1st') ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20' :
                        team.playoff_finish.includes('2nd') ? 'bg-slate-300/10 text-slate-300 border border-slate-300/20' :
                        team.playoff_finish.includes('3rd') ? 'bg-amber-600/10 text-amber-600 border border-amber-600/20' :
                        team.playoff_finish.includes('12th') ? 'bg-red-500/10 text-red-400 border border-red-400/20' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {(team.playoff_finish.includes('1st') || team.playoff_finish.includes('2nd') || team.playoff_finish.includes('3rd')) && <Medal className="w-3 h-3" />}
                        {team.playoff_finish.includes('12th') && <Trash2 className="w-3 h-3" />}
                        {team.playoff_finish}
                      </span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-white group-hover:text-emerald-400 transition-colors">{team.team}</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/managers/${team.owner}`}
                      className="hover:underline decoration-emerald-500 underline-offset-4"
                      onClick={e => e.stopPropagation()}
                    >
                      {team.owner}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    {`${team.regular_season.wins}-${team.regular_season.losses}`}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {team.regular_season.pf.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400">
                    {team.regular_season.pa.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function SeasonsPage() {
  return <Suspense><SeasonsContent /></Suspense>;
}
