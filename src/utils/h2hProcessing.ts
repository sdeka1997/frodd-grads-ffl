import h2hData from '../data/head_to_head.json';

export interface H2HMatrix {
  [manager: string]: {
    [opponent: string]: string; // "W-L" format
  };
}

export interface SeasonH2H {
  regular: {
    managers: string[];
    matrix: H2HMatrix;
  } | null;
  playoffs: {
    managers: string[];
    matrix: H2HMatrix;
  } | null;
}

export interface H2HData {
  seasons: {
    [year: string]: SeasonH2H;
  };
}

export const getH2HData = (): H2HData => {
  return h2hData as unknown as H2HData;
};

export const getLifetimeH2H = (m1: string, m2: string) => {
  let wins = 0;
  let losses = 0;
  let playoffWins = 0;
  let playoffLosses = 0;

  const data = getH2HData();
  Object.values(data.seasons).forEach((season) => {
    // Regular Season
    if (season.regular && season.regular.matrix[m1]?.[m2]) {
      const [w, l] = season.regular.matrix[m1][m2].split('-').map(Number);
      wins += w;
      losses += l;
    }
    // Playoffs
    if (season.playoffs && season.playoffs.matrix[m1]?.[m2]) {
      const [w, l] = season.playoffs.matrix[m1][m2].split('-').map(Number);
      playoffWins += w;
      playoffLosses += l;
    }
  });

  return {
    regular: { wins, losses },
    playoffs: { wins: playoffWins, losses: playoffLosses },
    total: { wins: wins + playoffWins, losses: losses + playoffLosses }
  };
};

export const getAllH2HManagers = (): string[] => {
  const managers = new Set<string>();
  const data = getH2HData();
  Object.values(data.seasons).forEach(season => {
    if (season.regular) season.regular.managers.forEach(m => managers.add(m));
    if (season.playoffs) season.playoffs.managers.forEach(m => managers.add(m));
  });
  return Array.from(managers).sort();
};
