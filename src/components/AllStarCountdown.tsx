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
  } | null>(null);
  const [eventPassed, setEventPassed] = useState(false);

  // All-Star Weekend 2026: April 10-12 in New York, NY
  const allStarDate = new Date('2026-04-10T16:00:00');

  const calculate = () => {
    const distance = allStarDate.getTime() - new Date().getTime();
    if (distance <= 0) return null;
    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
    };
  };

  useEffect(() => {
    const result = calculate();
    if (result === null) { setEventPassed(true); return; }
    setTimeLeft(result);
    const timer = setInterval(() => {
      const r = calculate();
      if (r === null) setEventPassed(true);
      else setTimeLeft(r);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (eventPassed) return null;

  return (
    <section className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-800/30 rounded-xl p-4 sm:p-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Star className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-400" />
          <h2 className="text-xl sm:text-3xl font-bold text-yellow-400">All-Star Weekend 2026</h2>
          <Star className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-400" />
        </div>

        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4 sm:mb-6 text-slate-300 text-sm sm:text-base">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            <span>New York, NY</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            <span>April 10-12, 2026</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6 sm:max-w-md sm:mx-auto">
          {(['days', 'hours', 'minutes', 'seconds'] as const).map((unit) => (
            <div key={unit} className="bg-slate-900 border border-slate-700 rounded-lg p-2 sm:p-4">
              <div className="text-xl sm:text-3xl font-bold text-yellow-400">
                {timeLeft ? timeLeft[unit] : '—'}
              </div>
              <div className="text-xs sm:text-sm text-slate-400 uppercase tracking-wide">
                {unit === 'minutes' ? 'Mins' : unit === 'seconds' ? 'Secs' : unit.charAt(0).toUpperCase() + unit.slice(1)}
              </div>
            </div>
          ))}
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