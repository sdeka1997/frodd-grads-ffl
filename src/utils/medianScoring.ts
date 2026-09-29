// What-if: median scoring.
// Every regular-season week, the top half of scores earn an extra win and the bottom half an
// extra loss. Each season is then replayed under that year's real rules — seeding, playoffs
// and Sacko — using the real weekly scores (no simulation of points: every team has a score
// every week, whether or not they played a meaningful game).
// Reads the source data only; nothing here writes back to it.

import fflData from '../data/ffl_data.json';
import m2019 from '../data/matchups/2019_espn.json';
import m2020 from '../data/matchups/2020_espn.json';
import m2021 from '../data/matchups/2021_espn.json';
import m2022 from '../data/matchups/2022_espn.json';
import m2023 from '../data/matchups/2023_espn.json';
import m2024 from '../data/matchups/2024_espn.json';
import m2025 from '../data/matchups/2025_sleeper.json';

interface MatchupSide {
  manager: string;
  points: number;
}

interface MatchupFile {
  settings: { regularSeasonLength: number; playoffTeamCount: number };
  matchups: { period: number; isPlayoff: boolean; home?: MatchupSide | null; away?: MatchupSide | null }[];
}

const MATCHUPS: Record<string, MatchupFile> = {
  '2019': m2019 as MatchupFile,
  '2020': m2020 as MatchupFile,
  '2021': m2021 as MatchupFile,
  '2022': m2022 as MatchupFile,
  '2023': m2023 as MatchupFile,
  '2024': m2024 as MatchupFile,
  '2025': m2025 as MatchupFile,
};

export const MEDIAN_YEARS = Object.keys(MATCHUPS).sort((a, b) => parseInt(b) - parseInt(a));

/* ---------------- Types ---------------- */

export interface StandingRow {
  manager: string;
  seed: number;
  wins: number;
  losses: number;
  h2hWins: number;
  h2hLosses: number;
  medianWins: number;
  medianLosses: number;
  pf: number;
}

export interface GameSide {
  manager: string;
  seed: number;
  points: number;
}

export type BracketName = 'play-in' | 'playoff' | 'placement' | 'sacko';

export interface PlayedGame {
  bracket: BracketName;
  week: number;
  round: string;
  a: GameSide;
  b: GameSide;
  winner: string;
}

export interface Bye {
  bracket: BracketName;
  week: number;
  manager: string;
  seed: number;
}

/** One row of a round-robin Sacko table (2020–2022) */
export interface SackoRow {
  manager: string;
  seed: number;
  /** Regular-season record, median results included */
  regWins: number;
  regLosses: number;
  /** Round-robin record, head-to-head only */
  rrWins: number;
  rrLosses: number;
  wins: number;
  losses: number;
  /** Points across the regular season and the round robin — the tiebreaker */
  pf: number;
}

export interface SeasonResult {
  standings: StandingRow[];
  /** Final finishing order, 1st to last */
  finish: string[];
  champion: string;
  sacko: string;
  /** Games the season's format played: the postseason, plus any seed-based regular-season weeks */
  games: PlayedGame[];
  byes: Bye[];
  /** Round-robin Sacko table, worst last; null for bracket and ladder years */
  sackoTable: SackoRow[] | null;
  warnings: string[];
}

/* ---------------- Season simulator ---------------- */

interface Pairing {
  week: number;
  a: string;
  b: string;
}

// week -> manager -> points, for every period in the file (regular season and postseason)
function weeklyScores(file: MatchupFile): Map<number, Map<string, number>> {
  const weeks = new Map<number, Map<string, number>>();
  for (const m of file.matchups) {
    if (!weeks.has(m.period)) weeks.set(m.period, new Map());
    for (const side of [m.home, m.away]) {
      if (side) weeks.get(m.period)!.set(side.manager, side.points);
    }
  }
  return weeks;
}

export class SeasonSim {
  readonly regularSeasonLength: number;
  readonly games: PlayedGame[] = [];
  readonly byes: Bye[] = [];
  readonly warnings: string[] = [];
  sackoTable: SackoRow[] | null = null;
  private readonly scores: Map<number, Map<string, number>>;
  private schedule: Pairing[];
  private seeds: string[];

