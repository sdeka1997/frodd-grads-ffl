#!/usr/bin/env python3
"""
Frodd FFL flex schedule (weeks 12-14) generator — 2026 version.

Same algorithm as the website's Flex Schedule page (src/utils/flexSchedule.ts and
src/utils/sleeperStandings.ts). For the same seed and the same standings, this
script and the website produce the identical schedule.

Rules (unchanged from flexmatchups_sat.py):
  * 12 teams split into 3 tiers of 4 by standings after the week-11 round robin
  * each team plays exactly one game in each of weeks 12, 13, 14
  * over those 3 weeks each team plays one opponent from each other tier,
    and therefore exactly one opponent from its own tier

How the draw works:
  1. Count every schedule that satisfies the rules (exactly 10,492,416) and give
     each one a number 0 .. N-1 in a fixed order (see `count_from`/`schedule_at`).
  2. Turn the seed into a number in [0, 1) with mulberry32 (a tiny, standard PRNG
     that is easy to implement identically in Python and JavaScript).
  3. index = floor(that number * N); rebuild schedule #index.
  Every valid schedule is equally likely, and the seed fully determines the result.

Standard library only. Usage:
  python3 scripts/flex/2026_flex_schedule.py --seed 171                    # live 2026 standings from Sleeper
  python3 scripts/flex/2026_flex_schedule.py --seed 171 --rank-by record   # rank by record instead of points for
  python3 scripts/flex/2026_flex_schedule.py --seed 171 --tiers "Asad,Swapnav,Smeet,Palanki,Arun,Ro K,Ameesh,Nikhil,Manuj,Shrey,Ro B,Sai"
                                                         # offline: 12 names in rank order 1..12
  python3 scripts/flex/2026_flex_schedule.py --self-test                   # check every rule on many random draws
  python3 scripts/flex/2026_flex_schedule.py --seed 171 --check-z3         # also confirm the draw with the old Z3 model
"""

import argparse
import json
import math
import sys
import urllib.request
from functools import lru_cache

TIER_SIZE = 4
N_TEAMS = 12
N_WEEKS = 3
FLEX_WEEKS = (12, 13, 14)
FULL = (1 << N_TEAMS) - 1
ROUND_ROBIN_WEEKS = 11

SLEEPER_LEAGUE_IDS = {"2026": "1387600957575028736", "2025": "1253749630043181056"}

# Sleeper user id -> name used on the site
MANAGER_NAMES = {
    "649449296185393152": "Swapnav", "993281156730753024": "Nikhil",
    "727988023450505216": "Asad", "1253774743752937472": "Arun",
    "994333195090866176": "Ameesh", "994330569154539520": "Ro B",
    "994051773549633536": "Smeet", "1154199635821522944": "Ro K",
    "994326168872550400": "Manuj", "1260468517744943104": "Palanki",
    "996065541934620672": "Sai", "996604246772576256": "Shrey",
}


def tier_of(team):
    """Teams are indices 0..11 in rank order; 0-3 Tier 1, 4-7 Tier 2, 8-11 Tier 3."""
    return team // TIER_SIZE


# ── Enumerating schedules ────────────────────────────────────────────────────
# State while building a schedule:
#   w     = week being filled (0, 1, 2)
#   used  = bitmask of teams already given a game this week
#   needs = per team, a 3-bit mask of tiers that team still has to play
#           (starts as 0b111 = own tier + both other tiers)
ALL_NEEDS = (0b111,) * N_TEAMS


def branches(used, needs):
    """Legal opponents for the lowest-numbered team without a game this week.

    Always pairing the lowest unmatched team first, and trying opponents in
    ascending order, gives every schedule exactly one path -> a fixed numbering.
    """
    a = 0
    while used & (1 << a):
        a += 1
    ta = tier_of(a)
    for b in range(a + 1, N_TEAMS):
        if used & (1 << b):
            continue
        tb = tier_of(b)
        # a must still need b's tier, and b must still need a's tier
        if not (needs[a] >> tb) & 1 or not (needs[b] >> ta) & 1:
            continue
        new_needs = list(needs)
        new_needs[a] &= ~(1 << tb)
        new_needs[b] &= ~(1 << ta)
        yield (a, b), used | (1 << a) | (1 << b), tuple(new_needs)


@lru_cache(maxsize=None)
def count_from(w, used, needs):
    """How many valid ways there are to finish the schedule from this state."""
    if used == FULL:  # this week is fully paired
        return 1 if w == N_WEEKS - 1 else count_from(w + 1, 0, needs)
    return sum(count_from(w, u, n) for _, u, n in branches(used, needs))


def total_schedules():
    return count_from(0, 0, ALL_NEEDS)


