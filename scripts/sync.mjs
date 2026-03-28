import fs from 'fs/promises';
import path from 'path';

function getOrdinal(rank) {
    if (rank === 1) return "1st";
    if (rank === 2) return "2nd";
    if (rank === 3) return "3rd";
    if (rank === 0) return "N/A";
    return `${rank}th`;
}

async function main() {
    const fflData = {
        league_id: "Brown_Frodd_Grads_FFL",
        cumulative_records: [],
        seasons: {}
    };

    const h2hData = { seasons: {} };
    const managerStats = {}; 

    const matchupsDir = path.join('src', 'data', 'matchups');
    const files = await fs.readdir(matchupsDir);
    const sortedFiles = files.filter(f => f.endsWith('.json')).sort();

    for (const file of sortedFiles) {
        const yearMatch = file.match(/(\d{4})/);
        if (!yearMatch) continue;
        const year = parseInt(yearMatch[0]);
        const platform = file.includes('espn') ? 'espn' : 'sleeper';

        try {
            const rawData = await fs.readFile(path.join(matchupsDir, file), 'utf8');
            const data = JSON.parse(rawData);
            
            const teamIdToOwner = {};
            const teamIdToSeed = {};

            Object.values(data.mappings.teams).forEach(t => {
                teamIdToOwner[t.teamId] = t.managerName;
                teamIdToSeed[t.teamId] = t.playoffSeed;
            });

            const yearH2H = { 
                regular: { managers: Object.values(teamIdToOwner), matrix: {} },
                playoffs: { managers: Object.values(teamIdToOwner), matrix: {} }
            };

            const statsByOwner = {};
            Object.values(teamIdToOwner).forEach(name => {
                statsByOwner[name] = {
                    teamName: Object.values(data.mappings.teams).find(t => t.managerName === name).teamName,
                    regular_season: { wins: 0, losses: 0, pf: 0, pa: 0 },
                    post_season: { wins: 0, losses: 0, pf: 0, pa: 0, bracket: "none" },
                    playoff_record: { wins: 0, losses: 0 }
                };
            });
            
            const regularWeeks = data.settings.regularSeasonLength;

            data.matchups.forEach(m => {
                const homeOwner = m.home.manager;
                const awayOwner = m.away ? m.away.manager : null;

                const isPostSeason = m.isPlayoff;
                const label = m.label || "";

                // Categorize bracket
                if (isPostSeason && awayOwner) {
                    const winnersLabels = ["quarterfinal", "semifinal", "championship"];
                    if (winnersLabels.includes(label)) {
                        statsByOwner[homeOwner].post_season.bracket = "championship";
                        statsByOwner[awayOwner].post_season.bracket = "championship";
                    } else if (label.includes("sacko")) {
                        statsByOwner[homeOwner].post_season.bracket = "sacko";
                        statsByOwner[awayOwner].post_season.bracket = "sacko";
                    } else if (label !== "") {
                        statsByOwner[homeOwner].post_season.bracket = "consolation";
                        statsByOwner[awayOwner].post_season.bracket = "consolation";
                    }
                }

                // Add regular season stats
                if (!isPostSeason) {
                    statsByOwner[homeOwner].regular_season.pf += m.home.points || 0;
                    if (m.away) {
                        statsByOwner[homeOwner].regular_season.pa += m.away.points || 0;
                        statsByOwner[awayOwner].regular_season.pf += m.away.points || 0;
                        statsByOwner[awayOwner].regular_season.pa += m.home.points || 0;
                    }
                }

                // Skip BYE weeks and unplayed matchups — post_season PF/PA and wins/losses
                // should only reflect real, decided matchups (not bye weeks)
                if (!awayOwner || m.winner === "UNDECIDED") return;

                // Add post season stats (championship bracket only)
                if (isPostSeason && statsByOwner[homeOwner].post_season.bracket === "championship") {
                    statsByOwner[homeOwner].post_season.pf += m.home.points || 0;
                    statsByOwner[homeOwner].post_season.pa += m.away.points || 0;
                    statsByOwner[awayOwner].post_season.pf += m.away.points || 0;
                    statsByOwner[awayOwner].post_season.pa += m.home.points || 0;
                }

                const matrix = isPostSeason ? yearH2H.playoffs.matrix : yearH2H.regular.matrix;
                if (!matrix[homeOwner]) matrix[homeOwner] = {};
                if (!matrix[awayOwner]) matrix[awayOwner] = {};
                if (!matrix[homeOwner][awayOwner]) matrix[homeOwner][awayOwner] = "0-0";
                if (!matrix[awayOwner][homeOwner]) matrix[awayOwner][homeOwner] = "0-0";
                const [hW, hL] = matrix[homeOwner][awayOwner].split('-').map(Number);
                const [aW, aL] = matrix[awayOwner][homeOwner].split('-').map(Number);

                if (m.winner === "HOME") {
                    matrix[homeOwner][awayOwner] = `${hW + 1}-${hL}`;
                    matrix[awayOwner][homeOwner] = `${aW}-${aL + 1}`;
                    if (!isPostSeason) {
                        statsByOwner[homeOwner].regular_season.wins++;
                        statsByOwner[awayOwner].regular_season.losses++;
                    } else {
                        if (statsByOwner[homeOwner].post_season.bracket === "championship") {
                            statsByOwner[homeOwner].post_season.wins++;
                            statsByOwner[awayOwner].post_season.losses++;
                            statsByOwner[homeOwner].playoff_record.wins++;
                            statsByOwner[awayOwner].playoff_record.losses++;
                        }
                    }
                } else if (m.winner === "AWAY") {
                    matrix[homeOwner][awayOwner] = `${hW}-${hL + 1}`;
                    matrix[awayOwner][homeOwner] = `${aW + 1}-${aL}`;
                    if (!isPostSeason) {
                        statsByOwner[awayOwner].regular_season.wins++;
                        statsByOwner[homeOwner].regular_season.losses++;
                    } else {
                        if (statsByOwner[awayOwner].post_season.bracket === "championship") {
                            statsByOwner[awayOwner].post_season.wins++;
                            statsByOwner[homeOwner].post_season.losses++;
                            statsByOwner[awayOwner].playoff_record.wins++;
                            statsByOwner[homeOwner].playoff_record.losses++;
                        }
                    }
                }
            });

            // Derive Final Standings
            const finalStandings = {};
            
            // 1. First, check if mappings have finalRank (common in Sleeper)
            Object.values(data.mappings.teams).forEach(t => {
                if (t.finalRank && t.finalRank > 0) {
                    finalStandings[t.managerName] = t.finalRank;
                }
            });

            // 2. Then, supplement/override with explicit playoff match labels
            data.matchups.filter(m => m.isPlayoff).forEach(m => {
                // Determine winner and loser correctly considering ties
                let winner = null;
                let loser = null;

                if (m.winner === "HOME") {
                    winner = m.home.manager;
                    loser = m.away ? m.away.manager : null;
                } else if (m.winner === "AWAY") {
                    winner = m.away ? m.away.manager : null;
                    loser = m.home.manager;
                } else {
                    // Tie case - higher seed wins (usually home team in playoffs)
                    winner = m.home.manager;
                    loser = m.away ? m.away.manager : null;
                }

                if (!winner || !loser) return; // Skip bye weeks

                const label = m.label || "";
                
                if (label === "championship") { finalStandings[winner] = 1; finalStandings[loser] = 2; }
                else if (label === "3rd_place_final") { finalStandings[winner] = 3; finalStandings[loser] = 4; }
                else if (label === "5th_place_final") { finalStandings[winner] = 5; finalStandings[loser] = 6; }
                else if (label === "7th_place_final") { finalStandings[winner] = 7; finalStandings[loser] = 8; }
                else if (label === "9th_place_final_sacko_qf") { finalStandings[winner] = 9; finalStandings[loser] = 10; }
                else if (label === "10th_place_final_sacko_sf") { finalStandings[winner] = 10; finalStandings[loser] = 11; }
                else if (label === "sacko_final") { finalStandings[winner] = 11; finalStandings[loser] = 12; }
            });

            // Special Logic for sacko_roundrobin (e.g., 2020)
            const roundRobinManagers = Object.keys(statsByOwner).filter(name => {
                return data.matchups.some(m => m.label === "sacko_roundrobin" && (m.home.manager === name || (m.away && m.away.manager === name)));
            });

            if (roundRobinManagers.length > 0) {
                const sortedRR = roundRobinManagers.sort((a, b) => {
                    const statsA = statsByOwner[a];
                    const statsB = statsByOwner[b];
                    const totalWinsA = statsA.regular_season.wins + statsA.post_season.wins;
                    const totalWinsB = statsB.regular_season.wins + statsB.post_season.wins;
                    const totalPFA = statsA.regular_season.pf + statsA.post_season.pf;
                    const totalPFB = statsB.regular_season.pf + statsB.post_season.pf;
                    return (totalWinsB - totalWinsA) || (totalPFB - totalPFA);
                });
                
                // Find the highest available rank (e.g., if top 8 are ranked, start at 9)
                let startRank = 12 - roundRobinManagers.length + 1;
                sortedRR.forEach((name, i) => {
                    finalStandings[name] = startRank + i;
                });
            }

            // Calculations for Averages
            const allPF = Object.values(statsByOwner).map(s => s.regular_season.pf);
            const avgPF = allPF.reduce((a, b) => a + b, 0) / Object.keys(statsByOwner).length;
            const allPA = Object.values(statsByOwner).map(s => s.regular_season.pa);
            const avgPA = allPA.reduce((a, b) => a + b, 0) / Object.keys(statsByOwner).length;

            // Build Year Output
            const yearOutput = [];
            for (const [name, stats] of Object.entries(statsByOwner)) {
                const rank = finalStandings[name] || 0;
                const entry = {
                    owner: name,
                    team: stats.teamName,
                    regular_season: {
                        wins: stats.regular_season.wins,
                        losses: stats.regular_season.losses,
                        pf: parseFloat(stats.regular_season.pf.toFixed(2)),
                        pa: parseFloat(stats.regular_season.pa.toFixed(2)),
                        pf_pg: parseFloat((stats.regular_season.pf / regularWeeks).toFixed(2)),
                        pa_pg: parseFloat((stats.regular_season.pa / regularWeeks).toFixed(2))
                    },
                    post_season: {
                        wins: stats.post_season.wins,
                        losses: stats.post_season.losses,
                        pf: parseFloat(stats.post_season.pf.toFixed(2)),
                        pa: parseFloat(stats.post_season.pa.toFixed(2)),
                        bracket: stats.post_season.bracket
                    },
                    playoff_finish: getOrdinal(rank),
                    playoff_record: `${stats.playoff_record.wins}-${stats.playoff_record.losses}`
                };
                yearOutput.push(entry);

                // Cumulative
                if (!managerStats[name]) {
                    managerStats[name] = { wins: 0, losses: 0, pf: 0, pa: 0, totalAvgPF: 0, totalAvgPA: 0, seasons: 0, championships: 0, playoffWins: 0, playoffLosses: 0, totalGames: 0 };
                }
                const mStats = managerStats[name];
                mStats.wins += stats.regular_season.wins;
                mStats.losses += stats.regular_season.losses;
                mStats.pf += stats.regular_season.pf;
                mStats.pa += stats.regular_season.pa;
                mStats.totalAvgPF += avgPF;
                mStats.totalAvgPA += avgPA;
                mStats.seasons++;
                mStats.totalGames += regularWeeks;
                mStats.playoffWins += stats.playoff_record.wins;
                mStats.playoffLosses += stats.playoff_record.losses;
                if (rank === 1) mStats.championships++;
            }

            fflData.seasons[year] = yearOutput;
            h2hData.seasons[year] = yearH2H;
            console.log(`Successfully synced year ${year}`);

        } catch (e) {
            console.error(`Error processing ${file}:`, e);
        }
    }

    // Finalize Cumulative
    for (const [name, stats] of Object.entries(managerStats)) {
        fflData.cumulative_records.push({
            manager: name,
            wins: stats.wins,
            losses: stats.losses,
            pf_vs_avg: parseFloat(((stats.pf - stats.totalAvgPF) / stats.totalGames).toFixed(2)), 
            pa_vs_avg: parseFloat(((stats.pa - stats.totalAvgPA) / stats.totalGames).toFixed(2)),
            championships: stats.championships,
            playoff_record: `${stats.playoffWins}-${stats.playoffLosses}`
        });
    }

    await fs.writeFile(path.join('src', 'data', 'ffl_data.json'), JSON.stringify(fflData, null, 2));
    await fs.writeFile(path.join('src', 'data', 'head_to_head.json'), JSON.stringify(h2hData, null, 2));
    console.log("Unified Sync complete with nested data schema!");
}

main().catch(console.error);