"use client";

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleLegendProps {
  title: string;
  children: React.ReactNode;
}

export default function CollapsibleLegend({ title, children }: CollapsibleLegendProps) {
  // Open by default on desktop, closed by default on mobile
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setOpen(mq.matches);
    const handler = (e: MediaQueryListEvent) => setOpen(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <section>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between p-6 text-left md:cursor-default"
        >
          <h2 className="text-xl md:text-2xl font-bold text-slate-200">{title}</h2>
          <ChevronDown
            className={`w-5 h-5 text-slate-500 transition-transform duration-200 md:hidden ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {open && (
          <div className="px-6 pb-6">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
