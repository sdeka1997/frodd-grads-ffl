import AllStarCountdown from '@/components/AllStarCountdown';
import AllStarSchedule from '@/components/AllStarSchedule';
import HallOfFameStack from '@/components/HallOfFameStack';
import { getCumulativeRecords } from '@/utils/dataProcessing';
import { Star, Users, CalendarDays, Swords, Dices, Zap, LayoutGrid, TrendingUp, Trophy } from 'lucide-react';
import Link from 'next/link';

const ALL_STAR_END = new Date('2026-04-13T00:00:00');

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

export default function LandingPage() {
  const allStarPassed = new Date() > ALL_STAR_END;

  let hallOfFame: { manager: string; championships: number; wins: number; losses: number }[] = [];
  let maxChamps = 0;
  if (allStarPassed) {
    const records = getCumulativeRecords();
    hallOfFame = records
      .filter(r => r.championships > 0)
      .sort((a, b) => b.championships - a.championships);
    maxChamps = Math.max(...hallOfFame.map(r => r.championships));
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 md:gap-16 items-center">

        {/* Left: hero + main content + CTAs */}
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              The <span className="text-emerald-400">Frodd Grads</span> Hub
            </h1>
            <p className="text-slate-400 text-lg">
              {allStarPassed ? 'The complete digital home for the Frodd Grads.' : 'All-Star Weekend 2026 is coming.'}
            </p>
          </div>

          {/* Before All-Star: countdown. After: Hall of Fame on mobile */}
          {allStarPassed
            ? <div className="md:hidden"><HallOfFameStack managers={hallOfFame} maxChamps={maxChamps} /></div>
            : <AllStarCountdown />
          }

          {/* Desktop CTA */}
          <Link
            href="/dashboard"
            className="self-start hidden md:inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-8 rounded-xl text-lg transition-colors"
          >
            <Star className="w-5 h-5" />
            Enter Site
          </Link>

          {/* Mobile nav grid */}
          <div className="md:hidden grid grid-cols-2 gap-2">
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

        {/* Right: schedule on desktop before All-Star only */}
        {!allStarPassed && (
          <div className="hidden md:block">
            <AllStarSchedule />
          </div>
        )}

      </div>
    </div>
  );
}
