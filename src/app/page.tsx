"use client";

import AllStarCountdown from '@/components/AllStarCountdown';
import AllStarSchedule from '@/components/AllStarSchedule';
import { Calendar, Star } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center py-12 space-y-12">

      {/* Hero */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          The <span className="text-emerald-400">Frodd Grads</span> Hub
        </h1>
        <p className="text-slate-400 text-lg">All-Star Weekend 2026 is coming.</p>
      </div>

      {/* Countdown */}
      <div className="w-full max-w-2xl">
        <AllStarCountdown />
      </div>

      {/* Schedule */}
      <div className="w-full max-w-3xl">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-yellow-400" />
          Weekend Schedule
        </h2>
        <AllStarSchedule cardBg="bg-slate-900 border-slate-800" />
      </div>

      {/* Enter Site */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-8 rounded-xl text-lg transition-colors"
      >
        <Star className="w-5 h-5" />
        Enter Site
      </Link>

    </div>
  );
}
