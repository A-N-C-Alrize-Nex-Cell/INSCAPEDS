import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { clearDriveCache, prefetchAllProjects, isDriveConfigured } from "../lib/drive";

export default function DriveRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [showButton, setShowButton] = useState(false);

  // Only show in dev/local mode
  const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  
  // Only show if Drive is configured
  if (!isDev || !isDriveConfigured()) return null;

  const handleRefresh = async () => {
    if (isRefreshing) return; // Prevent double-clicks
    
    setIsRefreshing(true);
    try {
      console.log("[DriveRefresh] Clearing cache and fetching fresh data...");
      clearDriveCache();
      await prefetchAllProjects();
      setLastRefresh(new Date().toLocaleTimeString());
      console.log("[DriveRefresh] Refresh complete!");
      alert("✓ Drive content refreshed successfully!");
      // Trigger page reload to show new data
      window.location.reload();
    } catch (err) {
      console.error("[DriveRefresh] Error:", err);
      alert("✗ Refresh failed. Check console for errors.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        title={`Last refreshed: ${lastRefresh || "not yet"}\n\nClick to manually refresh Drive content`}
        className="p-3 bg-ink-800 hover:bg-ink-700 disabled:bg-gray-400 text-sand-50 rounded-full shadow-lg transition-colors duration-200 hover:shadow-xl"
      >
        <RefreshCw size={20} className={isRefreshing ? "animate-spin" : "hover:rotate-180 transition-transform"} />
      </button>
      {lastRefresh && (
        <div className="absolute bottom-full right-0 mb-2 text-xs text-ink-600 bg-sand-50 px-2 py-1 rounded whitespace-nowrap shadow">
          Refreshed at {lastRefresh}
        </div>
      )}
    </div>
  );
}
