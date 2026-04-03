import { getCumulativeRecords, getCurrentManagers } from '@/utils/dataProcessing';
import Link from 'next/link';
import { Users, History, ChevronRight } from 'lucide-react';

export default function ManagersPage() {
  const records = getCumulativeRecords();
  const currentManagers = getCurrentManagers();
  
  const active = records.filter(r => currentManagers.includes(r.manager));
  const former = records.filter(r => !currentManagers.includes(r.manager));
  
  return (
    <div className="space-y-12">
      <section className="space-y-8">
        <h1 className="text-4xl font-extrabold flex items-center gap-3">
          <Users className="w-10 h-10 text-emerald-400" />
          Active Managers
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {active.map(manager => (
            <Link href={`/managers/${manager.manager}`} key={manager.manager} className="block">
              <div className="relative bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all cursor-pointer group h-full flex flex-col justify-center shadow-lg">
                <ChevronRight className="absolute top-3 right-3 w-4 h-4 text-slate-600" />
                <h2 className="text-xl font-bold group-hover:text-emerald-400 transition-colors">{manager.manager}</h2>
                <p className="text-slate-400 text-sm mt-2">{manager.championships} Championships</p>
                <p className="text-slate-500 text-xs mt-1">{manager.wins}-{manager.losses} Record</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {former.length > 0 && (
        <section className="space-y-8 pt-8 border-t border-slate-800/50">
          <h2 className="text-3xl font-bold flex items-center gap-3 text-slate-500">
            <History className="w-8 h-8 opacity-50" />
            Former Members
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 opacity-60">
            {former.map(manager => (
              <Link href={`/managers/${manager.manager}`} key={manager.manager} className="block">
                <div className="relative bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:opacity-100 hover:border-slate-700 transition-all cursor-pointer group h-full flex flex-col justify-center">
                  <ChevronRight className="absolute top-3 right-3 w-4 h-4 text-slate-700" />
                  <h2 className="text-lg font-bold group-hover:text-slate-300 transition-colors italic">{manager.manager}</h2>
                  <p className="text-slate-500 text-xs mt-2">{manager.championships} Championships</p>
                  <p className="text-slate-600 text-[10px] mt-1">{manager.wins}-{manager.losses} Record</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}