import { ALL_YEARS, loadMatchups } from './seasons';

const winnersLabels = ["quarterfinal", "semifinal", "championship"];
const sackoLabels = ["sacko_semifinal", "sacko_final", "9th_place_final_sacko_qf", "10th_place_final_sacko_sf"];

const labelDisplayNames: Record<string, string> = {
  quarterfinal: "Quarterfinal",
  semifinal: "Semifinal",
  championship: "Championship",
  sacko_semifinal: "Sacko Semifinal",
  sacko_final: "Sacko Final",
  "9th_place_final_sacko_qf": "Sacko Quarterfinal",
  "10th_place_final_sacko_sf": "Sacko Semifinal",
};

export interface HighStakesGame {
  year: string;
  week: number;
  label: string;
  displayLabel: string;
  result: 'W' | 'L';
  myPoints: number;
  oppPoints: number;
  opponent: string;
}

// Every season, including one in progress (its scored weeks only)
const allSeasons = ALL_YEARS.map(year => ({ year, matchups: loadMatchups(year).matchups }));

export const getManagerHighStakesGames = (managerName: string): HighStakesGame[] => {
  const games: HighStakesGame[] = [];

  allSeasons.forEach(({ year, matchups }) => {
    matchups
      .filter(m => {
        if (!m.isPlayoff || !m.away) return false;
        const label = m.label || '';
        if (!winnersLabels.includes(label) && !sackoLabels.includes(label)) return false;
        if (m.home.manager !== managerName && m.away.manager !== managerName) return false;
        return true;
      })
      .forEach(m => {
        const away = m.away!;
        const isHome = m.home.manager === managerName;
        const label = m.label || '';
        games.push({
          year,
          week: m.period,
          label,
          displayLabel: labelDisplayNames[label] || label,
          result: m.winner === (isHome ? 'HOME' : 'AWAY') ? 'W' : 'L',
          myPoints: isHome ? (m.home.points || 0) : (away.points || 0),
          oppPoints: isHome ? (away.points || 0) : (m.home.points || 0),
          opponent: isHome ? away.manager : m.home.manager,
        });
      });
  });

  return games;
};
