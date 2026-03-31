'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type DropdownName = 'history' | 'analytics' | null;

const PAGE_NAMES: Record<string, string> = {
  '/managers': 'Managers',
  '/seasons': 'Seasons',
  '/shotgun': 'Shotgun',
  '/highroller': 'High Roller',
  '/luck': 'Luck Index',
  '/clutchness': 'Clutchness',
  '/matrix': 'Supremacy Matrix',
  '/rivalries': 'Rivalries',
  '/allstar': 'All-Star',
};

function getPageName(path: string): string | null {
  if (PAGE_NAMES[path]) return PAGE_NAMES[path];
  if (path.startsWith('/managers/')) return 'Managers';
  return null;
}

export default function NavBar() {
  const pathname = usePathname();
  const pageName = getPageName(pathname);

  // Desktop dropdown state
  const [open, setOpen] = useState<DropdownName>(null);

  // Mobile bottom sheet state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState({ history: true, analytics: true });

  // Bottom sheet drag-to-dismiss
  const [sheetDragY, setSheetDragY] = useState(0);
  const [isDraggingSheet, setIsDraggingSheet] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const sheetScrollRef = useRef<HTMLDivElement>(null);
  const currentDragY = useRef(0);

  // FAB one-time pulse
  const [fabPulse, setFabPulse] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('fab-hint-shown')) {
      const t = setTimeout(() => {
        setFabPulse(true);
        localStorage.setItem('fab-hint-shown', '1');
      }, 1000);
      return () => clearTimeout(t);
    }
  }, []);


  useEffect(() => {
    const html = document.documentElement;
    if (sidebarOpen) {
      const scrollY = window.scrollY;
      html.dataset.scrollY = String(scrollY);
      html.style.overflow = 'hidden';
    } else {
      const scrollY = html.dataset.scrollY;
      html.style.overflow = '';
      delete html.dataset.scrollY;
      if (scrollY) window.scrollTo(0, parseInt(scrollY));
    }
    return () => {
      html.style.overflow = '';
      delete html.dataset.scrollY;
    };
  }, [sidebarOpen]);

  // Native touch handlers — non-passive so we can preventDefault() and stop pull-to-refresh
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet || !sidebarOpen) return;

    let startY = 0;
    let active = false;

    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      active = false;
      currentDragY.current = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      const delta = e.touches[0].clientY - startY;
      const scrollTop = sheetScrollRef.current?.scrollTop ?? 0;
      if (!active && delta > 8 && scrollTop === 0) {
        active = true;
      }
      if (active) {
        e.preventDefault();
        const y = Math.max(0, delta);
        currentDragY.current = y;
        setSheetDragY(y);
        setIsDraggingSheet(true);
      }
    };

    const onTouchEnd = () => {
      if (active) {
        setIsDraggingSheet(false);
        if (currentDragY.current > 80) {
          setSidebarOpen(false);
          setSidebarExpanded({ history: true, analytics: true });
          setSheetDragY(0);
        } else {
          setSheetDragY(0);
        }
        currentDragY.current = 0;
      }
      active = false;
    };

    sheet.addEventListener('touchstart', onTouchStart, { passive: true });
    sheet.addEventListener('touchmove', onTouchMove, { passive: false });
    sheet.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      sheet.removeEventListener('touchstart', onTouchStart);
      sheet.removeEventListener('touchmove', onTouchMove);
      sheet.removeEventListener('touchend', onTouchEnd);
    };
  }, [sidebarOpen]);

  if (pathname === '/') return null;

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSidebarExpanded({ history: true, analytics: true });
    setSheetDragY(0);
    setIsDraggingSheet(false);
  };


  const desktopLinkClass =
    'hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap';
  const desktopDropdownItemClass =
    'block px-4 py-2 text-sm hover:bg-slate-800 hover:text-emerald-400 transition-colors';

  const chevron = (rotated: boolean) => (
    <svg
      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${rotated ? 'rotate-180' : ''}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <>
      <nav className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">

            {/* Mobile: 🏈 + page name — left aligned */}
            <div className="md:hidden">
              <Link
                href="/"
                className="font-bold text-xl flex items-center gap-2"
                onClick={() => setOpen(null)}
              >
                <span className="text-2xl">🏈</span>
                <span className="text-emerald-500">Frodd</span>
                <span className="text-emerald-400">FFL</span>
              </Link>
            </div>

            {/* Desktop: logo + nav links */}
            <Link
              href="/"
              className="hidden md:flex font-bold text-xl items-center gap-2 shrink-0 mr-4"
              onClick={() => setOpen(null)}
            >
              <span className="text-2xl">🏈</span>
              <span className="text-emerald-500">Frodd</span>
              <span className="text-emerald-400">FFL</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link href="/dashboard" className={desktopLinkClass} onClick={() => setOpen(null)}>
                Dashboard
              </Link>
              <div className="relative pb-1" onMouseEnter={() => setOpen('history')} onMouseLeave={() => setOpen(null)}>
                <button className={`${desktopLinkClass} flex items-center gap-1`}>
                  League History {chevron(open === 'history')}
                </button>
                {open === 'history' && (
                  <div className="absolute top-full left-0 w-48 bg-slate-900 border border-slate-800 rounded-md shadow-xl z-[9999]">
                    <Link href="/managers" className={desktopDropdownItemClass} onClick={() => setOpen(null)}>Managers</Link>
                    <Link href="/seasons" className={desktopDropdownItemClass} onClick={() => setOpen(null)}>Seasons</Link>
                    <Link href="/rivalries" className={desktopDropdownItemClass} onClick={() => setOpen(null)}>Rivalries</Link>
                  </div>
                )}
              </div>
              <div className="relative pb-1" onMouseEnter={() => setOpen('analytics')} onMouseLeave={() => setOpen(null)}>
                <button className={`${desktopLinkClass} flex items-center gap-1`}>
                  Analytics {chevron(open === 'analytics')}
                </button>
                {open === 'analytics' && (
                  <div className="absolute top-full left-0 w-48 bg-slate-900 border border-slate-800 rounded-md shadow-xl z-[9999]">
                    <Link href="/luck" className={desktopDropdownItemClass} onClick={() => setOpen(null)}>Luck Index</Link>
                    <Link href="/clutchness" className={desktopDropdownItemClass} onClick={() => setOpen(null)}>Clutchness</Link>
                    <Link href="/matrix" className={desktopDropdownItemClass} onClick={() => setOpen(null)}>Supremacy Matrix</Link>
                    <Link href="/shotgun" className={desktopDropdownItemClass} onClick={() => setOpen(null)}>Shotgun</Link>
                    <Link href="/highroller" className={desktopDropdownItemClass} onClick={() => setOpen(null)}>High Roller</Link>
                  </div>
                )}
              </div>
              <Link href="/allstar" className={desktopLinkClass} onClick={() => setOpen(null)}>
                All-Star
              </Link>
            </div>
          </div>
        </div>

      </nav>

      {/* Mobile FAB — bottom-left, opens bottom sheet */}
      <button
        className={`fixed bottom-6 left-4 z-[9997] md:hidden bg-slate-800 border border-slate-700 text-slate-100 rounded-full p-3.5 hover:bg-slate-700 transition-colors fab-glow ${fabPulse ? 'fab-pulse' : ''}`}
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile bottom sheet overlay — touch-none prevents scroll bleed */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-[9998] md:hidden touch-none" onClick={closeSidebar} />
      )}

      {/* Mobile bottom sheet */}
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 max-h-[80vh] bg-slate-900 border-t border-slate-700 rounded-t-2xl z-[9999] md:hidden flex flex-col ${
          isDraggingSheet ? '' : 'transition-transform duration-300 ease-in-out'
        } ${sidebarOpen && sheetDragY === 0 ? 'translate-y-0' : sidebarOpen ? '' : 'translate-y-full'}`}
        style={sidebarOpen && sheetDragY > 0 ? { transform: `translateY(${sheetDragY}px)` } : undefined}
      >
        {/* Drag handle visual */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>

        {/* Scrollable links */}
        <div ref={sheetScrollRef} className="overflow-y-auto overscroll-contain py-1 pb-8">
          <Link href="/dashboard"
            className={`block px-6 py-3.5 text-sm font-medium transition-colors hover:bg-slate-800 hover:text-emerald-400 ${isActive('/dashboard') ? 'text-emerald-400 bg-slate-800/60' : ''}`}
            onClick={closeSidebar}
          >Dashboard</Link>

          <div className="border-t border-slate-800" />

          <button
            className="w-full flex items-center justify-between px-6 py-3.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition-colors"
            onClick={() => setSidebarExpanded(s => ({ ...s, history: !s.history }))}
          >
            League History {chevron(sidebarExpanded.history)}
          </button>
          {sidebarExpanded.history && (
            <div className="bg-slate-950/60">
              {[
                { href: '/managers', label: 'Managers' },
                { href: '/seasons', label: 'Seasons' },
                { href: '/rivalries', label: 'Rivalries' },
              ].map(({ href, label }) => (
                <Link key={href} href={href}
                  className={`block px-10 py-3 text-sm transition-colors hover:text-emerald-400 ${isActive(href) ? 'text-emerald-400 bg-emerald-400/5' : 'text-slate-400'}`}
                  onClick={closeSidebar}
                >{label}</Link>
              ))}
            </div>
          )}

          <div className="border-t border-slate-800" />

          <button
            className="w-full flex items-center justify-between px-6 py-3.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition-colors"
            onClick={() => setSidebarExpanded(s => ({ ...s, analytics: !s.analytics }))}
          >
            Analytics {chevron(sidebarExpanded.analytics)}
          </button>
          {sidebarExpanded.analytics && (
            <div className="bg-slate-950/60">
              {[
                { href: '/luck', label: 'Luck Index' },
                { href: '/clutchness', label: 'Clutchness' },
                { href: '/matrix', label: 'Supremacy Matrix' },
                { href: '/shotgun', label: 'Shotgun' },
                { href: '/highroller', label: 'High Roller' },
              ].map(({ href, label }) => (
                <Link key={href} href={href}
                  className={`block px-10 py-3 text-sm transition-colors hover:text-emerald-400 ${isActive(href) ? 'text-emerald-400 bg-emerald-400/5' : 'text-slate-400'}`}
                  onClick={closeSidebar}
                >{label}</Link>
              ))}
            </div>
          )}

          <div className="border-t border-slate-800" />

          <Link href="/allstar"
            className={`block px-6 py-3.5 text-sm font-medium transition-colors hover:bg-slate-800 hover:text-emerald-400 ${isActive('/allstar') ? 'text-emerald-400 bg-slate-800/60' : ''}`}
            onClick={closeSidebar}
          >All-Star</Link>

          <div className="border-t border-slate-800" />
        </div>
      </div>
    </>
  );
}
