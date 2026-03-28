import fflData from '../data/ffl_data.json';

export interface ManagerRecord {
  manager: string;
  wins: number;
  losses: number;
  pf_vs_avg: number;
  pa_vs_avg: number;
  championships: number;
  playoff_record: string;
}

export interface SeasonTeam {
  team: string;
  owner: string;
  regular_season: {
    wins: number;
    losses: number;
    pf: number;
    pa: number;
    pf_pg: number;
    pa_pg: number;
  };
  post_season: {
    wins: number;
    losses: number;
    pf: number;
    pa: number;
    bracket: string;
  };
  sacko_season: {
    wins: number;
    losses: number;
    pf: number;
    pa: number;
  };
  playoff_finish: string;
  playoff_record: string;
}

export interface FFLData {
  league_id: string;
  cumulative_records: ManagerRecord[];
  seasons: {
    [year: string]: SeasonTeam[];
  };
}

export const getLeagueData = (): FFLData => {
  return fflData as FFLData;
};

export const getCumulativeRecords = (): ManagerRecord[] => {
  return getLeagueData().cumulative_records.sort((a, b) => b.wins - a.wins);
};

export const getManagerStats = (managerName: string): ManagerRecord | undefined => {
  return getLeagueData().cumulative_records.find((m) => m.manager === managerName);
};

export const getSeasonData = (year: string): SeasonTeam[] => {
  return getLeagueData().seasons[year] || [];
};

export const getManagerHistory = (managerName: string) => {
  const history: { year: string; team: SeasonTeam }[] = [];
  const seasons = getLeagueData().seasons;
  
  for (const year of Object.keys(seasons).sort((a, b) => parseInt(a) - parseInt(b))) {
    const team = seasons[year].find((t) => t.owner === managerName);
    if (team) {
      history.push({ year, team });
    }
  }
  
  return history;
};

export const getCurrentManagers = (): string[] => {
  const season2025 = getSeasonData('2025');
  return season2025.map(t => t.owner);
};

// Advanced analytics helpers
export const getLuckIndex = () => {
  const currentManagers = getCurrentManagers();
  return getCumulativeRecords()
    .filter(record => currentManagers.includes(record.manager))
    .map((record) => ({
      name: record.manager,
      x: record.pf_vs_avg, // X-axis: Points For vs Avg
      y: record.pa_vs_avg, // Y-axis: Points Against vs Avg
    }));
};

export const getPlayoffClutchness = () => {
  const currentManagers = getCurrentManagers();
  const allSeasons = getLeagueData().seasons;

  return currentManagers.map((manager) => {
    let totalRegularPF = 0;
    let totalRegularGames = 0;
    let totalPlayoffPF = 0;
    let totalPlayoffGames = 0;

    // Only include seasons where the manager had championship or sacko playoff games,
    // so regular season and playoff PPG are compared on the same set of years
    Object.values(allSeasons).forEach((seasonTeams) => {
      const team = seasonTeams.find(t => t.owner === manager);
      if (!team) return;
      const champGames = team.post_season.wins + team.post_season.losses;
      const sackoGames = team.sacko_season.wins + team.sacko_season.losses;
      const playoffGames = champGames + sackoGames;
      if (playoffGames > 0) {
        totalRegularPF += team.regular_season.pf;
        totalRegularGames += team.regular_season.wins + team.regular_season.losses;
        totalPlayoffPF += team.post_season.pf + team.sacko_season.pf;
        totalPlayoffGames += playoffGames;
      }
    });

    const regularPPG = totalRegularGames > 0 ? totalRegularPF / totalRegularGames : 0;
    const playoffPPG = totalPlayoffGames > 0 ? totalPlayoffPF / totalPlayoffGames : 0;
    const differential = totalPlayoffGames > 0 ? playoffPPG - regularPPG : 0;

    return {
      name: manager,
      regularPPG: parseFloat(regularPPG.toFixed(2)),
      playoffPPG: parseFloat(playoffPPG.toFixed(2)),
      differential: parseFloat(differential.toFixed(2)),
      playoffGames: totalPlayoffGames
    };
  })
  .filter(manager => manager.playoffGames > 0) // Only include managers with playoff experience
  .sort((a, b) => b.differential - a.differential);
};

