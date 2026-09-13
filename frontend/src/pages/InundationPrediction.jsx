import React, { useState } from 'react';
import { 
  Waves, 
  MapPin, 
  AlertTriangle, 
  Droplets, 
  ShieldCheck, 
  Sliders, 
  ArrowRight, 
  CheckCircle, 
  Building2,
  HelpCircle
} from 'lucide-react';
import InundationMap from '../components/InundationMap';
import StatusBadge from '../components/StatusBadge';

export default function InundationPrediction({ locationData, inundationData, onSimulateRainfall }) {
  const summary = inundationData?.hydrological_summary;
  const hotspots = inundationData?.localized_hotspots || [];
  const rainForecast = inundationData?.associated_rainfall_forecast;
  const topo = summary?.topographic_factors;

  const [rainSlider, setRainSlider] = useState(rainForecast?.predicted_3h_accumulation_mm || 35.0);

  const handleSliderCommit = () => {
    if (onSimulateRainfall) {
      onSimulateRainfall(parseFloat(rainSlider));
    }
  };

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'SEVERE':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Hydrological Inundation & Urban Runoff Intelligence
            </h2>
            <StatusBadge fidelity={inundationData?.data_fidelity || 'SIMULATED'} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Topographic runoff modeling (SCS Curve Number) and localized bottleneck waterlogging for {locationData?.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Catchment Basin:</span>
          <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            {locationData?.name}
          </span>
        </div>
      </div>

      {/* Hydrological Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Risk Tier */}
        <div className="glass-card rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Inundation Risk Tier</span>
          <div className="flex items-center gap-2">
            <span className={`text-base font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${getTierBadge(summary?.inundation_risk_tier)}`}>
              {summary?.inundation_risk_tier} RISK
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-2">
            Runoff Hazard Score: <strong className="text-slate-800 font-mono">{summary?.runoff_hazard_score} / 100</strong>
          </span>
        </div>

        {/* Peak Waterlogging Depth */}
        <div className="glass-card rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Estimated Waterlogging Depth</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-scientific-800">
              {summary?.estimated_waterlogging_depth_cm}
            </span>
            <span className="text-xs font-semibold text-slate-500">centimeters</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Average across low-lying underpasses
          </span>
        </div>

        {/* Time to Peak Runoff */}
        <div className="glass-card rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Time to Peak Basin Runoff</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              +{summary?.time_to_peak_runoff_hours}
            </span>
            <span className="text-xs font-semibold text-slate-500">hours</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Hydraulic response lag post-cloudburst
          </span>
        </div>

        {/* Drainage Capacity */}
        <div className="glass-card rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Drainage Discharge Efficiency</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {topo?.drainage_efficiency_pct}%
            </span>
            <span className="text-xs font-semibold text-slate-500">design capacity</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Soil Column Saturation: <strong className="text-slate-800 font-mono">{topo?.soil_saturation_pct}%</strong>
          </span>
        </div>
      </div>

      {/* Interactive Catchment Map */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Catchment Vulnerability & Localized Waterlogging Hotspots
            </h3>
            <p className="text-xs text-slate-500">
              Interactive geographic model mapping localized underpasses, subways, and vulnerable road corridors
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Click a node to inspect mitigation advisory</span>
          </div>
        </div>

        <InundationMap
          location={locationData}
          hotspots={hotspots}
          overallRiskTier={summary?.inundation_risk_tier}
        />
      </div>

      {/* Dynamic What-If Inundation Stress Slider */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-scientific-600" />
            <h4 className="font-bold text-slate-900 text-sm">
              Catchment Stress Simulator: Vary Rain Accumulation
            </h4>
          </div>
          <span className="text-xs font-mono font-bold text-scientific-700 bg-sky-50 px-2.5 py-1 rounded border border-sky-200">
            {rainSlider} mm Rain Surge
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>5 mm (Routine Shower)</span>
            <span>45 mm (Heavy Rain)</span>
            <span>85 mm (Very Heavy)</span>
            <span>150 mm (Extreme Cloudburst)</span>
          </div>
          <input
            type="range"
            min="5"
            max="150"
            step="1"
            value={rainSlider}
            onChange={(e) => setRainSlider(e.target.value)}
            onMouseUp={handleSliderCommit}
            onTouchEnd={handleSliderCommit}
            className="w-full accent-scientific-600 cursor-pointer"
          />
          <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
            <span>Drag slider to recalculate waterlogging depths and municipal pump allocations in real time.</span>
            <button
              onClick={handleSliderCommit}
              className="text-xs font-semibold text-scientific-700 hover:text-scientific-800 bg-white border border-slate-200 px-3 py-1 rounded-md shadow-sm"
            >
              Apply Stress Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
