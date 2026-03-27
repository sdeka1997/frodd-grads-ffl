'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type DropdownName = 'history' | 'analytics' | null;

export default function NavBar() {
  const [open, setOpen] = useState<DropdownName>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const toggleDropdown = (name: DropdownName, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (open === name) {
      setOpen(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
      setOpen(name);
    }
  };

  useEffect(() => {
    const close = () => setOpen(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const linkClass =
    'hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap';
  const dropdownItemClass =
    'block px-4 py-2 text-sm hover:bg-slate-800 hover:text-emerald-400 transition-colors';

  return (
    <nav className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <Link
            href="/"
            className="font-bold text-xl flex items-center gap-2 mr-4 shrink-0"
            onClick={() => setOpen(null)}
          >
            <span className="text-2xl">🏈</span>
            <span className="text-emerald-500">Frodd</span>
            <span className="text-emerald-400">FFL</span>
          </Link>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar min-w-0">
            <Link href="/" className={linkClass} onClick={() => setOpen(null)}>
              Dashboard
            </Link>

            <button
              onClick={(e) => toggleDropdown('history', e)}
              className={`${linkClass} flex items-center gap-1`}
            >
              League History
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <button
              onClick={(e) => toggleDropdown('analytics', e)}
              className={`${linkClass} flex items-center gap-1`}
            >
              Analytics
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <Link href="/allstar" className={linkClass} onClick={() => setOpen(null)}>
              All-Star
            </Link>
          </div>
        </div>
      </div>

      {open === 'history' && (
        <div
          style={{ position: 'fixed', top: pos.top, left: pos.left }}
          className="w-48 bg-slate-900 border border-slate-800 rounded-md shadow-xl z-[9999]"
          onClick={(e) => e.stopPropagation()}
        >
          <Link href="/managers" className={dropdownItemClass} onClick={() => setOpen(null)}>
            Managers
          </Link>
          <Link href="/seasons" className={dropdownItemClass} onClick={() => setOpen(null)}>
            Seasons
          </Link>
          <Link href="/shotgun" className={dropdownItemClass} onClick={() => setOpen(null)}>
            Shotgun
          </Link>
          <Link href="/highroller" className={dropdownItemClass} onClick={() => setOpen(null)}>
            High Roller
          </Link>
        </div>
      )}

      {open === 'analytics' && (
        <div
          style={{ position: 'fixed', top: pos.top, left: pos.left }}
          className="w-48 bg-slate-900 border border-slate-800 rounded-md shadow-xl z-[9999]"
          onClick={(e) => e.stopPropagation()}
        >
          <Link href="/luck" className={dropdownItemClass} onClick={() => setOpen(null)}>
            Luck Index
          </Link>
          <Link href="/clutchness" className={dropdownItemClass} onClick={() => setOpen(null)}>
            Playoff Clutchness
          </Link>
          <Link href="/matrix" className={dropdownItemClass} onClick={() => setOpen(null)}>
            Supremacy Matrix
          </Link>
          <Link href="/rivalries" className={dropdownItemClass} onClick={() => setOpen(null)}>
            Rivalries
          </Link>
        </div>
      )}
    </nav>
  );
}