// Shotgun tracking - weekly low scores (2023 onwards, regular season only)
export interface WeeklyLowScore {
  year: string;
  week: number;
  manager: string;
  points: number;
}

export interface ShotgunStats {
  manager: string;
  totalShotguns: number;
  seasons: {
    [year: string]: {
      shotguns: number;
      weeks: number[];
      avgScore: number;
    };
  };
}

export const getWeeklyLowScores = (): WeeklyLowScore[] => {
  const lowScores: WeeklyLowScore[] = [];
  const years = ['2023', '2024', '2025'];

  years.forEach(year => {
    try {
      const matchupData = require(`../data/matchups/${year}_${year === '2025' ? 'sleeper' : 'espn'}.json`);
      const regularSeasonLength = matchupData.settings?.regularSeasonLength || 14;

      // Group scores by week
      const weeklyScores: { [week: number]: { manager: string; points: number }[] } = {};

      matchupData.matchups?.forEach((matchup: any) => {
        // Start tracking from 2023 Week 2
        const isEligibleWeek = year === '2023' ? matchup.period >= 2 : true;
        if (!matchup.isPlayoff && matchup.period <= regularSeasonLength && isEligibleWeek) {
          if (!weeklyScores[matchup.period]) {
            weeklyScores[matchup.period] = [];
          }

          if (matchup.home) {
            weeklyScores[matchup.period].push({
              manager: matchup.home.manager,
              points: matchup.home.points
            });
          }

          if (matchup.away) {
            weeklyScores[matchup.period].push({
              manager: matchup.away.manager,
              points: matchup.away.points
            });
          }
        }
      });

      // Find lowest scorer each week
      Object.entries(weeklyScores).forEach(([week, scores]) => {
        if (scores.length > 0) {
          const lowestScorer = scores.reduce((min, current) =>
            current.points < min.points ? current : min
          );

          lowScores.push({
            year,
            week: parseInt(week),
            manager: lowestScorer.manager,
            points: parseFloat(lowestScorer.points.toFixed(2))
          });
        }
      });
    } catch (error) {
      console.warn(`Could not load ${year} matchup data:`, error);
    }
  });

  return lowScores.sort((a, b) => {
    if (a.year !== b.year) return parseInt(b.year) - parseInt(a.year);
    return b.week - a.week;
  });
};

export const getShotgunStats = (): ShotgunStats[] => {
  const weeklyLows = getWeeklyLowScores();
  const currentManagers = getCurrentManagers();
  const statsMap: { [manager: string]: ShotgunStats } = {};

  // Initialize stats for current managers
  currentManagers.forEach(manager => {
    statsMap[manager] = {
      manager,
      totalShotguns: 0,
      seasons: {}
    };
  });

  // Process weekly low scores
  weeklyLows.forEach(low => {
    if (currentManagers.includes(low.manager)) {
      const stats = statsMap[low.manager];
      stats.totalShotguns++;

      if (!stats.seasons[low.year]) {
        stats.seasons[low.year] = {
          shotguns: 0,
          weeks: [],
          avgScore: 0
        };
      }

      stats.seasons[low.year].shotguns++;
      stats.seasons[low.year].weeks.push(low.week);
    }
  });

  // Calculate average scores for shotgun weeks
  Object.values(statsMap).forEach(stats => {
    Object.entries(stats.seasons).forEach(([year, seasonStats]) => {
      const yearLows = weeklyLows.filter(low =>
        low.year === year && low.manager === stats.manager
      );
      if (yearLows.length > 0) {
        seasonStats.avgScore = parseFloat(
          (yearLows.reduce((sum, low) => sum + low.points, 0) / yearLows.length).toFixed(2)
        );
      }
    });
  });

  return Object.values(statsMap)
    .filter(stats => stats.totalShotguns > 0)
    .sort((a, b) => b.totalShotguns - a.totalShotguns);
};

