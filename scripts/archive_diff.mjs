// Prints which fields of the raw in-progress archive differ from a git ref (default HEAD),
// grouped by path. Used by the weekly refresh to log why a raw download changed.
//
//   node scripts/archive_diff.mjs [ref]

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { seasons } from './lib/seasons.mjs';

const ref = process.argv[2] || 'HEAD';

const walk = (a, b, p, out) => {
    if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b) || (a === null) !== (b === null)) return out.push(p);
    if (Array.isArray(a)) {
        if (a.length !== b.length) return out.push(`${p}[length ${a.length}→${b.length}]`);
        a.forEach((x, i) => walk(x, b[i], `${p}[]`, out));
    } else if (a && typeof a === 'object') {
        for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) walk(a[k], b[k], `${p}.${k}`, out);
    } else if (a !== b) out.push(p);
};

for (const s of seasons.filter(x => x.status === 'in_progress')) {
    const file = path.join('src', 'data', 'archive', `matchups_${s.platform}_${s.year}.json`);
    if (!fs.existsSync(file)) continue;
    let before;
    try {
        before = JSON.parse(execFileSync('git', ['show', `${ref}:${file}`], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }));
    } catch {
        console.log(`${file}: new file`);
        continue;
    }
    const changed = [];
    walk(before, JSON.parse(fs.readFileSync(file, 'utf8')), '', changed);
    if (!changed.length) { console.log(`${file}: unchanged`); continue; }
    const counts = changed.reduce((m, p) => m.set(p, (m.get(p) || 0) + 1), new Map());
    console.log(`${file}: ${changed.length} changed values`);
    for (const [p, n] of [...counts].sort((x, y) => y[1] - x[1]).slice(0, 25)) console.log(`  ${String(n).padStart(5)}  ${p}`);
}
