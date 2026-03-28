import data2019 from '../data/matchups/2019_espn.json';
import data2020 from '../data/matchups/2020_espn.json';
import data2021 from '../data/matchups/2021_espn.json';
import data2022 from '../data/matchups/2022_espn.json';
import data2023 from '../data/matchups/2023_espn.json';
import data2024 from '../data/matchups/2024_espn.json';
import data2025 from '../data/matchups/2025_sleeper.json';

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

const allSeasons = [
  { year: '2019', matchups: data2019.matchups },
  { year: '2020', matchups: data2020.matchups },
  { year: '2021', matchups: data2021.matchups },
  { year: '2022', matchups: data2022.matchups },
  { year: '2023', matchups: data2023.matchups },
  { year: '2024', matchups: data2024.matchups },
  { year: '2025', matchups: data2025.matchups },
];

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