  constructor(file: MatchupFile, readonly median: boolean) {
    this.regularSeasonLength = file.settings.regularSeasonLength;
    this.scores = weeklyScores(file);
    this.schedule = file.matchups
      .filter(m => m.period <= this.regularSeasonLength && m.home && m.away)
      .map(m => ({ week: m.period, a: m.home!.manager, b: m.away!.manager }));
    this.seeds = this.standings().map(r => r.manager);
  }

  score(manager: string, week: number): number {
    const pts = this.scores.get(week)?.get(manager);
    if (pts === undefined) {
      this.warnings.push(`No week ${week} score on record for ${manager} — counted as 0.`);
      return 0;
    }
    return pts;
  }

  /** Standings through `throughWeek`, ranked by wins then total points for (matches ESPN's real seeding). */
  standings(throughWeek = this.regularSeasonLength): StandingRow[] {
    const rows = new Map<string, Omit<StandingRow, 'seed'>>();
    for (const manager of this.scores.get(1)!.keys()) {
      rows.set(manager, { manager, wins: 0, losses: 0, h2hWins: 0, h2hLosses: 0, medianWins: 0, medianLosses: 0, pf: 0 });
    }

    for (const { week, a, b } of this.schedule) {
      if (week > throughWeek) continue;
      const pa = this.score(a, week);
      const pb = this.score(b, week);
      if (pa > pb) { rows.get(a)!.h2hWins++; rows.get(b)!.h2hLosses++; }
      else if (pb > pa) { rows.get(b)!.h2hWins++; rows.get(a)!.h2hLosses++; }
    }

    for (let week = 1; week <= throughWeek; week++) {
      const ranked = [...this.scores.get(week)!.entries()].sort((x, y) => y[1] - x[1]);
      ranked.forEach(([manager, pts], i) => {
        const r = rows.get(manager)!;
        r.pf += pts;
        if (!this.median) return;
        if (i < ranked.length / 2) r.medianWins++;
        else r.medianLosses++;
      });
    }

    return [...rows.values()]
      .map(r => ({
        ...r,
        pf: Math.round(r.pf * 100) / 100,
        wins: r.h2hWins + r.medianWins,
        losses: r.h2hLosses + r.medianLosses,
      }))
      .sort((x, y) => y.wins - x.wins || y.pf - x.pf)
      .map((r, i) => ({ ...r, seed: i + 1 }));
  }

  /** Final standings in seed order — seeds can differ from pure record order (e.g. 2019's play-in). */
  seededStandings(): StandingRow[] {
    const byManager = new Map(this.standings().map(r => [r.manager, r]));
    return this.seeds.map((m, i) => ({ ...byManager.get(m)!, seed: i + 1 }));
  }

  setSeeds(order: string[]) {
    this.seeds = [...order];
  }

  /** 1-based: seed(1) is the 1 seed */
  seed(n: number): string {
    return this.seeds[n - 1];
  }

  seedOf(manager: string): number {
    return this.seeds.indexOf(manager) + 1;
  }

  /** Drops the real regular-season games in these weeks, for seasons that paired them by seed. */
  clearWeeks(weeks: number[]) {
    this.schedule = this.schedule.filter(p => !weeks.includes(p.week));
  }

  /** Seed-based regular-season game (e.g. 2019's play-in); counts toward the record. Returns [winner, loser]. */
  playIn(week: number, round: string, a: string, b: string): [string, string] {
    return this.play('play-in', week, round, a, b);
  }

  playoff(week: number, round: string, a: string, b: string): [string, string] {
    return this.play('playoff', week, round, a, b);
  }

  /** 3rd/5th/7th/9th-place games: they decide the finishing order but aren't drawn in a bracket */
  placement(week: number, round: string, a: string, b: string): [string, string] {
    return this.play('placement', week, round, a, b);
  }

  sacko(week: number, round: string, a: string, b: string): [string, string] {
    return this.play('sacko', week, round, a, b);
  }

  bye(bracket: BracketName, week: number, manager: string) {
    this.byes.push({ bracket, week, manager, seed: this.seedOf(manager) });
  }

