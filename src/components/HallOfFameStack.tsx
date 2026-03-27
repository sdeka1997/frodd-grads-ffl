'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Medal } from 'lucide-react';

type Manager = {
  manager: string;
  championships: number;
  wins: number;
  losses: number;
};

// Rotation and offset for each position in the visual stack (0 = top card)
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
  const [topIndex, setTopIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  // flyingOff: top card exits left
  const [flyingOff, setFlyingOff] = useState(false);
  // flyingIn: previous card enters from the right (placed off-screen, then animated in)
  const [flyingIn, setFlyingIn] = useState(false);
  const startXRef = useRef(0);

  const total = managers.length;
  const remaining = total - topIndex;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (flyingOff || flyingIn) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startXRef.current = e.clientX;
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || flyingOff || flyingIn) return;
    setDragX(e.clientX - startXRef.current);
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragX < -SWIPE_THRESHOLD) {
      // Swipe left → dismiss
      setFlyingOff(true);
      setTimeout(() => {
        setTopIndex(i => i + 1);
        setDragX(0);
        setFlyingOff(false);
      }, 280);
    } else if (dragX > SWIPE_THRESHOLD && topIndex > 0) {
      // Swipe right → bring back previous card
      // 1. Snap topIndex back (card appears off-screen right, no transition)
      setTopIndex(i => i - 1);
      setFlyingIn(true);
      setDragX(0);
      // 2. Two RAFs later: enable transition so it animates in
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setFlyingIn(false))
      );
    } else {
      setDragX(0);
    }
  };

  if (remaining === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <p className="text-slate-400 text-sm">That&apos;s the whole deck!</p>
        <button
          onClick={() => setTopIndex(0)}
          className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors"
        >
          ↺ Start over
        </button>
      </div>
    );
  }

  const visibleManagers = managers.slice(topIndex, topIndex + 4);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Stack */}
      <div className="relative w-full" style={{ height: '196px' }}>
        {[...visibleManagers].reverse().map((manager, reversedPos) => {
          const stackPos = visibleManagers.length - 1 - reversedPos;
          const isTop = stackPos === 0;
          const s = STACK_STYLE[stackPos] ?? STACK_STYLE[STACK_STYLE.length - 1];

          let translateX = s.x;
          let rotate = s.rotate;
          let transition = 'transform 0.28s ease';

          if (isTop) {
            if (flyingOff) {
              // Animate out to the left
              translateX = -FLY_DISTANCE;
              rotate = s.rotate - 25;
            } else if (flyingIn) {
              // Placed off-screen right instantly (no transition)
              translateX = FLY_DISTANCE;
              rotate = 20;
              transition = 'none';
            } else if (isDragging) {
              translateX = dragX;
              rotate = s.rotate + dragX * 0.04;
              transition = 'none';
            }
          }

          return (
            <div
              key={manager.manager}
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
                  <div className="absolute top-0 right-0 p-4">
                    <Medal className={`w-6 h-6 ${
                      manager.championships === maxChamps ? 'text-yellow-400' :
                      manager.championships === maxChamps - 1 ? 'text-slate-300' :
                      'text-amber-600'
                    }`} />
                  </div>
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
                : i < topIndex
                ? 'w-1.5 h-1.5 bg-slate-700'
                : 'w-1.5 h-1.5 bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
