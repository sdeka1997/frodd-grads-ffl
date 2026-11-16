/**
 * Live round-robin standings from the Sleeper API (client-side; Sleeper's
 * public API allows CORS and needs no key).
 *
 * Standings are rebuilt from weekly matchups rather than read off the roster
 * totals, so they only ever count the round-robin weeks — running this during
 * weeks 12–14 still gives the week-11 tiers.
 */

const API = 'https://api.sleeper.app/v1';

// The page always uses the newest season listed here; add next year's league ID when it starts.
export const SLEEPER_LEAGUE_IDS: Record<string, string> = {
  '2026': '1387600957575028736',
};

export const ROUND_ROBIN_WEEKS = 11;

/** Sleeper user id → the name the site uses everywhere else */
const MANAGER_NAMES: Record<string, string> = {
  '649449296185393152': 'Swapnav',
  '993281156730753024': 'Nikhil',
  '727988023450505216': 'Asad',
  '1253774743752937472': 'Arun',
  '994333195090866176': 'Ameesh',
  '994330569154539520': 'Ro B',
  '994051773549633536': 'Smeet',
  '1154199635821522944': 'Ro K',
  '994326168872550400': 'Manuj',
  '1260468517744943104': 'Palanki',
  '996065541934620672': 'Sai',
  '996604246772576256': 'Shrey',
};

export interface TeamStanding {
  rosterId: number;
  manager: string;
  teamName: string;
  wins: number;
  losses: number;
  ties: number;
  pf: number;
  pa: number;
}

export interface StandingsResult {
  season: string;
  /** Number of completed round-robin weeks counted (11 once the round robin is done) */
  weeksCounted: number;
  teams: TeamStanding[];
}

export type RankBy = 'pf' | 'record';

interface SleeperLeague { season: string; settings: { last_scored_leg?: number; leg?: number } }
interface SleeperUser { user_id: string; display_name: string; metadata?: { team_name?: string } }
interface SleeperRoster { roster_id: number; owner_id: string }
interface SleeperMatchup { roster_id: number; matchup_id: number | null; points: number }

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Sleeper request failed (${res.status}): ${path}`);
  return res.json();
}

export async function fetchRoundRobinStandings(season: string): Promise<StandingsResult> {
  const leagueId = SLEEPER_LEAGUE_IDS[season];
  if (!leagueId) throw new Error(`No Sleeper league configured for ${season}`);

  const [league, users, rosters] = await Promise.all([
    get<SleeperLeague>(`/league/${leagueId}`),
    get<SleeperUser[]>(`/league/${leagueId}/users`),
    get<SleeperRoster[]>(`/league/${leagueId}/rosters`),
  ]);

  // last_scored_leg is the most recent fully scored week; a finished league reports the final week
  const lastScored = league.settings.last_scored_leg ?? Math.max(0, (league.settings.leg ?? 1) - 1);
  const weeksCounted = Math.min(ROUND_ROBIN_WEEKS, lastScored);

  const userById = new Map(users.map(u => [u.user_id, u]));
  const table = new Map<number, TeamStanding>(rosters.map(r => {
    const user = userById.get(r.owner_id);
    return [r.roster_id, {
      rosterId: r.roster_id,
      manager: MANAGER_NAMES[r.owner_id] ?? user?.display_name ?? `Team ${r.roster_id}`,
      teamName: user?.metadata?.team_name || user?.display_name || '',
      wins: 0, losses: 0, ties: 0, pf: 0, pa: 0,
    }];
  }));

  const weeks = await Promise.all(
    Array.from({ length: weeksCounted }, (_, i) => get<SleeperMatchup[]>(`/league/${leagueId}/matchups/${i + 1}`)),
  );

  for (const week of weeks) {
    const byMatchup = new Map<number, SleeperMatchup[]>();
    for (const m of week) {
      if (m.matchup_id == null) continue;
      byMatchup.set(m.matchup_id, [...(byMatchup.get(m.matchup_id) ?? []), m]);
    }
    for (const pair of byMatchup.values()) {
      if (pair.length !== 2) continue;
      const [a, b] = pair;
      const ta = table.get(a.roster_id), tb = table.get(b.roster_id);
      if (!ta || !tb) continue;
      ta.pf += a.points; ta.pa += b.points;
      tb.pf += b.points; tb.pa += a.points;
      if (a.points > b.points) { ta.wins++; tb.losses++; }
      else if (b.points > a.points) { tb.wins++; ta.losses++; }
      else { ta.ties++; tb.ties++; }
    }
  }

  for (const t of table.values()) {
    t.pf = Math.round(t.pf * 100) / 100;
    t.pa = Math.round(t.pa * 100) / 100;
  }

  return { season: league.season, weeksCounted, teams: [...table.values()] };
}

const winPct = (t: TeamStanding) => {
  const games = t.wins + t.losses + t.ties;
  return games ? (t.wins + t.ties / 2) / games : 0;
};

/** Points-for ranks by PF (record breaks ties); record ranks by win% (PF breaks ties) */
export function rankTeams(teams: TeamStanding[], by: RankBy): TeamStanding[] {
  return [...teams].sort((a, b) =>
    by === 'pf'
      ? b.pf - a.pf || winPct(b) - winPct(a) || a.manager.localeCompare(b.manager)
      : winPct(b) - winPct(a) || b.pf - a.pf || a.manager.localeCompare(b.manager),
  );
}