  /** Plays a game with that week's real scores; the higher seed wins an exact tie. Returns [winner, loser]. */
  private play(bracket: BracketName, week: number, round: string, a: string, b: string): [string, string] {
    const pa = this.score(a, week);
    const pb = this.score(b, week);
    const aWins = pa > pb || (pa === pb && this.seedOf(a) < this.seedOf(b));
    if (pa === pb) this.warnings.push(`Week ${week} ${round}: ${a} and ${b} tied — higher seed advanced.`);
    if (week <= this.regularSeasonLength) this.schedule.push({ week, a, b });
    this.games.push({
      bracket,
      week,
      round,
      a: { manager: a, seed: this.seedOf(a), points: pa },
      b: { manager: b, seed: this.seedOf(b), points: pb },
      winner: aWins ? a : b,
    });
    return aWins ? [a, b] : [b, a];
  }
}

/* ---------------- Per-year formats ----------------
 * Each season's real rules. A format sets the final seeds and
 * plays out the playoffs, placement games and Sacko, returning the full finishing order.
 */

interface SeasonFormat {
  note: string;
  /** Returns the final finishing order, 1st to last */
  run: (s: SeasonSim) => string[];
}

// Shared by the years that used them — each year still picks its own weeks.

type Pair = [number, number];

/**
 * 8-team fixed bracket, no reseeding. Quarterfinals are listed so that games 1 & 2 meet in one
 * semifinal and games 3 & 4 in the other — by default 1v8, 4v5 | 3v6, 2v7. Returns places 1–8.
 * Quarterfinal losers play for 5th–8th: 'same-half' pairs the losers of games 1 & 2 (2020–22, 2025),
 * 'cross-half' pairs games 1 & 4 (2023–24).
 */
function eightTeamBracket(
  s: SeasonSim,
  [qfWeek, sfWeek, finalWeek]: [number, number, number],
  consolation: 'same-half' | 'cross-half' = 'same-half',
  quarterfinals: [Pair, Pair, Pair, Pair] = [[1, 8], [4, 5], [3, 6], [2, 7]],
): string[] {
  const qf = quarterfinals.map(([a, b]) => s.playoff(qfWeek, 'Quarterfinal', s.seed(a), s.seed(b)));
  const [sfA, sfLA] = s.playoff(sfWeek, 'Semifinal', qf[0][0], qf[1][0]);
  const [sfB, sfLB] = s.playoff(sfWeek, 'Semifinal', qf[2][0], qf[3][0]);
  const [first, second] = s.playoff(finalWeek, 'Championship', sfA, sfB);
  const [third, fourth] = s.placement(finalWeek, '3rd place', sfLA, sfLB);

  // Quarterfinal losers: winners play for 5th, losers for 7th
  const losers = qf.map(([, loser]) => loser);
  const [pairA, pairB]: [string, string][] = consolation === 'same-half'
    ? [[losers[0], losers[1]], [losers[2], losers[3]]]
    : [[losers[0], losers[3]], [losers[2], losers[1]]];
  const [c1, cL1] = s.placement(sfWeek, '5th place semifinal', ...pairA);
  const [c2, cL2] = s.placement(sfWeek, '5th place semifinal', ...pairB);
  const [fifth, sixth] = s.placement(finalWeek, '5th place', c1, c2);
  const [seventh, eighth] = s.placement(finalWeek, '7th place', cL1, cL2);

  return [first, second, third, fourth, fifth, sixth, seventh, eighth];
}

type RoundRobinWeek = [[number, number], [number, number]];

/** Round-robin order for 2020–2021; 2022 played the last two weeks swapped. */
const ROUND_ROBIN_ORDER: RoundRobinWeek[] = [[[9, 10], [11, 12]], [[9, 11], [10, 12]], [[9, 12], [10, 11]]];

/**
 * Round-robin Sacko among seeds 9–12, one pairing set per week. Head-to-head only — median scoring
 * is a regular-season rule. Worst combined record gets the Sacko; ties go to fewer total points. Returns places 9–12.
 */
