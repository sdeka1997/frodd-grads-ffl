import { ALL_YEARS, loadMatchups } from './seasons';

const labelDisplayNames: Record<string, string> = {
  quarterfinal: "Quarterfinal",
  semifinal: "Semifinal",
  championship: "Championship",
  "3rd_place_final": "3rd Place Final",
  "5th_place_semifinal": "5th Place Semifinal",
  "5th_place_final": "5th Place Final",
  "7th_place_final": "7th Place Final",
  sacko_semifinal: "Sacko Semifinal",
  sacko_final: "Sacko Final",
  sacko_roundrobin: "Sacko Round Robin",
  "9th_place_final": "9th Place Final",
  "9th_place_final_sacko_qf": "Sacko Quarterfinal",
  "10th_place_final_sacko_sf": "Sacko Semifinal",
  consolation_semifinal: "Consolation Semifinal",
};

export interface H2HGame {
  year: string;
  week: number;
  isPlayoff: boolean;
  displayLabel: string;
  result: 'W' | 'L';
  m1Points: number;
  m2Points: number;
}

// Every season, including one in progress (its scored weeks only)
const allSeasons = ALL_YEARS.map(year => ({ year, matchups: loadMatchups(year).matchups }));

export const getH2HGameLog = (m1: string, m2: string): H2HGame[] => {
  const games: H2HGame[] = [];

  allSeasons.forEach(({ year, matchups }) => {
    matchups.forEach(m => {
      if (!m.away || m.winner === 'UNDECIDED') return;

      const homeIsM1 = m.home.manager === m1 && m.away.manager === m2;
      const homeIsM2 = m.home.manager === m2 && m.away.manager === m1;
      if (!homeIsM1 && !homeIsM2) return;

      const label = m.label || '';
      const isBye = label.includes('bye') || label.includes('_bye');
      if (isBye) return;

      const m1IsHome = homeIsM1;
      const m1Points = m1IsHome ? (m.home.points || 0) : (m.away.points || 0);
      const m2Points = m1IsHome ? (m.away.points || 0) : (m.home.points || 0);
      const m1Won = m.winner === (m1IsHome ? 'HOME' : 'AWAY');

      let displayLabel: string;
      if (!m.isPlayoff) {
        displayLabel = 'Regular Season';
      } else {
        displayLabel = labelDisplayNames[label] || label;
      }

      games.push({
        year,
        week: m.period,
        isPlayoff: m.isPlayoff,
        displayLabel,
        result: m1Won ? 'W' : 'L',
        m1Points,
        m2Points,
      });
    });
  });

  return games;
};
