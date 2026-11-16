import fs from 'fs/promises';
import path from 'path';
import { getSeason, isFinal, archiveEditAllowed } from './lib/seasons.mjs';

const OWNER_MAP = {
    "{03B69993-DB31-412A-9990-AEC4B9B7A735}": "Ameesh",
    "{3B177B51-3E3F-409C-8962-27AF6C29E84B}": "Swapnav",
    "{4C543AFB-4A0F-40EE-90FD-06DA1F680552}": "Nikhil",
    "{59C15262-C9BF-4B59-8132-829171FF5505}": "Shrey",
    "{5CDDDA9E-A33E-43C8-9DDA-9EA33E73C875}": "Arun",
    "{64FEDC3E-3163-43D3-BE34-466CEC5AF1AD}": "Asad",
    "{80CE55A3-2FD4-43B9-9F0F-2A485503B296}": "Smeet",
    "{83CF326E-8A49-4B96-8F32-6E8A49CB961C}": "Manuj",
    "{97688BDD-1F46-46CB-A88B-DD1F4606CBDE}": "Sai",
    "{A7407460-27F4-4923-8074-6027F4092300}": "Ro B",
    "{CEC5C9BD-AFBC-4FB4-BAC9-3E8BE6BDEAC9}": "Palanki",
    "{E5AD6571-AFA7-4CC8-AD65-71AFA7DCC80C}": "Ro K",
};

const LEGACY_DISPLAY_NAMES = {
    "DirkisG.O.A.T": "Voldemort",
    "Dirk is goat": "Voldemort",
    "coolkalva": "Saiesh",
    "Kool Kulva": "Saiesh"
};
const getCleanName = (raw) => LEGACY_DISPLAY_NAMES[raw] || raw;

const SLEEPER_USER_TO_MANAGER = {
    "nikhil23": "Nikhil",
    "alalani": "Asad",
    "ameesh": "Ameesh",
    "smeetmadhani": "Smeet",
    "mshah99": "Manuj",
    "rohanbhardwaj": "Ro B",
    "drchilly": "Sai",
    "hoothootgoowls": "Swapnav",
    "shrey45": "Shrey",
    "rokrish96": "Ro K",
    "PantomimeKane": "Arun",
    "drdrroro": "Palanki"
};

// Sleeper user id -> manager name (stable across display-name changes)
const SLEEPER_USER_ID_TO_MANAGER = {
    "649449296185393152": "Swapnav", "993281156730753024": "Nikhil",
    "727988023450505216": "Asad", "1253774743752937472": "Arun",
    "994333195090866176": "Ameesh", "994330569154539520": "Ro B",
    "994051773549633536": "Smeet", "1154199635821522944": "Ro K",
    "994326168872550400": "Manuj", "1260468517744943104": "Palanki",
    "996065541934620672": "Sai", "996604246772576256": "Shrey",
};

