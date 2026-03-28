export interface WeeklyResult {
  week: number;
  isPlayoff: boolean;
  label: string;
  displayLabel: string;
  opponent: string;
  teamPoints: number;
  oppPoints: number;
  result: 'W' | 'L' | 'BYE';
}

const labelDisplayNames: Record<string, string> = {
  quarterfinal: 'Quarterfinal',
  semifinal: 'Semifinal',
  championship: 'Championship',
  '3rd_place_final': '3rd Place',
  '5th_place_final': '5th Place',
  '7th_place_final': '7th Place',
  '9th_place_final': '9th Place',
  sacko_semifinal: 'Sacko Semifinal',
  sacko_final: 'Sacko Final',
  '9th_place_final_sacko_qf': 'Sacko Quarterfinal',
  '10th_place_final_sacko_sf': 'Sacko Semifinal',
  sacko_roundrobin: 'Sacko Round Robin',
  consolation: 'Consolation',
};

function getDisplayLabel(isPlayoff: boolean, label: string, week: number): string {
  if (!isPlayoff) return `Week ${week}`;
  return labelDisplayNames[label] || (label ? label.replace(/_/g, ' ') : `Playoff Wk ${week}`);
}

export function getTeamWeeklyResults(year: string, manager: string): WeeklyResult[] {
  try {
    const matchupData = require(`../data/matchups/${year}_${year === '2025' ? 'sleeper' : 'espn'}.json`);
    const results: WeeklyResult[] = [];

    matchupData.matchups?.forEach((m: any) => {
      const isHome = m.home?.manager === manager;
      const isAway = m.away?.manager === manager;
      if (!isHome && !isAway) return;

      const teamPoints: number = isHome ? (m.home?.points ?? 0) : (m.away?.points ?? 0);
      const oppPoints: number = isHome ? (m.away?.points ?? 0) : (m.home?.points ?? 0);
      const opponent: string = isHome ? (m.away?.manager ?? 'BYE') : (m.home?.manager ?? 'BYE');

      // BYE week
      if (!m.away || opponent === 'BYE') {
        results.push({
          week: m.period,
          isPlayoff: m.isPlayoff,
          label: m.label || '',
          displayLabel: getDisplayLabel(m.isPlayoff, m.label || '', m.period),
          opponent: 'BYE',
          teamPoints,
          oppPoints: 0,
          result: 'BYE',
        });
        return;
      }

      let result: 'W' | 'L';
      if (m.winner === 'UNDECIDED') return; // skip unplayed
      if (m.winner === 'HOME') result = isHome ? 'W' : 'L';
      else result = isAway ? 'W' : 'L';

      results.push({
        week: m.period,
        isPlayoff: m.isPlayoff,
        label: m.label || '',
        displayLabel: getDisplayLabel(m.isPlayoff, m.label || '', m.period),
        opponent,
        teamPoints,
        oppPoints,
        result,
      });
    });

    // Sort: regular season by week, then playoffs by week
    return results.sort((a, b) => {
      if (a.isPlayoff !== b.isPlayoff) return a.isPlayoff ? 1 : -1;
      return a.week - b.week;
    });
  } catch {
    return [];
  }
}
