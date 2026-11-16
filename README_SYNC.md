# Data pipeline

The site is static: every page is built from JSON committed under `src/data/`.
Data only changes when the scripts below are run and the result is committed.

## Seasons and the archive lock

`src/data/seasons.json` lists every season with its platform, league ID and status:

- **`final`**: locked archive. No script will rewrite that season's files.
  Rerunning anything leaves them byte-for-byte unchanged, including manual
  corrections (for example the 2020 Sacko order).
- **`in_progress`**: the current season, refreshed from the platform.

When a season ends and its data has been checked, change its status to `final`.

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
