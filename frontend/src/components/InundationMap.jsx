import React, { useState } from 'react';
import { MapPin, AlertTriangle, Waves, ShieldCheck, ChevronRight, Info } from 'lucide-react';

export default function InundationMap({ location, hotspots = [], overallRiskTier = 'MODERATE' }) {
  const [selectedHotspot, setSelectedHotspot] = useState(hotspots[0] || null);

  const getTierColor = (tier) => {
    switch (tier) {
      case 'SEVERE':
        return { bg: 'bg-rose-500', text: 'text-rose-600', badge: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'HIGH':
        return { bg: 'bg-orange-500', text: 'text-orange-600', badge: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'MODERATE':
        return { bg: 'bg-yellow-500', text: 'text-yellow-600', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
      default:
        return { bg: 'bg-emerald-500', text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4">
      {/* Map Graphic Canvas Container */}
      <div className="flex-1 min-h-[320px] rounded-2xl bg-slate-100 border border-slate-200 p-4 relative overflow-hidden flex flex-col justify-between">
        {/* Layer Badge & Legend */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-sm border border-slate-200 text-[11px] font-mono text-slate-700 font-semibold shadow-sm">
              HYDRAULIC BASIN: {location?.name}
            </span>
            <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-mono font-medium border border-sky-200">
              SIMULATED TOPOGRAPHY
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 shadow-sm">
            <Waves className="w-3.5 h-3.5 text-sky-600" />
            <span>Elev: {location?.catchment_elevation_m}m | Slope: {location?.catchment_slope_deg}°</span>
          </div>
        </div>

        {/* Catchment Schematic Simulation Canvas */}
        <div className="my-auto py-6 flex items-center justify-center relative">
          {/* Subtle topo contours background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <div className="w-72 h-72 rounded-full border-2 border-dashed border-sky-400"></div>
            <div className="w-52 h-52 rounded-full border border-sky-300 absolute"></div>
            <div className="w-32 h-32 rounded-full border border-sky-200 absolute"></div>
          </div>

          {/* Hotspot Nodes Scattered Across Catchment */}
          <div className="relative w-full max-w-md h-48 flex flex-wrap items-center justify-around gap-4 z-10">
            {hotspots.map((spot, idx) => {
              const colors = getTierColor(spot.sector_risk_tier);
              const isSelected = selectedHotspot?.zone_name === spot.zone_name;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedHotspot(spot)}
                  className={`group relative flex flex-col items-center transition-all transform hover:scale-105 ${
                    isSelected ? 'scale-110 z-20' : 'opacity-85'
                  }`}
                >
                  <div className={`p-2.5 rounded-full shadow-md text-white transition-all ${colors.bg} ${isSelected ? 'ring-4 ring-sky-300 ring-offset-2' : ''}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="mt-1 px-2 py-0.5 rounded-md bg-white/95 border border-slate-200 text-[11px] font-semibold text-slate-800 shadow-sm whitespace-nowrap">
                    {spot.zone_name}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 mt-0.5">
                    {spot.predicted_waterlogging_depth_cm} cm
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 z-10 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-slate-200 w-fit">
          <Info className="w-3 h-3 text-slate-400" />
          <span>Demonstration spatial representation of low-lying catchment sub-basins.</span>
        </div>
      </div>

      {/* Selected Hotspot Inspector Panel */}
      <div className="w-full lg:w-80 glass-card rounded-2xl p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Hotspot Inundation Profile
            </span>
            {selectedHotspot && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getTierColor(selectedHotspot.sector_risk_tier).badge}`}>
                {selectedHotspot.sector_risk_tier} RISK
              </span>
            )}
          </div>

          {selectedHotspot ? (
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-slate-900 text-base">{selectedHotspot.zone_name}</h4>
                <p className="text-xs text-slate-500">{selectedHotspot.relative_elevation}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-500 block">Predicted Waterlogging Depth</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold font-mono text-scientific-800">
                    {selectedHotspot.predicted_waterlogging_depth_cm}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">centimeters</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-700">Preemptive Public Health & Traffic Action</span>
                <p className="text-xs text-slate-600 bg-amber-50/70 border border-amber-200/70 p-2.5 rounded-lg leading-relaxed">
                  {selectedHotspot.recommended_action}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select a catchment hotspot on the map to inspect waterlogging projections.
            </div>
          )}
        </div>

        {/* Hotspots Summary List */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
            Monitored Vulnerable Sectors ({hotspots.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {hotspots.map((h, i) => (
              <button
                key={i}
                onClick={() => setSelectedHotspot(h)}
                className={`text-[10px] px-2 py-1 rounded-md border font-medium transition-colors ${
                  selectedHotspot?.zone_name === h.zone_name
                    ? 'bg-scientific-100 text-scientific-800 border-scientific-300 font-semibold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {h.zone_name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
