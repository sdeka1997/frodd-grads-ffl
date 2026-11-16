// Shared season registry for the data scripts (source: src/data/seasons.json).
//
// Archive rule: a season with status "final" is locked. Scripts must not rewrite
// any of its files. A deliberate, reviewed correction can be made by running a
// script with ALLOW_ARCHIVE_EDIT=1, and `npm run verify:archive` will then show
// exactly what changed against the last commit.

import fs from 'fs';
import path from 'path';

const REGISTRY_PATH = path.join('src', 'data', 'seasons.json');

export const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
export const seasons = registry.seasons;

export const getSeason = (year) => seasons.find(s => s.year === Number(year));
export const isFinal = (year) => getSeason(year)?.status === 'final';
export const finalYears = () => seasons.filter(s => s.status === 'final').map(s => s.year);

export const archiveEditAllowed = () => process.env.ALLOW_ARCHIVE_EDIT === '1';

/** Throws if `year` is a locked season and no explicit override is set. */
export function assertWritable(year, what) {
    if (isFinal(year) && !archiveEditAllowed()) {
        throw new Error(
            `${year} is a final (locked) season — refusing to modify ${what}. ` +
            `If this is a deliberate fix, rerun with ALLOW_ARCHIVE_EDIT=1 and review the diff with npm run verify:archive.`,
        );
    }
}
