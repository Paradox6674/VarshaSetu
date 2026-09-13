import React from 'react';
import { ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';

/**
 * StatusBadge ensures scientific realism:
 * Explicitly distinguishes LIVE DATA, SIMULATED DATA, and HISTORICAL DATA.
 */
export default function StatusBadge({ fidelity = 'SIMULATED', size = 'md' }) {
  const isLive = fidelity.toUpperCase().includes('LIVE');
  const isSimulated = fidelity.toUpperCase().includes('SIMULAT');
  const isHistorical = fidelity.toUpperCase().includes('HISTORIC');

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  if (isLive) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>LIVE DATA STREAM</span>
      </span>
    );
  }

  if (isSimulated) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 ${sizeClasses}`}>
        <Activity className="w-3.5 h-3.5 text-sky-600" />
        <span className="font-mono tracking-wide">SIMULATED DATA ADAPTER</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
      <ShieldAlert className="w-3.5 h-3.5" />
      <span>HISTORICAL ARCHIVE</span>
    </span>
  );
}
