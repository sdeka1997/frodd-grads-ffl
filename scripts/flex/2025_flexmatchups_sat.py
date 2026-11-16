from z3 import Solver, Bool, And, Or, AtMost, AtLeast
import z3
import numpy as np
import math # i still do it for palanki

# Initialize the solver
solver = Solver()

# Define teams by tier
tier1 = ["Shrey", "Palanki", "Nikhil", "Manuj"]
tier2 = ["Asad", "RoK", "Swap", "RoB"]
tier3 = ["Smeet", "Arun", "Ameesh", "Sai"]

# set seed to make PRNG reproducible
np.random.seed(67)

# Define weeks and all teams
weeks = range(3)
teams = tier1 + tier2 + tier3

# Create a boolean variable for each possible matchup between two teams for each week
# matchup[w][t1][t2] will be True if team `t1` plays against team `t2` in week `w`
matchup = {
    (w, t1, t2): Bool(f"matchup_{w}_{t1}_{t2}")
    for w in weeks
    for t1 in teams
    for t2 in teams
    if t1 != t2
}

# Constraint 1: Each team plays exactly once per week
for w in weeks:
    for team in teams:
        team_matches = [matchup[w, team, opponent] for opponent in teams if opponent != team]
        solver.add(AtMost(*team_matches, 1))   # At most one match per week
        solver.add(AtLeast(*team_matches, 1))  # At least one match per week

# Constraint 2: Each team plays against one team from each other tier over the three weeks
for team in teams:
    if team in tier1:
        tier_opponents = [tier2, tier3]
    elif team in tier2:
        tier_opponents = [tier1, tier3]
    else:
        tier_opponents = [tier1, tier2]
    
    # Ensure one game against each tier across the 3 weeks
    for tier in tier_opponents:
        tier_matches = [matchup[w, team, opponent] for w in weeks for opponent in tier]
        solver.add(AtMost(*tier_matches, 1))   # At most one match against this tier
        solver.add(AtLeast(*tier_matches, 1))  # At least one match against this tier

# Constraint 3: Matchups are symmetric, so if team1 plays team2, team2 also plays team1
for w in weeks:
    for t1 in teams:
        for t2 in teams:
            if t1 != t2:
                solver.add(matchup[w, t1, t2] == matchup[w, t2, t1])

# Check if the schedule is satisfiable and print the results

if solver.check() == z3.sat:
    model = solver.model()
    schedule = {w: [] for w in weeks}
    for w in weeks:
        for t1 in teams:
            for t2 in teams:
                if t1 != t2 and model.evaluate(matchup[w, t1, t2]):
                    if sorted((t1, t2)) not in schedule[w]: # avoid printing symmetric repeats
                        schedule[w].append(sorted((t1, t2)))
    for w in weeks:
        print(f"Week {w + 1}: {schedule[w]}")
else:
    print("No solution found")
