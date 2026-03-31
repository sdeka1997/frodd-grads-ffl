"use client";

import { useState, useEffect } from 'react';
import AllStarCountdown from '@/components/AllStarCountdown';
import { schedule2026, getCurrentEventKey } from '@/components/AllStarSchedule';
import { Star } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [currentKey, setCurrentKey] = useState<string | null>(null);

  useEffect(() => {
    setCurrentKey(getCurrentEventKey(new Date()));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 pb-48">

      {/* Hero */}
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
        The <span className="text-emerald-400">Frodd Grads</span> Hub
      </h1>
      <p className="text-slate-400 text-lg mb-10">All-Star Weekend 2026 is coming.</p>

      {/* Countdown */}
      <div className="w-full max-w-2xl mb-10">
        <AllStarCountdown />
      </div>

      {/* CTA */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-8 rounded-xl text-lg transition-colors"
      >
        <Star className="w-5 h-5" />
        Enter Site
      </Link>

      {/* Schedule strip */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-sm border-t border-slate-800">
        <div className="grid grid-cols-3 divide-x divide-slate-800 max-w-4xl mx-auto">
          {schedule2026.map(day => (
            <div key={day.day} className="px-3 md:px-5 py-3">
              <div className={`text-xs font-bold mb-2 ${day.headColor}`}>
                {day.day}
                <span className="text-slate-600 font-normal ml-1.5">{day.date}</span>
              </div>
              <div className="space-y-1">
                {day.events.map((ev, i) => {
                  const evKey = `${day.day}-${ev.time}`;
                  const isCurrent = currentKey === evKey;
                  return (
                    <div
                      key={`${ev.time}-${i}`}
                      className={`flex items-baseline gap-1.5 rounded px-1 -mx-1 ${isCurrent ? 'bg-white/5' : ''}`}
                    >
                      <span className="font-mono text-[10px] text-slate-500 shrink-0 w-8">{ev.time}</span>
                      <span className={`text-xs truncate ${ev.star ? 'text-yellow-300' : isCurrent ? 'text-white' : 'text-slate-300'}`}>
                        {ev.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