def schedule_at(k):
    """Rebuild schedule number k (0-based): at each step, skip whole branches
    whose schedule count is <= k, then descend into the branch containing k."""
    weeks = [[] for _ in range(N_WEEKS)]
    w, used, needs = 0, 0, ALL_NEEDS
    while True:
        if used == FULL:
            if w == N_WEEKS - 1:
                return weeks
            w, used = w + 1, 0
            continue
        for pair, u, n in branches(used, needs):
            c = count_from(w, u, n)
            if k < c:
                weeks[w].append(pair)
                used, needs = u, n
                break
            k -= c
        else:
            raise ValueError("schedule index out of range")


# ── Seed -> schedule ─────────────────────────────────────────────────────────
def mulberry32_first(seed):
    """First output of mulberry32, as a float in [0, 1).
    Bit-for-bit identical to the JavaScript version on the website."""
    m = 0xFFFFFFFF
    s = (seed + 0x6D2B79F5) & m
    t = s
    t = ((t ^ (t >> 15)) * (t | 1)) & m
    t = (t ^ ((t + (((t ^ (t >> 7)) * (t | 61)) & m)) & m)) & m
    return ((t ^ (t >> 14)) & m) / 4294967296


def draw_schedule(seed):
    total = total_schedules()
    index = math.floor(mulberry32_first(seed & 0xFFFFFFFF) * total)
    return index, total, schedule_at(index)


# ── Independent rule check ───────────────────────────────────────────────────
def is_valid(schedule):
    """Checks the rules directly, without using any of the counting code above."""
    if len(schedule) != N_WEEKS:
        return False
    faced = [set() for _ in range(N_TEAMS)]
    opponents = [set() for _ in range(N_TEAMS)]
    for week in schedule:
        seen = [t for pair in week for t in pair]
        if sorted(seen) != list(range(N_TEAMS)):  # everyone plays exactly once
            return False
        for a, b in week:
            if tier_of(b) in faced[a] or tier_of(a) in faced[b]:
                return False  # same tier faced twice
            faced[a].add(tier_of(b)); faced[b].add(tier_of(a))
            opponents[a].add(b); opponents[b].add(a)
    return all(f == {0, 1, 2} for f in faced) and all(len(o) == 3 for o in opponents)


def check_with_z3(schedule):
    """Optional cross-check: build the exact constraint model from the old
    flexmatchups_sat.py, pin every matchup variable to the drawn schedule, and
    ask Z3 whether that assignment satisfies the old rules. Requires z3-solver."""
    from z3 import Solver, Bool, AtMost, AtLeast, sat
    tiers = [list(range(t * TIER_SIZE, (t + 1) * TIER_SIZE)) for t in range(3)]
    teams = [t for tier in tiers for t in tier]
    weeks = range(N_WEEKS)
    solver = Solver()
    M = {(w, a, b): Bool(f"matchup_{w}_{a}_{b}") for w in weeks for a in teams for b in teams if a != b}
    for w in weeks:                                    # Constraint 1
        for t in teams:
            x = [M[w, t, o] for o in teams if o != t]
            solver.add(AtMost(*x, 1)); solver.add(AtLeast(*x, 1))
    for t in teams:                                    # Constraint 2
        others = [tier for i, tier in enumerate(tiers) if i != tier_of(t)]
        for tier in others:
            x = [M[w, t, o] for w in weeks for o in tier]
            solver.add(AtMost(*x, 1)); solver.add(AtLeast(*x, 1))
    for w in weeks:                                    # Constraint 3
        for a in teams:
            for b in teams:
                if a != b:
                    solver.add(M[w, a, b] == M[w, b, a])
    games = {(w, a, b) for w, week in enumerate(schedule) for a, b in week}
    for (w, a, b), var in M.items():                   # pin to the drawn schedule
        solver.add(var == ((w, a, b) in games or (w, b, a) in games))
    return solver.check() == sat


