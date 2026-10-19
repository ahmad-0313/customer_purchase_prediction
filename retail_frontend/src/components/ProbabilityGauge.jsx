import { probabilityColor, formatPercent } from "../utils/format.js";

/**
 * ProbabilityGauge — a circular SVG gauge that displays a probability as a %.
 *
 * Props:
 *   value  {number}  0 to 1
 *   size   {number}  diameter in px (default 160)
 */
export default function ProbabilityGauge({ value, size = 160 }) {
  const safeValue = Math.max(0, Math.min(1, value ?? 0));
  const percent = Math.round(safeValue * 100);

  // SVG arc geometry
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = safeValue * circumference;

  // Colour classes mapped to actual hex values for SVG (Tailwind can't set SVG stroke)
  let strokeColor = "#ef4444"; // red
  if (safeValue >= 0.7) strokeColor = "#10b981";       // emerald
  else if (safeValue >= 0.4) strokeColor = "#f59e0b";  // amber

  const textColorClass = probabilityColor(safeValue, "text");

  return (
    <div className="flex flex-col items-center gap-1" aria-label={`Chance of returning: ${percent}%`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        {/* Filled arc */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>

      {/* Percentage label — positioned over the SVG with negative margin */}
      <div
        className={`-mt-${Math.round(size / 2 + 10)} font-bold tabular-nums ${textColorClass}`}
        style={{ marginTop: -(size / 2 + 14), fontSize: size * 0.22 }}
      >
        {percent}%
      </div>
      <p className="text-xs text-slate-500 mt-2">chance of returning</p>
    </div>
  );
}
