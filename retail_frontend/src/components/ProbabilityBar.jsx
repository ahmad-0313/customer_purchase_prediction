import { probabilityColor, formatPercent } from "../utils/format.js";

/**
 * ProbabilityBar — a slim horizontal bar that fills from left to right
 * and changes colour based on the probability threshold zones.
 *
 * Props:
 *   value  {number}  0 to 1
 *   showLabel {boolean}  whether to show the percentage text (default true)
 */
export default function ProbabilityBar({ value, showLabel = true }) {
  const percent = Math.round((value ?? 0) * 100);
  const fillClass = probabilityColor(value, "bg");

  return (
    <div className="flex items-center gap-2 min-w-0">
      {/* Bar track */}
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${fillClass}`}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <span className={`text-xs font-medium tabular-nums w-10 text-right ${probabilityColor(value, "text")}`}>
          {formatPercent(value)}
        </span>
      )}
    </div>
  );
}
