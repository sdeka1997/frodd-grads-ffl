"use client";

import AllStarCountdown from '@/components/AllStarCountdown';
import AllStarSchedule from '@/components/AllStarSchedule';
import { Star } from 'lucide-react';
import Link from 'next/link';

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

          {/* Mobile CTA */}
          <Link
            href="/dashboard"
            className="md:hidden inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-8 rounded-xl text-lg transition-colors"
          >
            Enter the Analytics Hub
          </Link>
        </div>

        {/* Right: schedule (desktop only) */}
        <div className="hidden md:block">
          <AllStarSchedule />
        </div>

      </div>
    </div>
  );
}
