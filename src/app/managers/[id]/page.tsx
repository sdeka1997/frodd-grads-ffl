import { getManagerStats, getManagerHistory, getShotgunStats, getHighRollerStats, getPlayoffClutchness } from '@/utils/dataProcessing';
import { getAllH2HManagers, getLifetimeH2H } from '@/utils/h2hProcessing';
import { notFound } from 'next/navigation';
import { Trophy, Activity, History, Swords, TrendingUp, TrendingDown, Grid3X3 } from 'lucide-react';
import Link from 'next/link';
import CenteredBar from '@/components/CenteredBar';
import ManagerStatBoxes from '@/components/ManagerStatBoxes';

export default async function ManagerProfile({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const decodedId = decodeURIComponent(resolvedParams.id);
  const stats = getManagerStats(decodedId);

  if (!stats) {
    notFound();
  }

  const history = getManagerHistory(decodedId);
  const allManagers = getAllH2HManagers();
  const totalGames = stats.wins + stats.losses;
  const winPct = totalGames > 0 ? ((stats.wins / totalGames) * 100).toFixed(1) : "0.0";

  const shotgunData = getShotgunStats().find(s => s.manager === decodedId);
  const highRollerData = getHighRollerStats().find(s => s.manager === decodedId);
  const clutchnessData = getPlayoffClutchness().find(m => m.name === decodedId);

  // Calculate Rivals
  const rivalryStats = allManagers
    .filter(m => m !== decodedId)
    .map(opponent => ({
      name: opponent,
      ...getLifetimeH2H(decodedId, opponent)
    }))
    .filter(r => r.total.wins + r.total.losses > 0);

  const sons = [...rivalryStats]
    .sort((a, b) => (b.total.wins - b.total.losses) - (a.total.wins - a.total.losses))
    .slice(0, 3)
    .filter(r => r.total.wins > r.total.losses);

  const kryptonites = [...rivalryStats]
    .sort((a, b) => (b.total.losses - b.total.wins) - (a.total.losses - a.total.wins))
    .slice(0, 3)
    .filter(r => r.total.losses > r.total.wins);

  return (
    <div className="space-y-12">
      <Link href="/managers" className="text-emerald-400 hover:underline mb-4 inline-block">&larr; Back to Managers</Link>

      <header className="border-b border-slate-800 pb-8">
        <h1 className="text-5xl font-extrabold flex items-center gap-4">
          {stats.manager}
          {stats.championships > 0 && (
            <span className="flex items-center text-yellow-400 text-2xl">
              {Array.from({ length: stats.championships }).map((_, i) => (
                <Trophy key={i} className="w-8 h-8 ml-1" />
              ))}
            </span>
          )}
        </h1>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 md:order-1">
            <div className="text-slate-400 text-sm">Overall Record</div>
            <div className="text-2xl font-bold text-emerald-400">{stats.wins} - {stats.losses}</div>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 md:order-2">
            <div className="text-slate-400 text-sm">Win Percentage</div>
            <div className="text-2xl font-bold">{winPct}%</div>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 md:order-4">
            <div className="text-slate-400 text-sm">Playoff Record</div>
            <div className="text-2xl font-bold">{stats.playoff_record}</div>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 md:order-3">
            <div className="text-slate-400 text-sm">Championships</div>
            <div className={`text-2xl font-bold ${stats.championships > 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>{stats.championships}</div>
          </div>
          <ManagerStatBoxes
            manager={decodedId}
            shotgunCount={shotgunData?.totalShotguns ?? 0}
            highRollerCount={highRollerData?.totalWins ?? 0}
          />
        </div>
      </header>

      {/* RIVALRIES SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400 uppercase tracking-wider">
              <TrendingUp className="w-5 h-5" /> Punching Bags
            </h2>
            <Link href="/matrix" className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1">
              <Grid3X3 className="w-3 h-3" /> Matrix
            </Link>
          </div>
          <div className="space-y-4">
            {sons.length > 0 ? sons.map(rival => (
              <Link key={rival.name} href={`/rivalries?m1=${encodeURIComponent(decodedId)}&m2=${encodeURIComponent(rival.name)}`} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                <span className="font-bold text-lg">{rival.name}</span>
                <span className="text-emerald-400 font-black text-xl">{rival.total.wins} - {rival.total.losses}</span>
              </Link>
            )) : <p className="text-slate-500 italic">No dominant records yet.</p>}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-red-400 uppercase tracking-wider">
              <TrendingDown className="w-5 h-5" /> Kryptonite
            </h2>
            <Link href="/matrix" className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1">
              <Grid3X3 className="w-3 h-3" /> Matrix
            </Link>
          </div>
          <div className="space-y-4">
            {kryptonites.length > 0 ? kryptonites.map(rival => (
              <Link key={rival.name} href={`/rivalries?m1=${encodeURIComponent(decodedId)}&m2=${encodeURIComponent(rival.name)}`} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                <span className="font-bold text-lg">{rival.name}</span>
                <span className="text-red-400 font-black text-xl">{rival.total.wins} - {rival.total.losses}</span>
              </Link>
            )) : <p className="text-slate-500 italic">No significant losing records.</p>}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8 border-t border-slate-800">
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Activity className="text-purple-400" /> Scoring Metrics
            </h2>
            <Link href="/luck" className="block group">
              <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 space-y-8 group-hover:border-slate-700 transition-colors">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-400 font-medium">Points For vs Average</span>
                    <span className={`font-bold text-lg ${stats.pf_vs_avg > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stats.pf_vs_avg > 0 ? '+' : ''}{stats.pf_vs_avg}
                    </span>
                  </div>
                  <CenteredBar value={stats.pf_vs_avg} isGoodWhenPositive={true} />
                </div>
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-400 font-medium">Points Against vs Average</span>
                    <span className={`font-bold text-lg ${stats.pa_vs_avg < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stats.pa_vs_avg > 0 ? '+' : ''}{stats.pa_vs_avg}
                    </span>
                  </div>
                  <CenteredBar value={stats.pa_vs_avg} isGoodWhenPositive={false} />
                </div>
              </div>
            </Link>
          </section>

          {clutchnessData && (
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Swords className="text-yellow-400" /> High-Stakes Clutchness
              </h2>
              <Link href="/clutchness" className="block group">
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 group-hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-slate-400 text-sm mb-1">Regular Season PPG</div>
                      <div className="text-xl font-bold text-white">{clutchnessData.regularPPG}</div>
                    </div>
                    <div className="text-slate-600 text-2xl font-bold">→</div>
                    <div className="text-right">
                      <div className="text-slate-400 text-sm mb-1">High-Stakes PPG</div>
                      <div className="text-xl font-bold text-white">{clutchnessData.playoffPPG}</div>
                    </div>
                    <div className={`text-right ml-4 pl-4 border-l border-slate-700`}>
                      <div className="text-slate-400 text-sm mb-1">Differential</div>
                      <div className={`text-2xl font-bold ${clutchnessData.differential > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {clutchnessData.differential > 0 ? '+' : ''}{clutchnessData.differential}
                      </div>
                    </div>
                  </div>
                  <CenteredBar value={clutchnessData.differential} isGoodWhenPositive={true} />
                </div>
              </Link>
            </section>
          )}
        </div>

        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <History className="text-blue-400" /> Team History
          </h2>
          <div className="space-y-4">
            {history.reverse().map((h) => (
              <Link key={h.year} href={`/seasons?year=${h.year}&owner=${encodeURIComponent(decodedId)}`} className="bg-slate-900 p-4 rounded-lg border border-slate-800 flex justify-between items-center hover:border-slate-700 transition-colors">
                <div>
                  <span className="text-emerald-400 font-bold mr-3">{h.year}</span>
                  <span className="font-medium text-lg">{h.team.team}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{h.team.playoff_finish || 'Missed Playoffs'}</div>
                  <div className="text-xs text-slate-400">
                    {`${h.team.regular_season.wins}-${h.team.regular_season.losses}`}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