function roundRobinSacko(s: SeasonSim, weeks: [number, number, number], pairings = ROUND_ROBIN_ORDER): string[] {
  const four = [9, 10, 11, 12].map(n => s.seed(n));
  const reg = new Map(s.standings().map(r => [r.manager, r]));
  const rows = new Map<string, SackoRow>(four.map(m => {
    const r = reg.get(m)!;
    return [m, { manager: m, seed: s.seedOf(m), regWins: r.wins, regLosses: r.losses, rrWins: 0, rrLosses: 0, wins: 0, losses: 0, pf: r.pf }];
  }));

  weeks.forEach((week, i) => {
    for (const [a, b] of pairings[i]) {
      const [winner, loser] = s.sacko(week, 'Round robin', s.seed(a), s.seed(b));
      rows.get(winner)!.rrWins++;
      rows.get(loser)!.rrLosses++;
    }
    for (const m of four) rows.get(m)!.pf += s.score(m, week);
  });

  const table = [...rows.values()]
    .map(r => ({ ...r, pf: Math.round(r.pf * 100) / 100, wins: r.regWins + r.rrWins, losses: r.regLosses + r.rrLosses }))
    .sort((x, y) => y.wins - x.wins || y.pf - x.pf);
  s.sackoTable = table;
  return table.map(r => r.manager);
}

// 2025's top 2 seeds picked their quarterfinal opponents from seeds 5–8. The replay keeps the real
// picks — the 1 seed takes Arun, the 2 seed takes Smeet — then the 3 plays the lowest remaining seed.
function picks2025(s: SeasonSim): [Pair, Pair, Pair, Pair] {
  const pool = [5, 6, 7, 8];
  const [pick1, pick2] = [s.seedOf('Arun'), s.seedOf('Smeet')];
  if (!pool.includes(pick1) || !pool.includes(pick2)) {
    s.warnings.push('Arun or Smeet is outside seeds 5–8, so the 2025 picks fall back to a standard bracket.');
    return [[1, 8], [4, 5], [3, 6], [2, 7]];
  }
  const [higher, lower] = pool.filter(n => n !== pick1 && n !== pick2);
  return [[1, pick1], [4, higher], [3, lower], [2, pick2]];
}

