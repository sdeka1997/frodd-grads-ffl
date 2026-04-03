"use client";

import { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import ShotgunModal from '@/components/ShotgunModal';
import HighRollerModal from '@/components/HighRollerModal';

export default function ManagerStatBoxes({
  manager,
  shotgunCount,
  highRollerCount,
}: {
  manager: string;
  shotgunCount: number;
  highRollerCount: number;
}) {
  const [shotgunOpen, setShotgunOpen] = useState(false);
  const [highRollerOpen, setHighRollerOpen] = useState(false);

  return (
    <>
      {shotgunOpen && (
        <ShotgunModal
          manager={manager}
          footerHref="/shotgun"
          footerLabel="See all shotguns →"
          onClose={() => setShotgunOpen(false)}
        />
      )}
      {highRollerOpen && (
        <HighRollerModal
          manager={manager}
          footerHref="/highroller"
          footerLabel="See all high rollers →"
          onClose={() => setHighRollerOpen(false)}
        />
      )}

      <button
        onClick={() => setShotgunOpen(true)}
        className="relative bg-slate-900 p-4 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors text-left md:order-5 w-full cursor-pointer"
      >
        <Maximize2 className="absolute top-2 right-2 w-3.5 h-3.5 text-slate-400" />
        <div className="text-slate-400 text-sm">Shotguns</div>
        <div className="text-2xl font-bold text-emerald-400">{shotgunCount}</div>
      </button>

      <button
        onClick={() => setHighRollerOpen(true)}
        className="relative bg-slate-900 p-4 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors text-left md:order-6 w-full cursor-pointer"
      >
        <Maximize2 className="absolute top-2 right-2 w-3.5 h-3.5 text-slate-400" />
        <div className="text-slate-400 text-sm">High Scorer</div>
        <div className="text-2xl font-bold">{highRollerCount}</div>
      </button>
    </>
  );
}