# ── Standings from Sleeper ───────────────────────────────────────────────────
def sleeper(path):
    req = urllib.request.Request(f"https://api.sleeper.app/v1{path}", headers={"User-Agent": "flex-schedule-script"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def fetch_standings(season):
    """Record and points for over weeks 1-11 only, rebuilt from weekly matchups
    (so running this during weeks 12-14 still gives the week-11 standings)."""
    lid = SLEEPER_LEAGUE_IDS[season]
    league = sleeper(f"/league/{lid}")
    users = {u["user_id"]: u for u in sleeper(f"/league/{lid}/users")}
    rosters = sleeper(f"/league/{lid}/rosters")
    s = league["settings"]
    last_scored = s.get("last_scored_leg", max(0, s.get("leg", 1) - 1))
    weeks = min(ROUND_ROBIN_WEEKS, last_scored)

    table = {}
    for r in rosters:
        u = users.get(r["owner_id"], {})
        table[r["roster_id"]] = {
            "manager": MANAGER_NAMES.get(r["owner_id"]) or u.get("display_name") or f"Team {r['roster_id']}",
            "wins": 0, "losses": 0, "ties": 0, "pf": 0.0,
        }
    for wk in range(1, weeks + 1):
        games = {}
        for m in sleeper(f"/league/{lid}/matchups/{wk}"):
            if m.get("matchup_id") is not None:
                games.setdefault(m["matchup_id"], []).append(m)
        for pair in games.values():
            if len(pair) != 2:
                continue
            a, b = pair
            ta, tb = table[a["roster_id"]], table[b["roster_id"]]
            ta["pf"] += a["points"]; tb["pf"] += b["points"]
            if a["points"] > b["points"]:
                ta["wins"] += 1; tb["losses"] += 1
            elif b["points"] > a["points"]:
                tb["wins"] += 1; ta["losses"] += 1
            else:
                ta["ties"] += 1; tb["ties"] += 1
    for t in table.values():
        t["pf"] = round(t["pf"], 2)
    return weeks, list(table.values())


def rank_teams(teams, by):
    def win_pct(t):
        g = t["wins"] + t["losses"] + t["ties"]
        return (t["wins"] + t["ties"] / 2) / g if g else 0
    if by == "pf":   # points for, record breaks ties, then name
        key = lambda t: (-t["pf"], -win_pct(t), t["manager"])
    else:            # record, points for breaks ties, then name
        key = lambda t: (-win_pct(t), -t["pf"], t["manager"])
    return sorted(teams, key=key)


# ── CLI ──────────────────────────────────────────────────────────────────────
def main():
    p = argparse.ArgumentParser(description="Frodd FFL flex schedule generator")
    p.add_argument("--seed", type=int, help="non-negative integer (agree on it in the group chat)")
    p.add_argument("--season", default="2026", choices=sorted(SLEEPER_LEAGUE_IDS))
    p.add_argument("--rank-by", default="pf", choices=["pf", "record"])
    p.add_argument("--tiers", help="skip Sleeper: 12 comma-separated names in rank order 1..12")
    p.add_argument("--self-test", action="store_true")
    p.add_argument("--check-z3", action="store_true", help="also verify the draw against the old Z3 rules (pip install z3-solver)")
    args = p.parse_args()

    if args.self_test:
        import random
        total = total_schedules()
        ks = [0, total - 1] + [random.randrange(total) for _ in range(2000)]
        ok = all(is_valid(schedule_at(k)) for k in ks)
        distinct = len({str(schedule_at(k)) for k in ks}) == len(set(ks))
        print(f"total valid schedules: {total:,}")
        print(f"{len(ks)} sampled schedules all obey the rules: {ok}; distinct numbers -> distinct schedules: {distinct}")
        sys.exit(0 if ok and distinct else 1)

    if args.seed is None or args.seed < 0:
        p.error("--seed is required (non-negative integer)")

    if args.tiers:
        names = [n.strip() for n in args.tiers.split(",")]
        if len(names) != N_TEAMS:
            p.error("--tiers needs exactly 12 names")
        source = "names given on the command line"
    else:
        weeks, teams = fetch_standings(args.season)
        ranked = rank_teams(teams, args.rank_by)
        names = [t["manager"] for t in ranked]
        label = "points for" if args.rank_by == "pf" else "record"
        source = f"Sleeper {args.season}, weeks 1-{weeks}, ranked by {label}"
        if weeks < ROUND_ROBIN_WEEKS:
            source += f"  ** PROVISIONAL: only {weeks} of {ROUND_ROBIN_WEEKS} weeks scored **"
        print("Standings:")
        for i, t in enumerate(ranked):
            print(f"  {i + 1:2}. {t['manager']:<8} {t['pf']:>8.2f}  {t['wins']}-{t['losses']}" + (f"-{t['ties']}" if t["ties"] else ""))

    index, total, schedule = draw_schedule(args.seed)
    assert is_valid(schedule)
    z3_line = None
    if args.check_z3:
        z3_line = "Z3 check (old flexmatchups_sat.py rules): " + ("PASS" if check_with_z3(schedule) else "FAIL")

    print(f"\nTiers ({source}):")
    for t in range(3):
        print(f"  Tier {t + 1}: {', '.join(names[t * TIER_SIZE:(t + 1) * TIER_SIZE])}")
    print(f"\nSeed {args.seed} -> schedule #{index + 1:,} of {total:,}\n")
    for w, week in enumerate(schedule):
        print(f"Week {FLEX_WEEKS[w]}:")
        for a, b in sorted(week, key=lambda m: (tier_of(m[0]) != tier_of(m[1]), m)):
            kind = "in-tier" if tier_of(a) == tier_of(b) else f"T{tier_of(a) + 1} vs T{tier_of(b) + 1}"
            print(f"  {names[a]:<8} vs {names[b]:<8} ({kind})")
    if z3_line:
        print(f"\n{z3_line}")


if __name__ == "__main__":
    main()