const FORMATS: Record<string, SeasonFormat> = {
  '2019': {
    note:
      'Top 4 after Week 11 were locked into the playoffs and played each other in Weeks 12–13. Seeds 5–12 played a two-week play-in (5v12, 6v11, 7v10, 8v9, then winners meet) for the last two spots. ' +
      '6-team playoff with byes for seeds 1–2; the 1 seed meets the 4/5 winner. Sacko: bottom 4, losers-advance bracket.',
    run: s => {
      // Weeks 12–13 were scheduled from the standings after Week 11
      s.setSeeds(s.standings(11).map(r => r.manager));
      s.clearWeeks([12, 13]);

      s.playIn(12, 'Top 4', s.seed(1), s.seed(4));
      s.playIn(12, 'Top 4', s.seed(2), s.seed(3));
      const [w5, l5] = s.playIn(12, 'Play-in', s.seed(5), s.seed(12));
      const [w8, l8] = s.playIn(12, 'Play-in', s.seed(8), s.seed(9));
      const [w6, l6] = s.playIn(12, 'Play-in', s.seed(6), s.seed(11));
      const [w7, l7] = s.playIn(12, 'Play-in', s.seed(7), s.seed(10));

      s.playIn(13, 'Top 4', s.seed(1), s.seed(3));
      s.playIn(13, 'Top 4', s.seed(2), s.seed(4));
      const [inA] = s.playIn(13, 'Play-in final', w5, w8);
      s.playIn(13, 'Play-in consolation', l5, l8);
      const [inB] = s.playIn(13, 'Play-in final', w6, w7);
      s.playIn(13, 'Play-in consolation', l6, l7);

      // Final seeds: locked top 4, then the two play-in winners, then everyone else — each group by record, then PF
      const locked = [s.seed(1), s.seed(2), s.seed(3), s.seed(4)];
      const full = s.standings().map(r => r.manager);
      const top4 = full.filter(m => locked.includes(m));
      const playIn = full.filter(m => m === inA || m === inB);
      s.setSeeds([...top4, ...playIn, ...full.filter(m => !top4.includes(m) && !playIn.includes(m))]);

      s.bye('playoff', 14, s.seed(1));
      s.bye('playoff', 14, s.seed(2));
      const [qf45] = s.playoff(14, 'Quarterfinal', s.seed(4), s.seed(5));
      const [qf36] = s.playoff(14, 'Quarterfinal', s.seed(3), s.seed(6));
      const [sf1, sfL1] = s.playoff(15, 'Semifinal', s.seed(1), qf45);
      const [sf2, sfL2] = s.playoff(15, 'Semifinal', s.seed(2), qf36);
      const [first, second] = s.playoff(16, 'Championship', sf1, sf2);
      const [third, fourth] = s.placement(16, '3rd place', sfL1, sfL2);
      const qfLosers = [s.seed(3), s.seed(4), s.seed(5), s.seed(6)].filter(m => m !== qf45 && m !== qf36);
      const [fifth, sixth] = s.placement(16, '5th place', qfLosers[0], qfLosers[1]);

      const [sackoWin9, sackoA] = s.sacko(14, 'Sacko semifinal', s.seed(9), s.seed(12));
      const [sackoWin10, sackoB] = s.sacko(14, 'Sacko semifinal', s.seed(10), s.seed(11));
      const [eleventh, twelfth] = s.sacko(15, 'Sacko final', sackoA, sackoB);

      // Consolation: seeds 7–8 meet the Sacko semifinal winners; winners play for 7th, losers for 9th
      const [c7, c7L] = s.placement(15, 'Consolation semifinal', s.seed(7), sackoWin10);
      const [c8, c8L] = s.placement(15, 'Consolation semifinal', s.seed(8), sackoWin9);
      const [seventh, eighth] = s.placement(16, '7th place', c7, c8);
      const [ninth, tenth] = s.placement(16, '9th place', c7L, c8L);

      return [first, second, third, fourth, fifth, sixth, seventh, eighth, ninth, tenth, eleventh, twelfth];
    },
  },

  '2020': {
    note:
      'Weeks 1–11 were a full round robin; Weeks 12–13 were paired from the standings after Week 11 (1v12 … 6v7, then 1v2 … 11v12). ' +
      '8-team fixed bracket (1v8, 4v5, 3v6, 2v7). Sacko: round robin among the bottom 4 — worst combined record, ties to fewer total points.',
    run: s => {
      s.setSeeds(s.standings(11).map(r => r.manager));
      s.clearWeeks([12, 13]);
      for (let n = 1; n <= 6; n++) s.playIn(12, 'Seeded fold', s.seed(n), s.seed(13 - n));
      for (let n = 1; n <= 11; n += 2) s.playIn(13, 'Seeded neighbors', s.seed(n), s.seed(n + 1));

      s.setSeeds(s.standings().map(r => r.manager));
      return [...eightTeamBracket(s, [14, 15, 16]), ...roundRobinSacko(s, [14, 15, 16])];
    },
  },

  '2021': {
    note:
      'Fixed 14-week schedule (every opponent once, plus 3 pre-set rematches). ' +
      '8-team fixed bracket (1v8, 4v5, 3v6, 2v7). Sacko: round robin among the bottom 4 — worst 17-game record, ties to fewer total points.',
    run: s => [...eightTeamBracket(s, [15, 16, 17]), ...roundRobinSacko(s, [15, 16, 17])],
  },

  '2022': {
    note:
      'Fixed 14-week schedule (every opponent once, plus 3 pre-set rematches). ' +
      '8-team fixed bracket (1v8, 4v5, 3v6, 2v7). Sacko: round robin among the bottom 4 — worst 17-game record, ties to fewer total points.',
    // 9v12/10v11 in Week 16 and 9v11/10v12 in Week 17 — the reverse of 2020–2021
    run: s => [
      ...eightTeamBracket(s, [15, 16, 17]),
      ...roundRobinSacko(s, [15, 16, 17], [[[9, 10], [11, 12]], [[9, 12], [10, 11]], [[9, 11], [10, 12]]]),
    ],
  },

  '2023': {
    note:
      'Fixed 14-week schedule (every opponent once, plus 3 random rematches). ' +
      '8-team fixed bracket (1v8, 4v5, 3v6, 2v7). Sacko: bottom 4 sit out Week 15, then a losers-advance bracket — 9v12 and 10v11 in Week 16, losers meet in Week 17.',
    run: s => {
      for (const n of [9, 10, 11, 12]) s.bye('sacko', 15, s.seed(n));
      const [w9, l9] = s.sacko(16, 'Sacko semifinal', s.seed(9), s.seed(12));
      const [w10, l10] = s.sacko(16, 'Sacko semifinal', s.seed(10), s.seed(11));
      const [ninth, tenth] = s.placement(17, '9th place', w9, w10);
      const [eleventh, twelfth] = s.sacko(17, 'Sacko Bowl', l9, l10);
      return [...eightTeamBracket(s, [15, 16, 17], 'cross-half'), ninth, tenth, eleventh, twelfth];
    },
  },

  '2024': {
    note:
      'Fixed 14-week schedule (every opponent once, plus 3 flex-selected rematches). ' +
      '8-team fixed bracket (1v8, 4v5, 3v6, 2v7). Sacko ladder: 9v10 (winner safe) and 11v12 (loser to the Bowl), then the 9/10 loser plays the 11/12 winner (loser to the Bowl), then the Sacko Bowl.',
    run: s => {
      const [ninth, rung2] = s.sacko(15, 'Ladder · winner safe', s.seed(9), s.seed(10));
      const [climber, bowlA] = s.sacko(15, 'Ladder · loser to Bowl', s.seed(11), s.seed(12));
      const [tenth, bowlB] = s.sacko(16, 'Ladder · loser to Bowl', rung2, climber);
      const [eleventh, twelfth] = s.sacko(17, 'Sacko Bowl', bowlA, bowlB);
      return [...eightTeamBracket(s, [15, 16, 17], 'cross-half'), ninth, tenth, eleventh, twelfth];
    },
  },

  '2025': {
    note:
      'Fixed 14-week schedule (every opponent once, plus 3 flex-selected rematches). ' +
      '8-team bracket where the top 2 seeds choose their quarterfinal opponent; this replay keeps the real picks (the 1 seed takes Arun, the 2 seed takes Smeet), then the 3 plays the lowest remaining seed.' +
      'Sacko: 9v12 and 10v11 in Week 15, losers meet in the Week 16 Sacko Bowl.',
    run: s => {
      const [w9, l9] = s.sacko(15, 'Sacko semifinal', s.seed(9), s.seed(12));
      const [w10, l10] = s.sacko(15, 'Sacko semifinal', s.seed(10), s.seed(11));
      const [ninth, tenth] = s.placement(16, '9th place', w9, w10);
      const [eleventh, twelfth] = s.sacko(16, 'Sacko Bowl', l9, l10);
      return [...eightTeamBracket(s, [15, 16, 17], 'same-half', picks2025(s)), ninth, tenth, eleventh, twelfth];
    },
  },
};

