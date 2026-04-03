'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Medal, ChevronRight } from 'lucide-react';

type Manager = {
  manager: string;
  championships: number;
  wins: number;
  losses: number;
};

const STACK_STYLE = [
  { rotate:  1, x:  0, y: 0 },
  { rotate: -6, x:  5, y: 4 },
  { rotate:  4, x: -4, y: 7 },
  { rotate: -3, x:  3, y: 10 },
];

const SWIPE_THRESHOLD = 75;
const FLY_DISTANCE = 600;

export default function HallOfFameStack({
  managers,
  maxChamps,
}: {
  managers: Manager[];
  maxChamps: number;
}) {
  const total = managers.length;
  const [topIndex, setTopIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dismissDir, setDismissDir] = useState<'left' | 'right' | null>(null);
  const startXRef = useRef(0);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dismissDir) return;
    e.currentTarget.setPointerCapture(e.pointerId);
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
        setTopIndex(i => dir === 'left'
          ? (i + 1) % total
          : (i - 1 + total) % total
        );
        setDragX(0);
        setDismissDir(null);
      }, 280);
    } else {
      setDragX(0);
    }
  };

  // Always show up to 4 cards, wrapping around infinitely
  const visibleManagers = Array.from({ length: Math.min(4, total) }, (_, i) =>
    managers[(topIndex + i) % total]
  );

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative w-full" style={{ height: '196px' }}>
        {[...visibleManagers].reverse().map((manager, reversedPos) => {
          const stackPos = visibleManagers.length - 1 - reversedPos;
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
              key={`${manager.manager}-${(topIndex + stackPos) % total}`}
              style={{
                position: 'absolute',
                inset: 0,
                transform: `translate(${translateX}px, ${s.y}px) rotate(${rotate}deg)`,
                zIndex: visibleManagers.length - stackPos,
                transition,
                touchAction: 'none',
                transformOrigin: 'center bottom',
              }}
              {...(isTop ? { onPointerDown, onPointerMove, onPointerUp } : {})}
            >
              <Link
                href={`/managers/${manager.manager}`}
                className="block h-full"
                onClick={e => isDragging && Math.abs(dragX) > 8 && e.preventDefault()}
                draggable={false}
              >
                <div className={`bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden h-full ${isTop ? 'cursor-grab active:cursor-grabbing' : ''}`}>
                  <div className="absolute top-0 left-0 p-4">
                    <Medal className={`w-6 h-6 ${
                      manager.championships === maxChamps ? 'text-yellow-400' :
                      manager.championships === maxChamps - 1 ? 'text-slate-300' :
                      'text-amber-600'
                    }`} />
                  </div>
                  <ChevronRight className="absolute top-3 right-3 w-4 h-4 text-slate-600" />
                  <h3 className="text-2xl font-bold mb-2">{manager.manager}</h3>
                  <div className="text-4xl font-black text-emerald-400 mb-2">
                    {manager.championships}{' '}
                    <span className="text-sm text-slate-500 font-normal">Rings</span>
                  </div>
                  <p className="text-slate-400 text-sm">
                    {manager.wins}-{manager.losses} Overall Record
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <div className="flex gap-1.5">
        {managers.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === topIndex
                ? 'w-4 h-1.5 bg-emerald-400'
                : 'w-1.5 h-1.5 bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
