"use client";

import { useState } from 'react';
import { ManagerRecord } from '@/utils/dataProcessing';
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

interface CumulativeTableProps {
  initialRecords: ManagerRecord[];
}

export default function CumulativeTable({ initialRecords }: CumulativeTableProps) {
  const [records, setRecords] = useState(initialRecords);
  const [sortConfig, setSortConfig] = useState<{ key: keyof ManagerRecord | 'winPct'; direction: 'asc' | 'desc' } | null>({
    key: 'wins',
    direction: 'desc'
  });

  const handleSort = (key: keyof ManagerRecord | 'winPct') => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }

    const sortedData = [...records].sort((a, b) => {
      let aVal: any = a[key as keyof ManagerRecord];
      let bVal: any = b[key as keyof ManagerRecord];

      if (key === 'winPct') {
        aVal = a.wins / (a.wins + a.losses);
        bVal = b.wins / (b.wins + b.losses);
      } else if (key === 'playoff_record') {
        const [aw, al] = a.playoff_record.split('-').map(Number);
        const [bw, bl] = b.playoff_record.split('-').map(Number);
        aVal = aw / (aw + al || 1);
        bVal = bw / (bw + bl || 1);
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setRecords(sortedData);
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return <ArrowUpDown className={`w-3 h-3 ml-1 inline-block ${sortConfig.direction === 'asc' ? 'rotate-180' : ''} text-emerald-400`} />;
    }
    return <ArrowUpDown className="w-3 h-3 ml-1 inline-block opacity-20 group-hover:opacity-100" />;
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 cursor-pointer group hover:bg-slate-800 transition-colors whitespace-nowrap" onClick={() => handleSort('manager')}>
                <div className="flex items-center">Manager {getSortIcon('manager')}</div>
              </th>
              <th className="px-6 py-4 cursor-pointer group hover:bg-slate-800 transition-colors whitespace-nowrap" onClick={() => handleSort('wins')}>
                <div className="flex items-center">Wins {getSortIcon('wins')}</div>
              </th>
              <th className="px-6 py-4 cursor-pointer group hover:bg-slate-800 transition-colors whitespace-nowrap" onClick={() => handleSort('losses')}>
                <div className="flex items-center">Losses {getSortIcon('losses')}</div>
              </th>
              <th className="px-6 py-4 cursor-pointer group hover:bg-slate-800 transition-colors whitespace-nowrap" onClick={() => handleSort('winPct')}>
                <div className="flex items-center">Win % {getSortIcon('winPct')}</div>
              </th>
              <th className="px-6 py-4 cursor-pointer group hover:bg-slate-800 transition-colors whitespace-nowrap" onClick={() => handleSort('playoff_record')}>
                <div className="flex items-center">Playoff Record {getSortIcon('playoff_record')}</div>
              </th>
              <th className="px-6 py-4 cursor-pointer group hover:bg-slate-800 transition-colors whitespace-nowrap" onClick={() => handleSort('pf_vs_avg')}>
                <div className="flex items-center">PF vs Avg {getSortIcon('pf_vs_avg')}</div>
              </th>
              <th className="px-6 py-4 cursor-pointer group hover:bg-slate-800 transition-colors whitespace-nowrap" onClick={() => handleSort('pa_vs_avg')}>
                <div className="flex items-center">PA vs Avg {getSortIcon('pa_vs_avg')}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const totalGames = record.wins + record.losses;
              const winPct = totalGames > 0 ? ((record.wins / totalGames) * 100).toFixed(1) : "0.0";
              return (
                <tr key={record.manager} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-emerald-400">
                    <Link href={`/managers/${record.manager}`} className="hover:underline">{record.manager}</Link>
                  </td>
                  <td className="px-6 py-4">{record.wins}</td>
                  <td className="px-6 py-4">{record.losses}</td>
                  <td className="px-6 py-4">{winPct}%</td>
                  <td className="px-6 py-4">{record.playoff_record}</td>
                  <td className={`px-6 py-4 ${record.pf_vs_avg > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {record.pf_vs_avg > 0 ? '+' : ''}{record.pf_vs_avg}
                  </td>
                  <td className={`px-6 py-4 ${record.pa_vs_avg < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {record.pa_vs_avg > 0 ? '+' : ''}{record.pa_vs_avg}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