/* ---------------- Season summary ---------------- */

export interface SeasonWhatIf {
  year: string;
  playoffTeamCount: number;
  formatNote: string;
  /** Real seeds, from replaying the year's rules without median results */
  real: StandingRow[];
  realChampion: string;
  realSacko: string;
  /** manager -> real finishing place (1 = champion) */
  realFinish: Record<string, number>;
  medianResult: SeasonResult;
}

export function runSeason(year: string, median: boolean): SeasonResult {
  const sim = new SeasonSim(MATCHUPS[year], median);
  const finish = FORMATS[year].run(sim);
  return {
    standings: sim.seededStandings(),
    finish,
    champion: finish[0],
    sacko: finish[finish.length - 1],
    games: sim.games,
    byes: sim.byes,
    sackoTable: sim.sackoTable,
    warnings: sim.warnings,
  };
}

export function getMedianWhatIf(year: string): SeasonWhatIf {
  const season = (fflData as { seasons: Record<string, { owner: string; playoff_finish: string }[]> }).seasons[year];

  return {
    year,
    playoffTeamCount: MATCHUPS[year].settings.playoffTeamCount,
    formatNote: FORMATS[year].note,
    real: runSeason(year, false).standings,
    realFinish: Object.fromEntries(season.map(t => [t.owner, parseInt(t.playoff_finish)])),
    realChampion: season.find(t => t.playoff_finish === '1st')?.owner ?? '',
    realSacko: season.find(t => t.playoff_finish === `${season.length}th`)?.owner ?? '',
    medianResult: runSeason(year, true),
  };
}

export function getAllMedianWhatIfs(): SeasonWhatIf[] {
  return MEDIAN_YEARS.map(getMedianWhatIf);
}
