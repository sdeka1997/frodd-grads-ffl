"use client";

import AllStarCountdown from '@/components/AllStarCountdown';
import AllStarSchedule from '@/components/AllStarSchedule';
import { Star, Users, CalendarDays, Swords, Dices, Zap, LayoutGrid, TrendingUp, Trophy } from 'lucide-react';
import Link from 'next/link';

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
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 md:gap-16 items-center">

        {/* Left: hero + countdown + CTA */}
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              The <span className="text-emerald-400">Frodd Grads</span> Hub
            </h1>
            <p className="text-slate-400 text-lg">All-Star Weekend 2026 is coming.</p>
          </div>

          <AllStarCountdown />

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

        {/* Right: schedule (desktop only) */}
        <div className="hidden md:block">
          <AllStarSchedule />
        </div>

      </div>
    </div>
  );
}
