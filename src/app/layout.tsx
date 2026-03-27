import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Frodd FFL',
  description: 'A decade of fantasy football data and analytics.',
  icons: {
    icon: [
      { url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏈</text></svg>' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`${inter.variable} font-sans bg-slate-950 text-slate-50 antialiased overflow-x-hidden w-full`}>
        <nav className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center shrink-0">
                <Link href="/" className="font-bold text-xl flex items-center gap-2 mr-6 sm:mr-10">
                  <span className="text-2xl">🏈</span>
                  <span className="text-emerald-500">Frodd</span>
                  <span className="text-emerald-400">FFL</span>
                </Link>
                <div className="flex items-baseline space-x-1 sm:space-x-4 overflow-visible">
                  <Link href="/" className="hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap">Dashboard</Link>

                  <div className="relative group">
                    <button className="hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1">
                      League History
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute top-full left-0 mt-1 w-48 bg-slate-900 border border-slate-800 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999]">
                      <Link href="/managers" className="block px-4 py-2 text-sm hover:bg-slate-800 hover:text-emerald-400 transition-colors">Managers</Link>
                      <Link href="/seasons" className="block px-4 py-2 text-sm hover:bg-slate-800 hover:text-emerald-400 transition-colors">Seasons</Link>
                      <Link href="/shotgun" className="block px-4 py-2 text-sm hover:bg-slate-800 hover:text-emerald-400 transition-colors">Shotgun</Link>
                      <Link href="/highroller" className="block px-4 py-2 text-sm hover:bg-slate-800 hover:text-emerald-400 transition-colors">High Roller</Link>
                    </div>
                  </div>

                  <div className="relative group">
                    <button className="hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1">
                      Analytics
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute top-full left-0 mt-1 w-48 bg-slate-900 border border-slate-800 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999]">
                      <Link href="/luck" className="block px-4 py-2 text-sm hover:bg-slate-800 hover:text-emerald-400 transition-colors">Luck Index</Link>
                      <Link href="/clutchness" className="block px-4 py-2 text-sm hover:bg-slate-800 hover:text-emerald-400 transition-colors">Playoff Clutchness</Link>
                      <Link href="/matrix" className="block px-4 py-2 text-sm hover:bg-slate-800 hover:text-emerald-400 transition-colors">Supremacy Matrix</Link>
                      <Link href="/rivalries" className="block px-4 py-2 text-sm hover:bg-slate-800 hover:text-emerald-400 transition-colors">Rivalries</Link>
                    </div>
                  </div>

                  <Link href="/allstar" className="hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap">All-Star</Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}