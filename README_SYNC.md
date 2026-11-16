# Data pipeline

The site is static: every page is built from JSON committed under `src/data/`.
Data only changes when the scripts below are run and the result is committed.

## Seasons and the archive lock

`src/data/seasons.json` lists every season with its platform, league ID and status:

- **`final`**: locked archive. No script will rewrite that season's files.
  Rerunning anything leaves them byte-for-byte unchanged, including manual
  corrections (for example the 2020 Sacko order).
- **`in_progress`**: the current season, refreshed from the platform.

## The in-progress season

Every run re-downloads the in-progress season, but only weeks Sleeper has finished scoring
(`last_scored_leg`). A week being played, or not yet played, never reaches the data. Season
length and playoff size come from the league settings, and the parsed file records
`status: "in_progress"` and `lastScoredWeek`. Rerunning with no new results changes nothing.

For now the in-progress season is written to `archive/` and `matchups/` but kept out of
`ffl_data.json` / `head_to_head.json` (`INCLUDE_IN_PROGRESS` in `scripts/sync.mjs`) until the
pages can show a partial season.

## Ending a season

1. After the final week is scored, run `npm run data:all` once more and check the results.
2. Change the season's status to `final` in `seasons.json` and commit. From then on it is locked.
3. Add next season with its Sleeper league ID and `"status": "in_progress"`.

## Pipeline

```bash
npm run data:fetch      # 1. download raw platform data  -> src/data/archive/
npm run data:parse      # 2. normalize                   -> src/data/matchups/<year>_<platform>.json
npm run data:sync       # 3. aggregate                   -> src/data/ffl_data.json, head_to_head.json
npm run verify:archive  # 4. fail if any final season changed vs the last commit

npm run data:all        # all four in order
```

Always run `verify:archive` before committing data changes.

## Deliberate corrections to a final season

Locked seasons can still be fixed on purpose:

1. Edit the data, or run a script with `ALLOW_ARCHIVE_EDIT=1`.
2. `npm run verify:archive` lists exactly what changed. Review it.
3. Commit the fix on its own, with a message explaining why.

## Historical notes

- The league moved from ESPN to Sleeper in 2025; all ESPN seasons (2019–2024) are archived.
  Re-downloading one would need ESPN login cookies passed as `ESPN_SWID` and `ESPN_S2`
  environment variables. Never commit them.
- `scripts/apply_<year>_labels.mjs` were one-off backfills of playoff labels for ESPN years;
  they now refuse to run against locked seasons.
