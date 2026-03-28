"use client";

import { useState } from 'react';
import { History } from 'lucide-react';
import { SeasonTeam } from '@/utils/dataProcessing';
import SeasonModal from '@/components/SeasonModal';

interface HistoryEntry {
  year: string;
  team: SeasonTeam;
}

export default function TeamHistorySection({ history }: { history: HistoryEntry[] }) {
  const [selected, setSelected] = useState<HistoryEntry | null>(null);

  return (
    <section>
      {selected && (
        <SeasonModal
          team={selected.team}
          year={selected.year}
          footerHref="/seasons"
          footerLabel="See all seasons →"
          onClose={() => setSelected(null)}
        />
      )}

      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <History className="text-blue-400" /> Team History
      </h2>
      <div className="space-y-4">
        {history.map((h) => (
          <button
            key={h.year}
            onClick={() => setSelected(h)}
            className="bg-slate-900 p-4 rounded-lg border border-slate-800 flex justify-between items-center hover:border-slate-700 transition-colors w-full text-left cursor-pointer"
          >
            <div>
              <span className="text-emerald-400 font-bold mr-3">{h.year}</span>
              <span className="font-medium text-lg">{h.team.team}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{h.team.playoff_finish || 'Missed Playoffs'}</div>
              <div className="text-xs text-slate-400">
                {`${h.team.regular_season.wins}-${h.team.regular_season.losses}`}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
