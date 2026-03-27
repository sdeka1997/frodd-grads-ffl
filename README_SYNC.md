# Brown Frodd Grads FFL Dashboard

This dashboard is powered by data fetched from ESPN and Sleeper APIs.

## Data Syncing

To update the league data, run the following command:

```bash
node scripts/sync.mjs
```

This will:
1. Fetch 2019-2024 data from ESPN.
2. Fetch 2025 data from Sleeper.
3. Aggregate cumulative records and luck indices.
4. Update `src/data/ffl_data.json`.

### Historical Data (Pre-2023)

Currently, ESPN restricts public access to historical seasons (2019-2022). To sync these years, you may need to provide your `swid` and `espn_s2` cookies in `scripts/sync.mjs`.

To find these:
1. Log in to `fantasy.espn.com` in your browser.
2. Open Developer Tools (F12) -> Application -> Cookies.
3. Find `swid` and `espn_s2`.

## Development

Run the development server:

```bash
npm install
npm run dev
```
