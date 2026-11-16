import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import FlexScheduleGenerator from '@/components/FlexScheduleGenerator';
import FlexScriptHistory, { type FlexScript } from '@/components/FlexScriptHistory';

export const metadata: Metadata = {
  title: 'Frodd FFL | Flex Schedule',
  description: 'Draw the weeks 12–14 tiered flex schedule live from Sleeper standings.',
};

const SCRIPT_DIR = path.join(process.cwd(), 'scripts', 'flex');

type ScriptMeta = Omit<FlexScript, 'code' | 'highlights'> & {
  /** Highlight every line containing this text */
  marks: { match: string; note: string }[];
};

// Newest first. Summaries state only what was checked against the real schedules.
const SCRIPTS: ScriptMeta[] = [
  {
    year: '2026',
    filename: '2026_flex_schedule.py',
    title: 'Counted draw (same as this page)',
    status: 'current',
    summary:
      'Counts all 10,492,416 valid schedules and lets the seed pick one, so every schedule is equally likely and the same seed gives the same result everywhere. Tiers come from Sleeper, ranked by points for. Produces the identical schedule to the generator above for the same seed. Optional --check-z3 re-checks the draw against the old Z3 rules.',
    marks: [
      { match: 'index = math.floor(mulberry32_first', note: 'the seed picks the schedule number' },
    ],
  },
  {
    year: '2025',
    filename: '2025_flexmatchups_sat.py',
    title: 'Z3 solver, shuffle line missing',
    status: 'bug',
    summary:
      'Same rules as 2024, but the line that shuffled the tiers was removed, so nothing uses the seed. Every seed gives the same schedule, and that schedule matches the 2025 weeks 12–14 exactly. With the shuffle restored, seed 67 would have moved 3rd place from Nikhil to Ro K and Consolation Champ from Smeet to Nikhil.',
    marks: [
      { match: 'np.random.seed(67)', note: 'set, but nothing reads it — the shuffle line is gone' },
    ],
  },
  {
    year: '2024',
    filename: '2024_flexmatchups_sat.py',
    title: 'Z3 solver with seeded shuffle',
    status: 'verified',
    summary:
      'Shuffles each tier with the seed, then Z3 finds a schedule. Shown with its placeholder names (A–L) and seed. Run with the real tiers and seed 21, it reproduces the 2024 weeks 12–14 exactly.',
    marks: [
      { match: 'np.random.seed(13)', note: 'placeholder; the real 2024 run used 21' },
      { match: 'np.random.shuffle(tier1)', note: 'this is what makes the seed matter' },
    ],
  },
  {
    year: '2023',
    filename: '2023_flexmatchups.py',
    title: 'Original random pairing',
    status: 'unverified',
    summary:
      'Draws random pairings within and between tiers; a person then maps numbers to teams and arranges the games into weeks. There is no seed line, so it is random on every run unless one is added. The 2023 schedule follows the rules, but it could not be reproduced from seed 171 with this file.',
    marks: [
      { match: 'np.random.permutation(tier1_teams)', note: 'unseeded randomness' },
    ],
  },
];

function loadScripts(): FlexScript[] {
  return SCRIPTS.map(({ marks, ...meta }) => {
    const code = fs.readFileSync(path.join(SCRIPT_DIR, meta.filename), 'utf8');
    const highlights = code.split('\n').flatMap((line, i) =>
      marks.filter(m => line.includes(m.match)).map(m => ({ line: i + 1, note: m.note })),
    );
    return { ...meta, code, highlights };
  });
}

export default function FlexPage() {
  return (
    <div className="space-y-10">
      <FlexScheduleGenerator />
      <FlexScriptHistory scripts={loadScripts()} />
    </div>
  );
}
