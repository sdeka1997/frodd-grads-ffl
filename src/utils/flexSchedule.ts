/**
 * Flex schedule (weeks 12–14) generator.
 *
 * Same rules as the league's earlier Z3 scripts (scripts/flex/2024_flexmatchups_sat.py),
 * and the same algorithm as scripts/flex/2026_flex_schedule.py. After the 11-week round robin,
 * the 12 teams are split into three tiers of four by standings. Over the three
 * flex weeks every team must play:
 *   - exactly one game per week,
 *   - exactly one opponent from each of the other two tiers,
 *   - and therefore exactly one opponent from its own tier.
 *
 * The Z3 scripts hand these constraints to a solver, which always returns the same
 * schedule for the same input (randomness came only from shuffling the tier lists,
 * and that shuffle was accidentally dropped in 2025). There are exactly
 * 10,492,416 schedules that satisfy the rules, so instead we count them all and
 * number them 0..N-1. A seed picks a number uniformly at random and we rebuild
 * that exact schedule — every valid schedule is equally likely, and anyone can
 * re-run a seed to verify the draw.
 */

export const FLEX_WEEKS = [12, 13, 14] as const;
export const TIER_SIZE = 4;
export const TIER_COUNT = 3;
const N_TEAMS = TIER_SIZE * TIER_COUNT;
const FULL = (1 << N_TEAMS) - 1;

/** Teams are indices 0..11 in standings order; tier = floor(index / 4) */
export type Matchup = [number, number];
export type Week = Matchup[];
export type Schedule = Week[];

export const tierOf = (team: number) => Math.floor(team / TIER_SIZE);

// ── Search state ────────────────────────────────────────────────────────────
// `needs` packs, for each team, a 3-bit mask of tiers it still has to face.
// 12 teams × 3 bits = 36 bits, which fits safely in a JS number.
const ALL_NEEDS = 2 ** (3 * N_TEAMS) - 1;
const getNeed = (needs: number, team: number) => Math.floor(needs / 2 ** (3 * team)) % 8;
const setNeed = (needs: number, team: number, v: number) =>
  needs + (v - getNeed(needs, team)) * 2 ** (3 * team);

/** Every legal pairing for the lowest unmatched team, with the resulting state */
function* branches(used: number, needs: number) {
  let a = 0;
  while (used & (1 << a)) a++;
  const ta = tierOf(a);
  const na = getNeed(needs, a);
  for (let b = a + 1; b < N_TEAMS; b++) {
    if (used & (1 << b)) continue;
    const tb = tierOf(b);
    const nb = getNeed(needs, b);
    if (!(na & (1 << tb)) || !(nb & (1 << ta))) continue;
    yield {
      pair: [a, b] as Matchup,
      used: used | (1 << a) | (1 << b),
      needs: setNeed(setNeed(needs, a, na & ~(1 << tb)), b, nb & ~(1 << ta)),
    };
  }
}

const memo = new Map<number, number>();
const memoKey = (w: number, used: number, needs: number) => (w * (FULL + 1) + used) * (ALL_NEEDS + 1) + needs;

/** Number of ways to finish the schedule from this state */
function countFrom(w: number, used: number, needs: number): number {
  if (used === FULL) return w === FLEX_WEEKS.length - 1 ? 1 : countFrom(w + 1, 0, needs);
  const key = memoKey(w, used, needs);
  const hit = memo.get(key);
  if (hit !== undefined) return hit;
  let total = 0;
  for (const br of branches(used, needs)) total += countFrom(w, br.used, br.needs);
  memo.set(key, total);
  return total;
}

/** Total number of valid flex schedules (10,492,416 for 3 tiers of 4) */
export const totalSchedules = () => countFrom(0, 0, ALL_NEEDS);

/** Rebuild schedule number `k` (0-based) in the canonical ordering */
export function scheduleAt(k: number): Schedule {
  const weeks: Schedule = FLEX_WEEKS.map(() => []);
  let w = 0, used = 0, needs = ALL_NEEDS;
  while (true) {
    if (used === FULL) {
      if (w === FLEX_WEEKS.length - 1) return weeks;
      w++; used = 0;
      continue;
    }
    let chosen = false;
    for (const br of branches(used, needs)) {
      const c = countFrom(w, br.used, br.needs);
      if (k < c) {
        weeks[w].push(br.pair);
        used = br.used; needs = br.needs;
        chosen = true;
        break;
      }
      k -= c;
    }
    if (!chosen) throw new Error('schedule index out of range');
  }
}

// ── Randomness ──────────────────────────────────────────────────────────────

/** mulberry32 — tiny deterministic PRNG so a seed always reproduces the same draw */
export function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const randomSeed = () => Math.floor(Math.random() * 1_000_000);

/** Seed → schedule number → schedule. Same seed always gives the same schedule. */
export function drawSchedule(seed: number) {
  const total = totalSchedules();
  const index = Math.floor(mulberry32(seed)() * total);
  return { seed, index, total, schedule: scheduleAt(index) };
}

// ── Helpers for display / verification ──────────────────────────────────────

export type MatchupKind = 'in-tier' | '1v2' | '1v3' | '2v3';

export function matchupKind([a, b]: Matchup): MatchupKind {
  const ta = tierOf(a), tb = tierOf(b);
  if (ta === tb) return 'in-tier';
  return `${Math.min(ta, tb) + 1}v${Math.max(ta, tb) + 1}` as MatchupKind;
}

/** Independent check that a schedule obeys every rule */
export function isValidSchedule(schedule: Schedule): boolean {
  if (schedule.length !== FLEX_WEEKS.length) return false;
  const faced = new Array<number>(N_TEAMS).fill(0);
  for (const week of schedule) {
    const seen = new Set<number>();
    for (const [a, b] of week) {
      if (a === b || seen.has(a) || seen.has(b)) return false;
      seen.add(a); seen.add(b);
      const ta = tierOf(a), tb = tierOf(b);
      if (faced[a] & (1 << tb) || faced[b] & (1 << ta)) return false;
      faced[a] |= 1 << tb;
      faced[b] |= 1 << ta;
    }
    if (seen.size !== N_TEAMS) return false;
  }
  return faced.every(f => f === 0b111);
}
