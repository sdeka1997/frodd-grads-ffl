interface CenteredBarProps {
  value: number;
  isGoodWhenPositive: boolean; // true for PF (higher = better), false for PA (lower = better)
  maxAbs?: number; // if provided, scales relative to this; otherwise uses fixed scale
  height?: string;
}

export default function CenteredBar({ value, isGoodWhenPositive, maxAbs, height = 'h-3' }: CenteredBarProps) {
  const isPositive = value > 0;
  const isGood = isGoodWhenPositive ? isPositive : !isPositive;

  // Width as % of one half of the bar
  const halfWidthPct = maxAbs
    ? Math.min((Math.abs(value) / maxAbs) * 100, 100)
    : Math.min(Math.abs(value) * 20, 100);

  const color = isGood ? 'bg-emerald-400' : 'bg-red-400';

  return (
    <div className={`flex ${height} bg-slate-800 rounded-full overflow-hidden`}>
      {/* Left half — grows right-to-left for negative values */}
      <div className="w-1/2 flex justify-end">
        {!isPositive && value !== 0 && (
          <div
            className={`h-full ${color} rounded-l-full`}
            style={{ width: `${halfWidthPct}%` }}
          />
        )}
      </div>
      {/* Center divider */}
      <div className="w-px bg-slate-500 shrink-0" />
      {/* Right half — grows left-to-right for positive values */}
      <div className="w-1/2 flex justify-start">
        {isPositive && (
          <div
            className={`h-full ${color} rounded-r-full`}
            style={{ width: `${halfWidthPct}%` }}
          />
        )}
      </div>
    </div>
  );
}
