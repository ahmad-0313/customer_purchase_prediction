/**
 * Skeleton — a shimmering placeholder used while data is loading.
 * Wrap multiple Skeleton instances to mimic the real layout.
 *
 * Props:
 *   className  {string}  Tailwind classes for width and height, e.g. "w-full h-8"
 */
export function Skeleton({ className = "w-full h-4" }) {
  return (
    <div
      className={`bg-slate-200 rounded animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * Spinner — a small circular loading indicator.
 *
 * Props:
 *   size  {string}  Tailwind size class, e.g. "h-8 w-8" (default)
 *   className  {string}  extra classes
 */
export function Spinner({ size = "h-8 w-8", className = "" }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`inline-block ${size} ${className} animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600`}
    />
  );
}

/**
 * LoadingOverlay — centered spinner with optional message.
 */
export function LoadingOverlay({ message = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Spinner size="h-10 w-10" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
