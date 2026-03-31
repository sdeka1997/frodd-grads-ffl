"use client";

import { useState, useEffect } from 'react';
import AllStarCountdown from '@/components/AllStarCountdown';
import { Calendar, Star } from 'lucide-react';
import Link from 'next/link';

const schedule2026 = [
  {
    day: 'Friday',
    date: 'Apr 10',
    accent: 'border-l-yellow-400',
    headColor: 'text-yellow-400',
    events: [
      { time: '4PM',  text: 'Check-In',       sub: 'Airbnb',               star: false },
      { time: '6PM',  text: 'Happy Hour',      sub: 'Westlight',            star: false },
      { time: '8PM',  text: 'Dinner',          sub: 'Brooklyn',             star: false },
      { time: '11PM', text: 'Pre-Game',        sub: 'Airbnb',               star: false },
      { time: '1AM',  text: 'CamelPhat',       sub: 'Brooklyn Storehouse',  star: true  },
    ],
  },
  {
    day: 'Saturday',
    date: 'Apr 11',
    accent: 'border-l-blue-400',
    headColor: 'text-blue-400',
    events: [
      { time: '12PM', text: 'Football',                      sub: 'Sternberg Park',       star: false },
      { time: '2PM',  text: 'Sacko',                         sub: 'Union Square Station', star: true  },
      { time: '4PM',  text: 'Rooftop DJ Set',                sub: 'The Italic',           star: false },
      { time: '7PM',  text: 'Dinner',                        sub: 'Manhattan',            star: false },
      { time: '9PM',  text: 'Beer Olympics',                   sub: 'Airbnb',            star: false },
    ],
  },
  {
    day: 'Sunday',
    date: 'Apr 12',
    accent: 'border-l-purple-400',
    headColor: 'text-purple-400',
    events: [
      { time: '11AM',  text: 'Check-Out',      sub: 'Airbnb',        star: false },
      { time: '11:30', text: 'Basketball',    sub: 'Sternberg Park', star: false },
      { time: '1PM',   text: 'Farewell Lunch', sub: 'Brooklyn',     star: false },
    ],
  },
];

function getCurrentEventKey(now: Date): string | null {
  if (now.getFullYear() !== 2026 || now.getMonth() !== 3) return null; // April = month 3
  const d = now.getDate();
  const h = now.getHours();
  // 1AM Saturday is still Friday night's CamelPhat
  if (d === 11 && h < 3) return 'Friday-1AM';
  const mins = h * 60 + now.getMinutes();
  const days: [number, string, [string, number][]][] = [
    [10, 'Friday',   [['4PM', 16*60], ['6PM', 18*60], ['8PM', 20*60], ['11PM', 23*60], ['1AM', 25*60]]],
    [11, 'Saturday', [['12PM', 12*60], ['2PM', 14*60], ['4PM', 16*60], ['7PM', 19*60], ['9PM', 21*60]]],
    [12, 'Sunday',   [['11AM', 11*60], ['11:30', 11*60+30], ['1PM', 13*60]]],
  ];
  const entry = days.find(([date]) => date === d);
  if (!entry) return null;
  const [, dayName, events] = entry;
  let key: string | null = null;
  for (const [time, startMin] of events) {
    if (mins >= startMin) key = `${dayName}-${time}`;
  }
  return key;
}

export default function LandingPage() {
  const [currentKey, setCurrentKey] = useState<string | null>(null);

  useEffect(() => {
    setCurrentKey(getCurrentEventKey(new Date()));
  }, []);

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
        <div className="grid md:grid-cols-3 gap-4">
          {schedule2026.map(day => (
            <div key={day.day} className={`rounded-xl bg-slate-900 border border-slate-800 border-l-4 ${day.accent} p-5`}>
              <div className={`font-bold text-base ${day.headColor}`}>{day.day}</div>
              <div className="text-slate-500 text-xs mb-4">{day.date}</div>
              <div className="space-y-3">
                {day.events.map(ev => {
                  const key = `${day.day}-${ev.time}`;
                  const isCurrent = currentKey === key;
                  return (
                    <div
                      key={ev.time}
                      className={`flex gap-3 items-start rounded-lg ${isCurrent ? 'bg-white/5 px-2 py-1.5 -mx-2' : ''}`}
                    >
                      <span className="font-mono text-xs text-slate-500 w-10 shrink-0 pt-0.5">{ev.time}</span>
                      <div>
                        <div className={`text-sm font-medium leading-snug ${ev.star ? 'text-yellow-300' : 'text-slate-200'}`}>{ev.text}</div>
                        {ev.sub && <div className="text-xs text-slate-500 mt-0.5">{ev.sub}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
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
