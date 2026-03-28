"use client";

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getLeagueData, SeasonTeam } from '@/utils/dataProcessing';
import { Calendar, Medal, ArrowUpDown, Trash2 } from 'lucide-react';
import Link from 'next/link';
import SeasonModal from '@/components/SeasonModal';

const parseFinish = (finish: string | undefined): number => {
  if (!finish) return 999;
  const match = finish.match(/\d+/);
  return match ? parseInt(match[0]) : 999;
};

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
        <SeasonModal
          team={selectedTeam}
          year={selectedYear}
          footerHref={`/managers/${encodeURIComponent(selectedTeam.owner)}`}
          footerLabel={`View ${selectedTeam.owner}'s Profile →`}
          onClose={() => setSelectedTeam(null)}
        />
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