// High Roller tracking - weekly high scores (2024 onwards, regular season only)
export interface WeeklyHighScore {
  year: string;
  week: number;
  manager: string;
  points: number;
}

export interface HighRollerStats {
  manager: string;
  totalWins: number;
  totalEarnings: number; // Assuming each win is worth some amount
  seasons: {
    [year: string]: {
      wins: number;
      weeks: number[];
      avgScore: number;
      earnings: number;
    };
  };
}

export const getWeeklyHighScores = (): WeeklyHighScore[] => {
  const highScores: WeeklyHighScore[] = [];
  const years = ['2024', '2025'];

  years.forEach(year => {
    try {
      const matchupData = require(`../data/matchups/${year}_${year === '2025' ? 'sleeper' : 'espn'}.json`);
      const regularSeasonLength = matchupData.settings?.regularSeasonLength || 14;

      // Group scores by week
      const weeklyScores: { [week: number]: { manager: string; points: number }[] } = {};

      matchupData.matchups?.forEach((matchup: any) => {
        if (!matchup.isPlayoff && matchup.period <= regularSeasonLength) {
          if (!weeklyScores[matchup.period]) {
            weeklyScores[matchup.period] = [];
          }

          if (matchup.home) {
            weeklyScores[matchup.period].push({
              manager: matchup.home.manager,
              points: matchup.home.points
            });
          }

          if (matchup.away) {
            weeklyScores[matchup.period].push({
              manager: matchup.away.manager,
              points: matchup.away.points
            });
          }
        }
      });

      // Find highest scorer each week
      Object.entries(weeklyScores).forEach(([week, scores]) => {
        if (scores.length > 0) {
          const highestScorer = scores.reduce((max, current) =>
            current.points > max.points ? current : max
          );

          highScores.push({
            year,
            week: parseInt(week),
            manager: highestScorer.manager,
            points: parseFloat(highestScorer.points.toFixed(2))
          });
        }
      });
    } catch (error) {
      console.warn(`Could not load ${year} matchup data:`, error);
    }
  });

  return highScores.sort((a, b) => {
    if (a.year !== b.year) return parseInt(b.year) - parseInt(a.year);
    return b.week - a.week;
  });
};

export const getHighRollerStats = (): HighRollerStats[] => {
  const weeklyHighs = getWeeklyHighScores();
  const currentManagers = getCurrentManagers();
  const statsMap: { [manager: string]: HighRollerStats } = {};
  const earningsPerWin = 15; // $15 per weekly high score

  // Initialize stats for current managers
  currentManagers.forEach(manager => {
    statsMap[manager] = {
      manager,
      totalWins: 0,
      totalEarnings: 0,
      seasons: {}
    };
  });

  // Process weekly high scores
  weeklyHighs.forEach(high => {
    if (currentManagers.includes(high.manager)) {
      const stats = statsMap[high.manager];
      stats.totalWins++;
      stats.totalEarnings += earningsPerWin;

      if (!stats.seasons[high.year]) {
        stats.seasons[high.year] = {
          wins: 0,
          weeks: [],
          avgScore: 0,
          earnings: 0
        };
      }

      stats.seasons[high.year].wins++;
      stats.seasons[high.year].weeks.push(high.week);
      stats.seasons[high.year].earnings += earningsPerWin;
    }
  });

  // Calculate average scores for high-scoring weeks
  Object.values(statsMap).forEach(stats => {
    Object.entries(stats.seasons).forEach(([year, seasonStats]) => {
      const yearHighs = weeklyHighs.filter(high =>
        high.year === year && high.manager === stats.manager
      );
      if (yearHighs.length > 0) {
        seasonStats.avgScore = parseFloat(
          (yearHighs.reduce((sum, high) => sum + high.points, 0) / yearHighs.length).toFixed(2)
        );
      }
    });
  });

  return Object.values(statsMap)
    .filter(stats => stats.totalWins > 0)
    .sort((a, b) => b.totalWins - a.totalWins);
};
