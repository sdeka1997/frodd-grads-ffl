"use client";

import { useState, useEffect, useRef } from 'react';

export const schedule2026 = [
  {
    day: 'Friday',
    date: 'Apr 10',
    accent: 'border-l-yellow-400',
    headColor: 'text-yellow-400',
    events: [
      { time: '4PM',  text: 'Check-In',   sub: 'Airbnb',              star: false },
      { time: '6PM',  text: 'Happy Hour', sub: 'Williamsburg',        star: false },
      { time: '8PM',  text: 'Dinner',     sub: 'Brooklyn',            star: false },
      { time: '11PM', text: 'Pre-Game',   sub: 'Airbnb',              star: false },
      { time: '1AM',  text: 'CamelPhat',  sub: 'Brooklyn Storehouse', star: true  },
    ],
  },
  {
    day: 'Saturday',
    date: 'Apr 11',
    accent: 'border-l-blue-400',
    headColor: 'text-blue-400',
    events: [
      { time: '12PM', text: 'Football',       sub: 'Sternberg Park',  star: false },
      { time: '2PM',  text: 'Lunch',          sub: "L'Industrie",     star: false },
      { time: '3PM',  text: 'Sacko',          sub: 'Union Square',    star: true  },
      { time: '4PM',  text: 'Rooftop DJ Set', sub: 'The Italic',      star: false },
      { time: '7PM',  text: 'Dinner',         sub: 'Manhattan',       star: false },
      { time: '9PM',  text: 'Beer Olympics',  sub: 'Airbnb',          star: false },
    ],
  },
  {
    day: 'Sunday',
    date: 'Apr 12',
    accent: 'border-l-purple-400',
    headColor: 'text-purple-400',
    events: [
      { time: '11AM', text: 'Check-Out',      sub: 'Airbnb',        star: false },
      { time: '11AM', text: 'Basketball',     sub: 'Sternberg Park', star: false },
      { time: '1PM',  text: 'Farewell Lunch', sub: 'Brooklyn',      star: false },
    ],
  },
];

export function getCurrentEventKey(now: Date): string | null {
  if (now.getFullYear() !== 2026 || now.getMonth() !== 3) return null;
  const d = now.getDate();
  const h = now.getHours();
  if (d === 11 && h < 3) return 'Friday-1AM';
  const mins = h * 60 + now.getMinutes();
  const days: [number, string, [string, number][]][] = [
    [10, 'Friday',   [['4PM', 16*60], ['6PM', 18*60], ['8PM', 20*60], ['11PM', 23*60], ['1AM', 25*60]]],
    [11, 'Saturday', [['12PM', 12*60], ['2PM', 14*60], ['3PM', 15*60], ['4PM', 16*60], ['7PM', 19*60], ['9PM', 21*60]]],
    [12, 'Sunday',   [['11AM', 11*60], ['1PM', 13*60]]],
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

function ScheduleCard({ day, currentKey, cardBg }: {
  day: typeof schedule2026[0];
  currentKey: string | null;
  cardBg: string;
}) {
  return (
    <div className={`rounded-xl border border-l-4 ${cardBg} ${day.accent} p-5`}>
      <div className={`font-bold text-base ${day.headColor}`}>{day.day}</div>
      <div className="text-slate-500 text-xs mb-4">{day.date}</div>
      <div className="space-y-3">
        {day.events.map((ev, i) => {
          const evKey = `${day.day}-${ev.time}`;
          const isCurrent = currentKey === evKey;
          return (
            <div
              key={`${ev.time}-${i}`}
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
  );
}

function MobileScheduleDeck({ currentKey, cardBg }: { currentKey: string | null; cardBg: string }) {
  const [index, setIndex] = useState(0);
  const startX = useRef(0);
  const didDrag = useRef(false);
  const n = schedule2026.length;

  const go = (dir: 1 | -1) => setIndex(i => (i + dir + n) % n);

  return (
    <div className="md:hidden">
      <div
        className="relative select-none"
        style={{ touchAction: 'none' }}
        onPointerDown={e => { startX.current = e.clientX; didDrag.current = false; }}
        onPointerMove={e => { if (Math.abs(e.clientX - startX.current) > 8) didDrag.current = true; }}
        onPointerUp={e => {
          if (!didDrag.current) return;
          const dx = e.clientX - startX.current;
          if (dx < -40) go(1);
          else if (dx > 40) go(-1);
        }}
      >
        {/* Stack layers peeking behind */}
        <div className="absolute inset-x-4 top-3 bottom-0 rounded-xl bg-slate-800/25 border border-slate-700/30" />
        <div className="absolute inset-x-2 top-1.5 bottom-0 rounded-xl bg-slate-800/40 border border-slate-700/40" />
        {/* Front card */}
        <div className="relative">
          <ScheduleCard day={schedule2026[index]} currentKey={currentKey} cardBg={cardBg} />
        </div>
      </div>
      {/* Dots */}
      <div className="flex gap-1.5 justify-center mt-5">
        {schedule2026.map((d, i) => (
          <button
            key={d.day}
            onClick={() => setIndex(i)}
            className={`rounded-full transition-all duration-300 ${i === index ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-slate-600'}`}
          />
        ))}
      </div>
    </div>
  );
}

interface Props {
  cardBg?: string;
}

export default function AllStarSchedule({ cardBg = 'bg-slate-800/50 border-slate-700/60' }: Props) {
  const [currentKey, setCurrentKey] = useState<string | null>(null);

  useEffect(() => {
    setCurrentKey(getCurrentEventKey(new Date()));
  }, []);

  return (
    <>
      <MobileScheduleDeck currentKey={currentKey} cardBg={cardBg} />
      <div className="hidden md:grid md:grid-cols-3 gap-4">
        {schedule2026.map(day => (
          <ScheduleCard key={day.day} day={day} currentKey={currentKey} cardBg={cardBg} />
        ))}
      </div>
    </>
  );
}
