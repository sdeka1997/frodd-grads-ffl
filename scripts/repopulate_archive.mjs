import fs from 'fs/promises';
import path from 'path';
import { registry, seasons, assertWritable } from './lib/seasons.mjs';

// Years, platforms and league IDs come from src/data/seasons.json
const ESPN_LEAGUE_ID = registry.espnLeagueId;
const ESPN_YEARS = seasons.filter(s => s.platform === 'espn').map(s => s.year);
const SLEEPER_SEASONS = seasons.filter(s => s.platform === 'sleeper');

// ESPN login cookies, only needed to re-download a 2019-2024 ESPN archive (all are already archived).
// Provide them via the environment; never commit them.
const SWID = process.env.ESPN_SWID;
const ESPN_S2 = process.env.ESPN_S2;

async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function fetchESPNSeason(year, views = ['mTeam', 'mRoster', 'mSettings', 'mMatchup']) {
    console.log(`Fetching ESPN season ${year}...`);
    const viewParams = views.map(v => `view=${v}`).join('&');
    const url = year < 2023 
        ? `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/leagueHistory/${ESPN_LEAGUE_ID}?seasonId=${year}&${viewParams}`
        : `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${year}/segments/0/leagues/${ESPN_LEAGUE_ID}?${viewParams}`;
    
    if (!SWID || !ESPN_S2) {
        throw new Error('Set ESPN_SWID and ESPN_S2 (cookies from fantasy.espn.com) to download ESPN seasons.');
    }
    const headers = { 'Cookie': `swid=${SWID}; espn_s2=${ESPN_S2};` };
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Failed to fetch ESPN ${year}`);
    const json = await res.json();
    return year < 2023 ? json[0] : json;
}

async function fetchSleeperData(leagueId, endpoint) {
    const res = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/${endpoint}`);
    if (!res.ok) throw new Error(`Failed to fetch Sleeper endpoint: ${endpoint}`);
    return res.json();
}

async function fetchSleeperMatchups(leagueId, week) {
    return fetchSleeperData(leagueId, `matchups/${week}`);
}

async function main() {
    // Ensure archive directory exists
    await fs.mkdir(path.join('src', 'data', 'archive'), { recursive: true });

    for (const year of ESPN_YEARS) {
        const archivePath = path.join('src', 'data', 'archive', `matchups_espn_${year}.json`);
        
        if (await fileExists(archivePath)) {
            console.log(`Archived ESPN data for ${year} already exists, skipping fetch.`);
            continue;
        }
        assertWritable(year, archivePath); // backfilling a missing locked season needs ALLOW_ARCHIVE_EDIT=1

        try {
            const season = await fetchESPNSeason(year);
            await fs.writeFile(archivePath, JSON.stringify(season, null, 2));
            console.log(`Successfully archived ESPN data for ${year}`);
        } catch (e) {
            console.error(`Failed to archive ESPN data for ${year}:`, e);
        }
    }

    for (const { year, leagueId, status } of SLEEPER_SEASONS) {
        const archivePath = path.join('src', 'data', 'archive', `matchups_sleeper_${year}.json`);

        if (status !== 'final') {
            // In-progress seasons need score-aware handling (unplayed / partial weeks); not wired up yet.
            console.log(`Skipping ${year}: in-progress season refresh is handled separately.`);
            continue;
        }
        if (await fileExists(archivePath)) {
            console.log(`Archived Sleeper data for ${year} already exists, skipping fetch.`);
            continue;
        }
        assertWritable(year, archivePath);

        try {
            console.log(`Fetching Sleeper season ${year}...`);
            
            console.log(`Fetching Sleeper users...`);
            const users = await fetchSleeperData(leagueId, 'users');
            
            console.log(`Fetching Sleeper rosters...`);
            const rosters = await fetchSleeperData(leagueId, 'rosters');
            
            console.log(`Fetching Sleeper winners bracket...`);
            const winnersBracket = await fetchSleeperData(leagueId, 'winners_bracket');

            console.log(`Fetching Sleeper losers bracket...`);
            const losersBracket = await fetchSleeperData(leagueId, 'losers_bracket');
            
            const allMatchups = [];
            for (let week = 1; week <= 18; week++) {
                console.log(`Fetching Sleeper matchups for week ${week}...`);
                const matchups = await fetchSleeperMatchups(leagueId, week);
                if (!matchups || matchups.length === 0) break;
                allMatchups.push({ week, matchups });
            }

            const archiveData = {
                year,
                users,
                rosters,
                winnersBracket,
                losersBracket,
                matchups: allMatchups
            };

            await fs.writeFile(archivePath, JSON.stringify(archiveData, null, 2));
            console.log(`Successfully archived Sleeper data for ${year}`);
        } catch (e) {
            console.error(`Failed to archive Sleeper data for ${year}:`, e);
        }
    }
}

main();