"use client";

import { useState, useEffect, useRef } from 'react';

export const schedule2026 = [
  {
    day: 'Friday',
    date: 'Apr 10',
    accent: 'border-l-yellow-400',
    headColor: 'text-yellow-400',
    events: [
      { time: '4PM',  end: undefined, text: 'Check-In',   sub: 'Airbnb',              star: false },
      { time: '5PM',  end: '7PM',     text: 'Happy Hour', sub: "Marcela's",            star: false },
      { time: '9PM',  end: '1AM',     text: 'Pre-Game',   sub: 'Airbnb',              star: false },
      { time: '1AM',  end: '3AM',     text: 'CamelPhat',  sub: 'Brooklyn Storehouse', star: true  },
    ],
  },
  {
    day: 'Saturday',
    date: 'Apr 11',
    accent: 'border-l-blue-400',
    headColor: 'text-blue-400',
    events: [
      { time: '11AM', end: '1PM',     text: 'Football',       sub: 'Sternberg Park',       star: false },
      { time: '2PM',  end: undefined, text: 'Sacko',          sub: 'Union Square',         star: true  },
      { time: '5PM',  end: '7PM',    text: 'Basketball',     sub: 'The Post BK (Dobbin)', star: false },
      { time: '9PM',  end: '11PM',   text: 'Reunion Dinner', sub: 'Antidote',             star: false },
      { time: '11PM', end: '1AM',    text: 'Beer Olympics',  sub: 'Airbnb',               star: false },
    ],
  },
  {
    day: 'Sunday',
    date: 'Apr 12',
    accent: 'border-l-purple-400',
    headColor: 'text-purple-400',
    events: [
      { time: '11AM', end: undefined, text: 'Check-Out',      sub: 'Airbnb',  star: false },
      { time: '12PM', end: undefined, text: 'Farewell Brunch', sub: 'TBD',     star: false },
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
    [10, 'Friday',   [['4PM', 16*60], ['5PM', 17*60], ['9PM', 21*60], ['1AM', 25*60]]],
    [11, 'Saturday', [['11AM', 11*60], ['2PM', 14*60], ['5PM', 17*60], ['9PM', 21*60], ['11PM', 23*60]]],
    [12, 'Sunday',   [['11AM', 11*60], ['12PM', 12*60]]],
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

function EventTimeline({ day, currentKey }: { day: typeof schedule2026[0]; currentKey: string | null }) {
  return (
    <div>
      {day.events.map((ev, i) => {
        const isLast = i === day.events.length - 1;
        const evKey = `${day.day}-${ev.time}`;
        const isCurrent = currentKey === evKey;
        const dotColor = isCurrent ? 'bg-white ring-2 ring-white/30' : ev.star ? 'bg-yellow-300' : 'bg-slate-600';

        const isRange = !!ev.end;

        return (
          <div key={`${ev.time}-${i}`} className="flex gap-3">
            {/* Timeline spine */}
            <div className="flex flex-col items-center w-3 shrink-0">
              {isRange
                ? <div className={`w-1.5 rounded-full shrink-0 mt-1 ${isCurrent ? 'bg-white' : ev.star ? 'bg-yellow-300' : 'bg-slate-500'}`} style={{ height: '2.25rem' }} />
                : <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${dotColor}`} />
              }
              {!isLast && <div className="w-px flex-1 min-h-[1rem] bg-slate-700 mt-1" />}
            </div>
            {/* Content */}
            <div className={`${isLast ? 'pb-0' : 'pb-4'} min-w-0`}>
              <div className="font-mono text-[10px] text-slate-500 leading-none mb-0.5">
                {ev.time}{ev.end ? ` – ${ev.end}` : ''}
              </div>
              <div className={`text-sm font-medium leading-snug ${ev.star ? 'text-yellow-300' : isCurrent ? 'text-white' : 'text-slate-200'}`}>
                {ev.text}
              </div>
              {ev.sub && <div className="text-xs text-slate-500 mt-0.5">{ev.sub}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ScheduleCard({ day, currentKey, cardBg, className = '' }: {
  day: typeof schedule2026[0];
  currentKey: string | null;
  cardBg: string;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-l-4 ${cardBg} ${day.accent} p-5 ${className}`}>
      <div className={`font-bold text-base ${day.headColor}`}>{day.day}</div>
      <div className="text-slate-500 text-xs mb-4">{day.date}</div>
      <EventTimeline day={day} currentKey={currentKey} />
    </div>
  );
}

const STACK_STYLE = [
  { rotate:  1, x:  0, y: 0 },
  { rotate: -5, x:  5, y: 5 },
  { rotate:  3, x: -3, y: 9 },
];
const SWIPE_THRESHOLD = 75;
const FLY_DISTANCE = 600;

function MobileScheduleDeck({ currentKey }: { currentKey: string | null }) {
  const n = schedule2026.length;
  const [topIndex, setTopIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dismissDir, setDismissDir] = useState<'left' | 'right' | null>(null);
  const [deckHeight, setDeckHeight] = useState<number | null>(null);
  const measureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const startXRef = useRef(0);

  useEffect(() => {
    const heights = measureRefs.current.map(el => el?.offsetHeight ?? 0);
    const max = Math.max(...heights);
    if (max > 0) setDeckHeight(max + 18); // 18px accounts for stack offset
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dismissDir) return;
    startXRef.current = e.clientX;
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || dismissDir) return;
    setDragX(e.clientX - startXRef.current);
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      const dir = dragX < 0 ? 'left' : 'right';
      setDismissDir(dir);
      setTimeout(() => {
        setTopIndex(i => dir === 'left' ? (i + 1) % n : (i - 1 + n) % n);
        setDragX(0);
        setDismissDir(null);
      }, 280);
    } else {
      setDragX(0);
    }
  };

  const visibleDays = Array.from({ length: Math.min(3, n) }, (_, i) =>
    schedule2026[(topIndex + i) % n]
  );

  return (
    <div className="md:hidden flex flex-col items-center gap-5">
      {/* Hidden measurement renders */}
      <div className="absolute invisible pointer-events-none w-full" aria-hidden>
        {schedule2026.map((day, i) => (
          <div key={day.day} ref={el => { measureRefs.current[i] = el; }} className="bg-slate-900 border border-slate-800 border-l-4 rounded-xl p-5">
            <div className="font-bold text-base">{day.day}</div>
            <div className="text-xs mb-4">{day.date}</div>
            <EventTimeline day={day} currentKey={null} />
          </div>
        ))}
      </div>
      <div className="relative w-full" style={{ height: deckHeight ? `${deckHeight}px` : '460px' }}>
        {[...visibleDays].reverse().map((day, reversedPos) => {
          const stackPos = visibleDays.length - 1 - reversedPos;
          const isTop = stackPos === 0;
          const s = STACK_STYLE[stackPos] ?? STACK_STYLE[STACK_STYLE.length - 1];

          let translateX = s.x;
          let rotate = s.rotate;
          let transition = 'transform 0.28s ease';

          if (isTop) {
            if (dismissDir) {
              translateX = dismissDir === 'left' ? -FLY_DISTANCE : FLY_DISTANCE;
              rotate = s.rotate + (dismissDir === 'left' ? -25 : 25);
            } else if (isDragging) {
              translateX = dragX;
              rotate = s.rotate + dragX * 0.04;
              transition = 'none';
            }
          }

          return (
            <div
              key={`${day.day}-${(topIndex + stackPos) % n}`}
              style={{
                position: 'absolute',
                inset: 0,
                transform: `translate(${translateX}px, ${s.y}px) rotate(${rotate}deg)`,
                zIndex: visibleDays.length - stackPos,
                transition,
                touchAction: 'pan-y',
                transformOrigin: 'center bottom',
              }}
              {...(isTop ? { onPointerDown, onPointerMove, onPointerUp } : {})}
            >
              <div className={`bg-slate-900 border border-slate-800 border-l-4 ${day.accent} rounded-xl p-5 h-full ${isTop ? 'cursor-grab active:cursor-grabbing' : ''}`}>
                <div className={`font-bold text-base ${day.headColor}`}>{day.day}</div>
                <div className="text-slate-500 text-xs mb-4">{day.date}</div>
                <EventTimeline day={day} currentKey={currentKey} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <div className="flex gap-1.5">
        {schedule2026.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === topIndex ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-slate-600'
            }`}
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
      <MobileScheduleDeck currentKey={currentKey} />
      <div className="hidden md:grid md:grid-cols-3 gap-4">
        {schedule2026.map(day => (
          <ScheduleCard key={day.day} day={day} currentKey={currentKey} cardBg={cardBg} />
        ))}
      </div>
    </>
  );
}
