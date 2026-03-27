import fs from 'fs/promises';
import path from 'path';

const ESPN_LEAGUE_ID = "19580891";
const SLEEPER_LEAGUE_ID = "1253749630043181056";
const ESPN_YEARS = [2019, 2020, 2021, 2022, 2023, 2024];
const START_YEAR_SLEEPER = 2025;
const SLEEPER_YEARS = Array.from({ length: new Date().getFullYear() - START_YEAR_SLEEPER + 1 }, (_, i) => START_YEAR_SLEEPER + i);

const SWID = "{3B177B51-3E3F-409C-8962-27AF6C29E84B}";
const ESPN_S2 = "AEBzbkHbeRa5q4DPt%2FRxS9QVAy9Sdw7ZPaqG50yVkEH0zdblYM6YrDEUY%2F0f0KhbVcF7bnPxM1toCTfA%2Bu%2FZlGneKDhJOYUe8K%2FDPay4s%2Ft6mF0DyzcgAGvmblrX8l2Oydb7KVzDo3vacnSNKSqruJB81%2B0TqP9MVlnlmAir97vNPsDmLXpUBrA8eXTRCgeKW8UUObp8qxbdomtEL8C81%2F100GFygYz5OG1afScM6s%2BaaENZMeN1v9D64UYXQeeAdfisYEmfjzVp5pEH9upjGZgWiDnkfp3C89MbVgbw7HznJQ%3D%3D";

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
    
    const headers = { 'Cookie': `swid=${SWID}; espn_s2=${ESPN_S2};` };
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Failed to fetch ESPN ${year}`);
    const json = await res.json();
    return year < 2023 ? json[0] : json;
}

async function fetchSleeperData(endpoint) {
    const res = await fetch(`https://api.sleeper.app/v1/league/${SLEEPER_LEAGUE_ID}/${endpoint}`);
    if (!res.ok) throw new Error(`Failed to fetch Sleeper endpoint: ${endpoint}`);
    return res.json();
}

async function fetchSleeperMatchups(week) {
    return fetchSleeperData(`matchups/${week}`);
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

        try {
            const season = await fetchESPNSeason(year);
            await fs.writeFile(archivePath, JSON.stringify(season, null, 2));
            console.log(`Successfully archived ESPN data for ${year}`);
        } catch (e) {
            console.error(`Failed to archive ESPN data for ${year}:`, e);
        }
    }

    for (const year of SLEEPER_YEARS) {
        const archivePath = path.join('src', 'data', 'archive', `matchups_sleeper_${year}.json`);
        
        if (await fileExists(archivePath)) {
            console.log(`Archived Sleeper data for ${year} already exists, skipping fetch.`);
            continue;
        }

        try {
            console.log(`Fetching Sleeper season ${year}...`);
            
            console.log(`Fetching Sleeper users...`);
            const users = await fetchSleeperData('users');
            
            console.log(`Fetching Sleeper rosters...`);
            const rosters = await fetchSleeperData('rosters');
            
            console.log(`Fetching Sleeper winners bracket...`);
            const winnersBracket = await fetchSleeperData('winners_bracket');

            console.log(`Fetching Sleeper losers bracket...`);
            const losersBracket = await fetchSleeperData('losers_bracket');
            
            const allMatchups = [];
            for (let week = 1; week <= 18; week++) {
                console.log(`Fetching Sleeper matchups for week ${week}...`);
                const matchups = await fetchSleeperMatchups(week);
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