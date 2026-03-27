'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type DropdownName = 'history' | 'analytics' | null;

export default function NavBar() {
  // Desktop dropdown state
  const [open, setOpen] = useState<DropdownName>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState<DropdownName>(null);

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

  // Close desktop dropdowns on outside click
  useEffect(() => {
    const close = () => setOpen(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSidebarExpanded(null);
  };

  const desktopLinkClass =
    'hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap';
  const desktopDropdownItemClass =
    'block px-4 py-2 text-sm hover:bg-slate-800 hover:text-emerald-400 transition-colors';

  const chevron = (rotated: boolean) => (
    <svg
      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${rotated ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <>
      <nav className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center h-16">
            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-slate-800 transition-colors shrink-0"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo — centered on mobile, left-aligned on desktop */}
            <Link
              href="/"
              className="font-bold text-xl flex items-center gap-2 shrink-0 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:mr-4"
              onClick={() => setOpen(null)}
            >
              <span className="text-2xl">🏈</span>
              <span className="text-emerald-500">Frodd</span>
              <span className="text-emerald-400">FFL</span>
            </Link>

            {/* Desktop nav links — hidden on mobile */}
            <div className="hidden md:flex items-center gap-1">
              <Link href="/" className={desktopLinkClass} onClick={() => setOpen(null)}>
                Dashboard
              </Link>

              <button
                onClick={(e) => toggleDropdown('history', e)}
                className={`${desktopLinkClass} flex items-center gap-1`}
              >
                League History
                {chevron(open === 'history')}
              </button>

              <button
                onClick={(e) => toggleDropdown('analytics', e)}
                className={`${desktopLinkClass} flex items-center gap-1`}
              >
                Analytics
                {chevron(open === 'analytics')}
              </button>

              <Link href="/allstar" className={desktopLinkClass} onClick={() => setOpen(null)}>
                All-Star
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop dropdowns */}
        {open === 'history' && (
          <div
            style={{ position: 'fixed', top: pos.top, left: pos.left }}
            className="w-48 bg-slate-900 border border-slate-800 rounded-md shadow-xl z-[9999]"
            onClick={(e) => e.stopPropagation()}
          >
            <Link href="/managers" className={desktopDropdownItemClass} onClick={() => setOpen(null)}>Managers</Link>
            <Link href="/seasons" className={desktopDropdownItemClass} onClick={() => setOpen(null)}>Seasons</Link>
            <Link href="/shotgun" className={desktopDropdownItemClass} onClick={() => setOpen(null)}>Shotgun</Link>
            <Link href="/highroller" className={desktopDropdownItemClass} onClick={() => setOpen(null)}>High Roller</Link>
          </div>
        )}
        {open === 'analytics' && (
          <div
            style={{ position: 'fixed', top: pos.top, left: pos.left }}
            className="w-48 bg-slate-900 border border-slate-800 rounded-md shadow-xl z-[9999]"
            onClick={(e) => e.stopPropagation()}
          >
            <Link href="/luck" className={desktopDropdownItemClass} onClick={() => setOpen(null)}>Luck Index</Link>
            <Link href="/clutchness" className={desktopDropdownItemClass} onClick={() => setOpen(null)}>Playoff Clutchness</Link>
            <Link href="/matrix" className={desktopDropdownItemClass} onClick={() => setOpen(null)}>Supremacy Matrix</Link>
            <Link href="/rivalries" className={desktopDropdownItemClass} onClick={() => setOpen(null)}>Rivalries</Link>
          </div>
        )}
      </nav>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[9998] md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-[9999] transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800">
          <Link href="/" className="font-bold text-xl flex items-center gap-2" onClick={closeSidebar}>
            <span className="text-2xl">🏈</span>
            <span className="text-emerald-500">Frodd</span>
            <span className="text-emerald-400">FFL</span>
          </Link>
          <button
            onClick={closeSidebar}
            className="p-2 rounded-md hover:bg-slate-800 transition-colors"
            aria-label="Close navigation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar links */}
        <div className="py-2">
          <Link
            href="/"
            className="block px-4 py-3 text-sm font-medium hover:bg-slate-800 hover:text-emerald-400 transition-colors"
            onClick={closeSidebar}
          >
            Dashboard
          </Link>

          {/* League History expandable */}
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-slate-800 hover:text-emerald-400 transition-colors"
            onClick={() => setSidebarExpanded(sidebarExpanded === 'history' ? null : 'history')}
          >
            League History
            {chevron(sidebarExpanded === 'history')}
          </button>
          {sidebarExpanded === 'history' && (
            <div className="bg-slate-950">
              <Link href="/managers" className="block px-8 py-2.5 text-sm text-slate-300 hover:text-emerald-400 transition-colors" onClick={closeSidebar}>Managers</Link>
              <Link href="/seasons" className="block px-8 py-2.5 text-sm text-slate-300 hover:text-emerald-400 transition-colors" onClick={closeSidebar}>Seasons</Link>
              <Link href="/shotgun" className="block px-8 py-2.5 text-sm text-slate-300 hover:text-emerald-400 transition-colors" onClick={closeSidebar}>Shotgun</Link>
              <Link href="/highroller" className="block px-8 py-2.5 text-sm text-slate-300 hover:text-emerald-400 transition-colors" onClick={closeSidebar}>High Roller</Link>
            </div>
          )}

          {/* Analytics expandable */}
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-slate-800 hover:text-emerald-400 transition-colors"
            onClick={() => setSidebarExpanded(sidebarExpanded === 'analytics' ? null : 'analytics')}
          >
            Analytics
            {chevron(sidebarExpanded === 'analytics')}
          </button>
          {sidebarExpanded === 'analytics' && (
            <div className="bg-slate-950">
              <Link href="/luck" className="block px-8 py-2.5 text-sm text-slate-300 hover:text-emerald-400 transition-colors" onClick={closeSidebar}>Luck Index</Link>
              <Link href="/clutchness" className="block px-8 py-2.5 text-sm text-slate-300 hover:text-emerald-400 transition-colors" onClick={closeSidebar}>Playoff Clutchness</Link>
              <Link href="/matrix" className="block px-8 py-2.5 text-sm text-slate-300 hover:text-emerald-400 transition-colors" onClick={closeSidebar}>Supremacy Matrix</Link>
              <Link href="/rivalries" className="block px-8 py-2.5 text-sm text-slate-300 hover:text-emerald-400 transition-colors" onClick={closeSidebar}>Rivalries</Link>
            </div>
          )}

          <Link
            href="/allstar"
            className="block px-4 py-3 text-sm font-medium hover:bg-slate-800 hover:text-emerald-400 transition-colors"
            onClick={closeSidebar}
          >
            All-Star
          </Link>
        </div>
      </div>
    </>
  );
}
