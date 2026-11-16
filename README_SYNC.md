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

The site shows the in-progress season's games (records, head-to-head, weekly highs and lows)
but holds finishes, titles and Sackos until it is final; per-game averages use the weeks
actually played. Pages get their list of seasons from `src/utils/seasons.ts`, which reads
`seasons.json`, so no page lists years by hand. (`INCLUDE_IN_PROGRESS` in
`scripts/sync.mjs` can keep the current season out of the site data entirely.)

## Ending a season

1. After the final week is scored, run `npm run data:all` once more and check the results.
2. Change the season's status to `final` in `seasons.json` and commit. From then on it is locked.
3. Add next season with its Sleeper league ID and `"status": "in_progress"`.
4. To include the finished season in the Median What-If pages, add its playoff format to
   `FORMATS` in `src/utils/medianScoring.ts` (that page only replays final seasons).

## Pipeline

```bash
npm run data:fetch      # 1. download raw platform data  -> src/data/archive/
npm run data:parse      # 2. normalize                   -> src/data/matchups/<year>_<platform>.json
npm run data:sync       # 3. aggregate                   -> src/data/ffl_data.json, head_to_head.json
npm run verify:archive  # 4. fail if any final season changed vs the last commit

npm run data:all        # all four in order
```

Always run `verify:archive` before committing data changes.

## Automatic weekly refresh

`.github/workflows/weekly-data-refresh.yml` runs every **Wednesday at 15:00 UTC**
(7–8am Pacific), after Monday night's games and Tuesday's stat corrections. It:

1. runs `npm run data:all`, which fails if a Sleeper fetch fails or a final season would change,
2. stops quietly if nothing changed (e.g. the off-season),
3. builds the site with the new data, so data that breaks the build is never committed,
4. commits only `src/data/` to `main` ("Weekly data refresh: 2026 through week N"), and Vercel redeploys.

To refresh now, open GitHub → Actions → *Weekly data refresh* → **Run workflow**.
Tick *Dry run* to see what would change without committing.

A failed run commits nothing and GitHub emails the repo owner. GitHub pauses scheduled
workflows after 60 days with no repository activity. If that happens over the
off-season, re-enable it from the Actions tab before the next season.

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
