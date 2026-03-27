"use client";

import { useState, useEffect } from 'react';
import { Star, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function AllStarCountdown() {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // All-Star Weekend 2026: April 10-12 in New York, NY
  const allStarDate = new Date('2026-04-10T00:00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = allStarDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-800/30 rounded-xl p-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Star className="w-8 h-8 text-yellow-400" />
          <h2 className="text-3xl font-bold text-yellow-400">All-Star Weekend 2026</h2>
          <Star className="w-8 h-8 text-yellow-400" />
        </div>

        <div className="flex items-center justify-center gap-6 mb-6 text-slate-300">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            <span>New York, NY</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <span>April 10-12, 2026</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 max-w-md mx-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
            <div className="text-3xl font-bold text-yellow-400">{timeLeft.days}</div>
            <div className="text-sm text-slate-400 uppercase tracking-wide">Days</div>
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
            <div className="text-3xl font-bold text-yellow-400">{timeLeft.hours}</div>
            <div className="text-sm text-slate-400 uppercase tracking-wide">Hours</div>
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
            <div className="text-3xl font-bold text-yellow-400">{timeLeft.minutes}</div>
            <div className="text-sm text-slate-400 uppercase tracking-wide">Minutes</div>
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
            <div className="text-3xl font-bold text-yellow-400">{timeLeft.seconds}</div>
            <div className="text-sm text-slate-400 uppercase tracking-wide">Seconds</div>
          </div>
        </div>

        <Link
          href="/allstar"
          className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-6 rounded-lg transition-colors"
        >
          <Star className="w-5 h-5" />
          View All-Star Memories
        </Link>
      </div>
    </section>
  );
}