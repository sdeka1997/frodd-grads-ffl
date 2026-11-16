// Which seasons exist, on which platform, and whether each is finished.
// Source of truth: src/data/seasons.json (also used by the data scripts).
// Adding next season there is all the site needs; nothing else lists years by hand.

import registry from '../data/seasons.json';

export type Platform = 'espn' | 'sleeper';
export type SeasonStatus = 'final' | 'in_progress';

export interface SeasonInfo {
  year: string;
  platform: Platform;
  status: SeasonStatus;
}

export interface MatchupSide {
  teamId?: number;
  manager: string;
  points: number;
}

export interface Matchup {
  period: number;
  isPlayoff: boolean;
  label?: string;
  winner?: string;
  home: MatchupSide;
  away: MatchupSide | null;
}

export interface MatchupFile {
  settings: {
    regularSeasonLength: number;
    postSeasonLength: number;
    totalPeriods: number;
    playoffTeamCount: number;
    status?: SeasonStatus;
    lastScoredWeek?: number;
  };
  matchups: Matchup[];
}

/** Oldest first */
export const SEASONS: SeasonInfo[] = registry.seasons
  .map(s => ({ year: String(s.year), platform: s.platform as Platform, status: s.status as SeasonStatus }))
  .sort((a, b) => Number(a.year) - Number(b.year));

/** All season years, oldest first */
export const ALL_YEARS = SEASONS.map(s => s.year);

/** Finished seasons only, oldest first */
export const FINAL_YEARS = SEASONS.filter(s => s.status === 'final').map(s => s.year);

/** The newest season (finished or not) */
export const LATEST_YEAR = ALL_YEARS[ALL_YEARS.length - 1];

/** Seasons from `start` onward, oldest first */
export const yearsFrom = (start: number) => ALL_YEARS.filter(y => Number(y) >= start);

export const getSeasonInfo = (year: string) => SEASONS.find(s => s.year === year);
export const isInProgress = (year: string) => getSeasonInfo(year)?.status === 'in_progress';

/** A season's parsed matchups file (src/data/matchups/<year>_<platform>.json) */
export function loadMatchups(year: string): MatchupFile {
  const info = getSeasonInfo(year);
  if (!info) throw new Error(`Unknown season ${year}`);
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(`../data/matchups/${year}_${info.platform}.json`);
}

/** For an in-progress season, the last week with final scores (undefined once finished) */
export function lastScoredWeek(year: string): number | undefined {
  if (!isInProgress(year)) return undefined;
  return loadMatchups(year).settings.lastScoredWeek;
}

/** e.g. "In progress · through Week 9" */
export function inProgressLabel(year: string): string {
  const week = lastScoredWeek(year);
  return week ? `In progress · through Week ${week}` : 'In progress';
}
