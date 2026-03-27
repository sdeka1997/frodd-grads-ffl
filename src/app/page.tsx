import { getCumulativeRecords } from '@/utils/dataProcessing';
import { Trophy, Target, Star, Calendar } from 'lucide-react';
import CumulativeTable from '@/components/CumulativeTable';
import { Medal } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import AllStarCountdown from '@/components/AllStarCountdown';

export default function Home() {
  const records = getCumulativeRecords();
  
  // Hall of fame: managers with championships
  const hallOfFame = records.filter(r => r.championships > 0).sort((a, b) => b.championships - a.championships);
  const maxChamps = Math.max(...records.map(r => r.championships));

  return (
    <div className="space-y-12">
      <header className="text-center space-y-4 pt-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          The <span className="text-emerald-400">Frodd Grads</span> Hub
        </h1>
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400">
          The complete digital home for the Frodd Grads <span className="whitespace-nowrap">(2019-2025)</span>. League history, analytics, memories, and more.
        </p>
      </header>

      <div className="-mt-4">
        <AllStarCountdown />
      </div>

      <section>
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Trophy className="text-yellow-400 w-8 h-8" /> Hall of Fame
        </h2>
        {/* Mobile: swipeable carousel */}
        <div className="md:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory no-scrollbar">
          <div className="flex gap-3 pb-2 w-max pr-8">
            {hallOfFame.map((manager) => (
              <div key={manager.manager} className="snap-center shrink-0 w-[78vw]">
                <Link href={`/managers/${manager.manager}`} className="block group">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-emerald-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4">
                      <Medal className={`w-6 h-6 ${
                        manager.championships === maxChamps ? 'text-yellow-400' :
                        manager.championships === maxChamps - 1 ? 'text-slate-300' :
                        'text-amber-600'
                      }`} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">{manager.manager}</h3>
                    <div className="text-4xl font-black text-emerald-400 mb-2">{manager.championships} <span className="text-sm text-slate-500 font-normal">Rings</span></div>
                    <p className="text-slate-400 text-sm">{manager.wins}-{manager.losses} Overall Record</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hallOfFame.map((manager) => (
            <Link key={manager.manager} href={`/managers/${manager.manager}`} className="block group">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-emerald-500/50 transition-colors h-full">
                <div className="absolute top-0 right-0 p-4">
                  <Medal className={`w-6 h-6 ${
                    manager.championships === maxChamps ? 'text-yellow-400' :
                    manager.championships === maxChamps - 1 ? 'text-slate-300' :
                    'text-amber-600'
                  }`} />
                </div>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">{manager.manager}</h3>
                <div className="text-4xl font-black text-emerald-400 mb-2">{manager.championships} <span className="text-sm text-slate-500 font-normal">Rings</span></div>
                <p className="text-slate-400 text-sm">{manager.wins}-{manager.losses} Overall Record</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Target className="text-blue-400 w-8 h-8" /> Decade Leaderboard
        </h2>
        <CumulativeTable initialRecords={records} />
      </section>
    </div>
  );
}
