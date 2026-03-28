import Link from 'next/link';

export default function ManagerStatBoxes({
  manager,
  shotgunCount,
  highRollerCount,
}: {
  manager: string;
  shotgunCount: number;
  highRollerCount: number;
}) {
  return (
    <>
      <Link
        href={`/shotgun?manager=${encodeURIComponent(manager)}`}
        className="bg-slate-900 p-4 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors text-left md:order-5 block"
      >
        <div className="text-slate-400 text-sm">Shotguns</div>
        <div className="text-2xl font-bold text-emerald-400">{shotgunCount}</div>
      </Link>

      <Link
        href={`/highroller?manager=${encodeURIComponent(manager)}`}
        className="bg-slate-900 p-4 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors text-left md:order-6 block"
      >
        <div className="text-slate-400 text-sm">High Scorer</div>
        <div className="text-2xl font-bold">{highRollerCount}</div>
      </Link>
    </>
  );
}
