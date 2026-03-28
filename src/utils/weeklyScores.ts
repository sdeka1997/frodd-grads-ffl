export function getWeekScores(
  year: string,
  week: number
): { manager: string; points: number }[] {
  try {
    const matchupData = require(`../data/matchups/${year}_${year === '2025' ? 'sleeper' : 'espn'}.json`);
    const scores: { manager: string; points: number }[] = [];
    matchupData.matchups?.forEach((m: any) => {
      if (m.period === week && !m.isPlayoff) {
        if (m.home) scores.push({ manager: m.home.manager, points: m.home.points });
        if (m.away) scores.push({ manager: m.away.manager, points: m.away.points });
      }
    });
    return scores;
  } catch {
    return [];
  }
}
