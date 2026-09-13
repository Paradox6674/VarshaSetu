import React from 'react';
import { AlertTriangle, AlertOctagon, Info, ArrowRight } from 'lucide-react';

export default function WarningBanner({ warning, onNavigateToWarnings }) {
  if (!warning || warning.severity_color === 'GREEN') return null;

  const isRed = warning.severity_color === 'RED';
  const isOrange = warning.severity_color === 'ORANGE';

  const bgStyles = isRed
    ? 'bg-rose-50 border-rose-300 text-rose-950'
    : isOrange
    ? 'bg-amber-50 border-amber-300 text-amber-950'
    : 'bg-yellow-50 border-yellow-200 text-yellow-900';

  const badgeStyles = isRed
    ? 'bg-rose-600 text-white'
    : isOrange
    ? 'bg-orange-600 text-white'
    : 'bg-yellow-500 text-white';

  const IconComponent = isRed ? AlertOctagon : isOrange ? AlertTriangle : Info;

  return (
    <div className={`w-full border-b px-4 py-3 shadow-sm transition-all duration-300 ${bgStyles}`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-1.5 rounded-lg bg-white/70 shadow-sm border border-black/5 mt-0.5 sm:mt-0">
            <IconComponent className={`w-5 h-5 ${isRed ? 'text-rose-600 animate-pulse' : isOrange ? 'text-orange-600' : 'text-yellow-600'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${badgeStyles}`}>
                {warning.severity_color} ALERT
              </span>
              <span className="font-semibold text-sm">
                {warning.warning_title} — {warning.location_name}
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-0.5 line-clamp-1 sm:line-clamp-none">
              Rainfall: <strong className="font-semibold">{warning.rainfall_trigger?.predicted_3h_accumulation_mm} mm/3h</strong> ({warning.rainfall_trigger?.intensity_class}) | Inundation: <strong className="font-semibold">{warning.inundation_trigger?.risk_tier}</strong> (Peak depth: {warning.inundation_trigger?.peak_waterlogging_depth_cm} cm)
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToWarnings}
          className="self-end sm:self-center flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 shadow-sm transition-colors whitespace-nowrap"
        >
          <span>View Disaster Advisory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
