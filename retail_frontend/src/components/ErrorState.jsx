import { AlertTriangle, WifiOff } from "lucide-react";

/**
 * ErrorState — friendly error display with a Retry button.
 *
 * Props:
 *   status    {number}   ApiError.status (0 = network, 4xx = API error)
 *   message   {string}   optional override message
 *   onRetry   {function} called when the user clicks Retry
 */
export default function ErrorState({ status, message, onRetry }) {
  const isNetwork = status === 0;

  const defaultMessage = isNetwork
    ? "Cannot reach the server. Is the backend running?"
    : message || "Something went wrong. Please try again.";

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-4">
      <div className={`p-3 rounded-full ${isNetwork ? "bg-slate-100" : "bg-red-50"}`}>
        {isNetwork ? (
          <WifiOff className="text-slate-500" size={28} />
        ) : (
          <AlertTriangle className="text-red-500" size={28} />
        )}
      </div>

      <div>
        <p className="text-base font-semibold text-slate-700">
          {isNetwork ? "Cannot reach the server" : "Something went wrong"}
        </p>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">{defaultMessage}</p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Retry
        </button>
      )}
    </div>
  );
}
