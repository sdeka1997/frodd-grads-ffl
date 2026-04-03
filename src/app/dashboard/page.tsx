import { getCumulativeRecords } from '@/utils/dataProcessing';
import { Trophy, Target, Users, CalendarDays, Swords, Dices, Zap, LayoutGrid, TrendingUp } from 'lucide-react';
import CumulativeTable from '@/components/CumulativeTable';
import { Medal } from 'lucide-react';
import Link from 'next/link';
import HallOfFameStack from '@/components/HallOfFameStack';

const NAV_CARDS = [
  { href: '/managers',   icon: Users,        label: 'Managers',         sub: 'Career stats & profiles' },
  { href: '/seasons',    icon: CalendarDays, label: 'Seasons',          sub: 'Year-by-year breakdowns' },
  { href: '/rivalries',  icon: Swords,       label: 'Rivalries',        sub: 'Head-to-head records' },
  { href: '/luck',       icon: Dices,        label: 'Luck Index',       sub: 'Who got lucky' },
  { href: '/clutchness', icon: Zap,          label: 'Clutchness',       sub: 'Playoff performance' },
  { href: '/matrix',     icon: LayoutGrid,   label: 'Supremacy Matrix', sub: 'Who owns who' },
  { href: '/shotgun',    icon: TrendingUp,   label: 'Shotgun',          sub: 'High score records' },
  { href: '/highroller', icon: Trophy,       label: 'High Roller',      sub: 'Earnings leaderboard' },
];

export default function Home() {
  const records = getCumulativeRecords();
  const hallOfFame = records.filter(r => r.championships > 0).sort((a, b) => b.championships - a.championships);
  const maxChamps = Math.max(...records.map(r => r.championships));

  return (
    <>
      {/* ── Mobile layout ── */}
      <div className="md:hidden flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            The <span className="text-emerald-400">Frodd Grads</span> Hub
          </h1>
          <p className="text-slate-400 text-lg">
            The complete digital home for the Frodd Grads.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Trophy className="text-yellow-400 w-5 h-5" /> Hall of Fame
          </h2>
          <HallOfFameStack managers={hallOfFame} maxChamps={maxChamps} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {NAV_CARDS.map(({ href, icon: Icon, label, sub }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col gap-1 bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 hover:border-emerald-500/50 hover:bg-slate-800 transition-colors"
            >
              <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-sm font-semibold text-slate-100 leading-tight">{label}</span>
              <span className="text-xs text-slate-500 leading-tight">{sub}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Desktop layout (unchanged) ── */}
      <div className="hidden md:block space-y-12">
        <header className="text-center space-y-4 pt-12">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            The <span className="text-emerald-400">Frodd Grads</span> Hub
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400">
            The complete digital home for the Frodd Grads <span className="whitespace-nowrap">(2019-2025)</span>. League history, analytics, memories, and more.
          </p>
        </header>

        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Trophy className="text-yellow-400 w-8 h-8" /> Hall of Fame
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hallOfFame.map((manager) => (
              <Link key={manager.manager} href={`/managers/${manager.manager}`} className="block group">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-emerald-500/50 transition-colors h-full">
                  <div className="absolute top-0 right-0 p-4">
                    <Medal className={`w-6 h-6 ${
                      manager.championships === maxChamps ? 'text-yellow-400' :
                      manager.championships === maxChamps - 1 ? 'text-slate-300' :
                      'text-amber-600'
                    }`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">{manager.manager}</h3>
                  <div className="text-4xl font-black text-emerald-400 mb-2">{manager.championships} <span className="text-sm text-slate-500 font-normal">Rings</span></div>
                  <p className="text-slate-400 text-sm">{manager.wins}-{manager.losses} Overall Record</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Target className="text-blue-400 w-8 h-8" /> Decade Leaderboard
          </h2>
          <CumulativeTable initialRecords={records} />
        </section>
      </div>
    </>
  );
}