async function main() {
    const archiveDir = path.join('src', 'data', 'archive');
    const matchupsDir = path.join('src', 'data', 'matchups');
    
    await fs.mkdir(matchupsDir, { recursive: true });
    
    const files = await fs.readdir(archiveDir);
    
    for (const file of files) {
        const yearMatch = file.match(/\d{4}/);
        if (!yearMatch) continue;
        const year = parseInt(yearMatch[0]);
        const platform = file.includes('espn') ? 'espn' : 'sleeper';
        const outputPath = path.join(matchupsDir, `${year}_${platform}.json`);

        const season = getSeason(year);
        if (!season) {
            console.log(`Skipping ${file}: ${year} is not listed in src/data/seasons.json.`);
            continue;
        }
        if (season.status !== 'final' && platform !== 'sleeper') {
            console.log(`Skipping ${year}: only Sleeper seasons can be in progress.`);
            continue;
        }
        // Locked seasons keep their committed matchups file (it may carry manual label fixes)
        if (isFinal(year) && !archiveEditAllowed()) {
            let exists = true;
            try { await fs.access(outputPath); } catch { exists = false; }
            if (exists) {
                console.log(`Skipping ${platform.toUpperCase()} ${year}: final season, matchups file is locked.`);
                continue;
            }
            throw new Error(`${year} is final but ${outputPath} is missing. Restore it from git, or rerun with ALLOW_ARCHIVE_EDIT=1 to rebuild it deliberately.`);
        }
        
        const filePath = path.join(archiveDir, file);
        const data = JSON.parse(await fs.readFile(filePath, 'utf8'));

        const teamMapping = {};
        const ownerMapping = {};
        const matchups = [];
        
        let regularSeasonLength = 0;
        let postSeasonLength = 0;
        let totalPeriods = 0;
        let playoffTeamCount = 0;

        if (file.startsWith('matchups_espn_')) {
            if (data.teams) {
                data.teams.forEach(t => {
                    const ownerId = t.primaryOwner;
                    const rawName = OWNER_MAP[ownerId] || (data.members && data.members.find(m => m.id === ownerId)?.displayName) || "Unknown";
                    const cleanName = getCleanName(rawName);
                    teamMapping[t.id] = {
                        teamId: t.id,
                        ownerId: ownerId,
                        managerName: cleanName,
                        teamName: t.name || `${t.location} ${t.nickname}`.trim(),
                        playoffSeed: t.playoffSeed,
                        finalRank: null
                    };
                    if (ownerId) ownerMapping[ownerId] = cleanName;
                });
            }
            regularSeasonLength = data.settings?.scheduleSettings?.matchupPeriodCount || 0;
            totalPeriods = data.settings?.scheduleSettings?.matchupPeriods ? Object.keys(data.settings.scheduleSettings.matchupPeriods).length : 0;
            postSeasonLength = totalPeriods > 0 ? totalPeriods - regularSeasonLength : 0;
            playoffTeamCount = data.settings?.scheduleSettings?.playoffTeamCount || 0;

            if (data.schedule) {
                data.schedule.forEach(m => {
                    if (!m.home) return;
                    const period = m.matchupPeriodId;
                    const isPlayoff = period > regularSeasonLength;
                    matchups.push({
                        period: period,
                        isPlayoff: isPlayoff,
                        winner: m.winner,
                        home: { teamId: m.home.teamId, manager: teamMapping[m.home.teamId]?.managerName || "Unknown", points: m.home.totalPoints || 0 },
                        away: m.away ? { teamId: m.away.teamId, manager: teamMapping[m.away.teamId]?.managerName || "Unknown", points: m.away.totalPoints || 0 } : null
                    });
                });
            }
            
        } else if (file.startsWith('matchups_sleeper_')) {
            if (data.league?.settings?.playoff_week_start) {
                // Archives saved with league settings (2026+): read the real season shape
                regularSeasonLength = data.league.settings.playoff_week_start - 1;
                playoffTeamCount = data.league.settings.playoff_teams || 8;
            } else {
                // Older archives (2025): wins + losses of a finished season, default 14
                regularSeasonLength = data.rosters?.[0]?.settings?.wins + data.rosters?.[0]?.settings?.losses || 14;
                playoffTeamCount = 8;
            }
            postSeasonLength = 3;
            totalPeriods = regularSeasonLength + postSeasonLength;

            const userIdToManager = {};
            const userIdToTeamName = {};
            if (data.users) {
                data.users.forEach(u => {
                    // User IDs never change; display names can, so they are only a fallback
                    const manager = SLEEPER_USER_ID_TO_MANAGER[u.user_id] || SLEEPER_USER_TO_MANAGER[u.display_name] || u.display_name;
                    userIdToManager[u.user_id] = manager;
                    userIdToTeamName[u.user_id] = u.metadata?.team_name || u.display_name;
                });
            }

            const finalRanks = {};
            const playoffLabels = {};

            const processBracket = (bracket, isWinners) => {
                if (!bracket) return;
                bracket.forEach(m => {
                    const week = m.r + regularSeasonLength;
                    const t1 = m.t1;
                    const t2 = m.t2;
                    if (!t1 || !t2) return;

                    let label = "";
                    const p = m.p || 1; // Default to p=1 for main bracket if missing

                    if (isWinners) {
                        if (p === 1) { // Main Winners Bracket
                            if (m.r === 1) label = "quarterfinal";
                            else if (m.r === 2) {
                                // Games fed by losers of round 1 are 5th place semis, not true semis
                                const fromLosers = (m.t1_from && m.t1_from.l) || (m.t2_from && m.t2_from.l);
                                label = fromLosers ? "5th_place_semifinal" : "semifinal";
                            }
                            else if (m.r === 3) {
                                label = "championship";
                                if (m.w) finalRanks[m.w] = 1;
                                if (m.l) finalRanks[m.l] = 2;
                            }
                        } else if (p === 3) {
                            if (m.r === 2) label = "3rd_place_semifinal"; // Technically just losers of winners semis
                            else if (m.r === 3) {
                                label = "3rd_place_final";
                                if (m.w) finalRanks[m.w] = 3;
                                if (m.l) finalRanks[m.l] = 4;
                            }
                        } else if (p === 5) {
                            if (m.r === 2) label = "consolation_semifinal";
                            else if (m.r === 3) {
                                label = "5th_place_final";
                                if (m.w) finalRanks[m.w] = 5;
                                if (m.l) finalRanks[m.l] = 6;
                            }
                        } else if (p === 7) {
                            if (m.r === 2) label = "consolation_semifinal";
                            else if (m.r === 3) {
                                label = "7th_place_final";
                                if (m.w) finalRanks[m.w] = 7;
                                if (m.l) finalRanks[m.l] = 8;
                            }
                        }
                    } else { // Losers Bracket (Toilet Bowl)
                        if (m.r === 1) {
                            label = "sacko_semifinal";
                        } else if (m.r === 2) {
                            if (p === 1) { // 11th/12th
                                label = "sacko_final";
                                if (m.w) finalRanks[m.w] = 11;
                                if (m.l) finalRanks[m.l] = 12;
                            } else if (p === 3) { // 9th/10th
                                label = "9th_place_final";
                                if (m.w) finalRanks[m.w] = 9;
                                if (m.l) finalRanks[m.l] = 10;
                            }
                        }
                    }

                    if (label) {
                        playoffLabels[`${week}_${t1}_${t2}`] = label;
                        playoffLabels[`${week}_${t2}_${t1}`] = label;
                    }
                });
            };

            processBracket(data.winnersBracket, true);
            processBracket(data.losersBracket, false);

            if (data.rosters) {
                data.rosters.forEach(r => {
                    const manager = userIdToManager[r.owner_id] || "Unknown";
                    teamMapping[r.roster_id] = {
                        teamId: r.roster_id,
                        ownerId: r.owner_id,
                        managerName: manager,
                        teamName: userIdToTeamName[r.owner_id] || `Team ${manager}`,
                        playoffSeed: r.settings?.wins || 0,
                        finalRank: finalRanks[r.roster_id] || 0
                    };
                    ownerMapping[r.owner_id] = manager;
                });
            }

            for (const weekData of data.matchups) {
                const week = weekData.week;
                const isPlayoff = week > regularSeasonLength;
                const groups = {};
                weekData.matchups.forEach(m => {
                    if (!groups[m.matchup_id]) groups[m.matchup_id] = [];
                    groups[m.matchup_id].push(m);
                });

                Object.values(groups).forEach(pair => {
                    if (pair.length !== 2) return;
                    const [m1, m2] = pair;
                    const winner = m1.points > m2.points ? "HOME" : (m2.points > m1.points ? "AWAY" : "TIE");
                    const labelKey = `${week}_${m1.roster_id}_${m2.roster_id}`;
                    const label = playoffLabels[labelKey] || "";

                    matchups.push({
                        period: week,
                        isPlayoff: isPlayoff,
                        label: label,
                        winner: winner,
                        home: { teamId: m1.roster_id, manager: teamMapping[m1.roster_id].managerName, points: m1.points },
                        away: { teamId: m2.roster_id, manager: teamMapping[m2.roster_id].managerName, points: m2.points }
                    });
                });
            }
        }

        const settings = { regularSeasonLength, postSeasonLength, totalPeriods, playoffTeamCount };
        if (season.status !== 'final') {
            // Lets the site label the season as in progress and know how far it has got
            settings.status = 'in_progress';
            settings.lastScoredWeek = data.lastScoredWeek ?? Math.max(0, ...data.matchups.map(w => w.week));
        }
        const yearData = {
            settings,
            mappings: { teams: teamMapping, owners: ownerMapping },
            matchups
        };
        await fs.writeFile(outputPath, JSON.stringify(yearData, null, 2));
        console.log(`Parsed ${platform.toUpperCase()} ${year}`);
    }
}

main().catch(console.error);