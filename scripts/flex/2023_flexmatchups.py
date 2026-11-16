import math  # this one is for u palanki
import numpy as np

num_teams = 12
num_matchups = 3
tiers = ["top", "middle", "bottom"]

'''
return type: list of tuples indicating matchups
'''

def run_flex_matchups():
    num_teams_in_tiers = int(num_teams / num_matchups)
    matchups = {}
    for tier1 in tiers:
        for tier2 in tiers:
            matchup = (tier1, tier2)
            tier1_teams = list(range(num_teams_in_tiers))
            tier2_teams = list(range(num_teams_in_tiers))
            if tier1 == tier2:
                # same tier, so only 2 matchups
                permute = np.random.permutation(tier1_teams)
                matchups[matchup] = []
                for tplidx in range(0, len(permute), 2):
                    matchups[matchup].append((permute[tplidx], permute[tplidx + 1]))
            else:
                t1_teamlist = np.random.permutation(tier1_teams)
                t2_teamlist = np.random.permutation(tier2_teams)
                matchups[matchup] = list(zip(t1_teamlist, t2_teamlist))
    return matchups

print(run_flex_matchups())
