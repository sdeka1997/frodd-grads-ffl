// Archive check: every final (locked) season must be byte-for-byte unchanged
// compared with a git ref (default HEAD). Run after any data script, and the
// weekly refresh job runs it before committing. Exits 1 if anything changed.
//
//   npm run verify:archive            # compare working tree with HEAD
//   npm run verify:archive -- main    # compare with another ref

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { isDeepStrictEqual } from 'util';

const ref = process.argv[2] || 'HEAD';
const DATA = path.join('src', 'data');
const problems = [];

const atRef = (file) => {
    try {
        return execFileSync('git', ['show', `${ref}:${file}`], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
    } catch {
        return null; // not present at ref
    }
};
const now = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null);

const refRegistry = JSON.parse(atRef(path.join(DATA, 'seasons.json')) ?? '{"seasons":[]}');
const curRegistry = JSON.parse(now(path.join(DATA, 'seasons.json')));
const curStatus = new Map(curRegistry.seasons.map(s => [s.year, s.status]));

// Seasons locked at the ref stay locked; seasons locked now are checked too
// (so flipping a season to final in the same commit as editing it is caught).
for (const s of refRegistry.seasons) {
    if (s.status === 'final' && curStatus.get(s.year) !== 'final') {
        problems.push(`${s.year} was final at ${ref} but is now "${curStatus.get(s.year) ?? 'missing'}" in seasons.json`);
    }
}
const locked = [...new Set([
    ...refRegistry.seasons.filter(s => s.status === 'final').map(s => s.year),
    ...curRegistry.seasons.filter(s => s.status === 'final').map(s => s.year),
])].sort();

// 1) Raw archives and parsed matchups: byte-identical
const filesFor = (year) => {
    const names = new Set();
    for (const dir of ['archive', 'matchups']) {
        const d = path.join(DATA, dir);
        if (fs.existsSync(d)) for (const f of fs.readdirSync(d)) if (f.includes(String(year))) names.add(path.join(d, f));
        const listed = execFileSync('git', ['ls-tree', '--name-only', `${ref}`, `${d}/`], { encoding: 'utf8' }).split('\n');
        for (const f of listed) if (f && path.basename(f).includes(String(year))) names.add(f);
    }
    return [...names];
};

for (const year of locked) {
    for (const file of filesFor(year)) {
        const before = atRef(file), after = now(file);
        if (before === null && after !== null) problems.push(`${year}: ${file} was added`);
        else if (before !== null && after === null) problems.push(`${year}: ${file} was deleted`);
        else if (before !== after) problems.push(`${year}: ${file} changed`);
    }
}

// 2) Aggregated files: the locked seasons' entries must be deep-equal
for (const file of ['ffl_data.json', 'head_to_head.json']) {
    const before = JSON.parse(atRef(path.join(DATA, file)) ?? '{"seasons":{}}');
    const after = JSON.parse(now(path.join(DATA, file)) ?? '{"seasons":{}}');
    for (const year of locked) {
        const b = before.seasons?.[year], a = after.seasons?.[year];
        if (b === undefined && a === undefined) continue;
        if (!isDeepStrictEqual(b, a)) problems.push(`${year}: season entry in ${file} changed`);
    }
}

if (problems.length) {
    console.error(`Archive check FAILED against ${ref} — locked seasons were modified:`);
    for (const p of problems) console.error(`  - ${p}`);
    console.error('If this is a deliberate, reviewed fix, commit it on its own with a message explaining why.');
    process.exit(1);
}
console.log(`Archive check passed: ${locked.length} locked seasons (${locked[0]}–${locked[locked.length - 1]}) unchanged vs ${ref}.`);
