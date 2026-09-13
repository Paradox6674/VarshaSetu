import React from 'react';
import { 
  CloudRain, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Layers, 
  ShieldCheck, 
  Radio, 
  Activity, 
  TrendingUp, 
  Waves,
  ArrowUpRight,
  Droplets,
  Wind,
  Gauge
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import RainfallChart from '../components/RainfallChart';

export default function Dashboard({
  locationData,
  rainfallData,
  inundationData,
  activeWarning,
  onNavigateToTab,
  onOpenWhatIf
}) {
  const prediction = rainfallData?.prediction;
  const inundation = inundationData?.hydrological_summary;
  const telemetry = rainfallData?.meteorological_telemetry;

  const getRiskColorClass = (tier) => {
    switch (tier) {
      case 'SEVERE': return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MODERATE': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    }
  };

  const getIntensityBadge = (intensity) => {
    switch (intensity) {
      case 'Extremely Heavy':
      case 'Very Heavy':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Heavy':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Catchment Context & Fidelity Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {locationData?.name}
            </h2>
            <StatusBadge fidelity={rainfallData?.data_fidelity || 'SIMULATED'} />
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>{locationData?.region}</span>
            <span>•</span>
            <span>Elevation: {locationData?.catchment_elevation_m}m</span>
            <span>•</span>
            <span>Radar: {locationData?.dwr_station}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWhatIf}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
          >
            Adjust Storm Parameters
          </button>
        </div>
      </div>

      {/* Six Key Questions Grid (Strict PS71 UX Rule) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Q1 & Q2: Where & How Severe */}
        <div className="glass-card glass-card-hover rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                1. Location & Expected Severity
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {prediction?.rainfall_intensity_class} Rainfall
              </h3>
            </div>
            <div className={`p-2 rounded-xl ${getIntensityBadge(prediction?.rainfall_intensity_class)}`}>
              <CloudRain className="w-5 h-5" />
            </div>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-slate-900">
                {prediction?.predicted_rainfall_3h_mm}
              </span>
              <span className="text-xs font-semibold text-slate-500">mm in next 3 hours</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              90% Prediction Interval: <span className="font-mono font-medium text-slate-700">{prediction?.prediction_interval_90_pct?.lower_mm} - {prediction?.prediction_interval_90_pct?.upper_mm} mm</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Instantaneous Radar Rate:</span>
            <span className="font-mono font-semibold text-slate-800">
              {prediction?.derived_physics?.marshall_palmer_radar_rate_mm_h} mm/h
            </span>
          </div>
        </div>

        {/* Q3: When is it expected */}
        <div className="glass-card glass-card-hover rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                2. Forecast Horizon & Timing
              </span>
              <h3 className="text-base font-bold text-slate-900">Peak Onset in Next 3h</h3>
            </div>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="my-3 space-y-1.5">
            {prediction?.timeline?.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-slate-600">{item.horizon}:</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {item.accumulated_mm} mm
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Runoff Peak Lag:</span>
            <span className="font-mono font-semibold text-sky-700">
              +{inundation?.time_to_peak_runoff_hours} hours post-deluge
            </span>
          </div>
        </div>

        {/* Q4: Predicted Inundation Risk */}
        <div className="glass-card glass-card-hover rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                3. Predicted Inundation Risk
              </span>
              <h3 className="text-base font-bold text-slate-900">Surface Waterlogging</h3>
            </div>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200">
              <Waves className="w-5 h-5" />
            </div>
          </div>

          <div className="my-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${getRiskColorClass(inundation?.inundation_risk_tier)}`}>
                {inundation?.inundation_risk_tier} RISK
              </span>
              <span className="text-2xl font-extrabold font-mono text-slate-900">
                {inundation?.estimated_waterlogging_depth_cm} cm
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
              {inundation?.advisory_notes}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">High-Risk Hotspots:</span>
            <button
              onClick={() => onNavigateToTab('inundation')}
              className="text-scientific-700 font-semibold flex items-center gap-0.5 hover:underline"
            >
              <span>{inundationData?.localized_hotspots?.length || 5} Sectors</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Q5: What data sources are contributing */}
        <div className="glass-card glass-card-hover rounded-2xl p-4 flex flex-col justify-between md:col-span-2">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                4. Multi-Source Ingestion & Feature Attribution (XAI)
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Relative Feature Influence on Active Forecast
              </h3>
            </div>
            <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              PS71 QUAD-STREAM
            </span>
          </div>

          <div className="space-y-2.5 my-2">
            {rainfallData?.feature_attributions?.map((attr, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-medium">{attr.source}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500">{attr.indicator}</span>
                    <span className="font-mono font-bold text-slate-900">{attr.weight_pct}%</span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-scientific-600 rounded-full"
                    style={{ width: `${attr.weight_pct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Model Engine: {prediction?.model_engine}</span>
            <button
              onClick={() => onNavigateToTab('integration')}
              className="text-scientific-700 font-medium hover:underline flex items-center gap-1"
            >
              <span>Inspect Telemetry</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Q6: Model Confidence & Reliability */}
        <div className="glass-card glass-card-hover rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                5. Model Confidence & Health
              </span>
              <h3 className="text-base font-bold text-slate-900">Ensemble Reliability</h3>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-emerald-700">
                {prediction?.model_confidence_pct}%
              </span>
              <span className="text-xs font-semibold text-slate-500">cross-sensor agreement</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Atmospheric Convective Strength: <strong className="text-slate-700 font-medium">{prediction?.derived_physics?.cloud_top_convective_strength}</strong>
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Thermodynamic Instability:</span>
            <span className="font-mono font-bold text-amber-600">
              {prediction?.derived_physics?.atmospheric_instability_index} / 100
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Live Observational Telemetry Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rainfall Accumulation Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Cumulative Rainfall Projection Timeline
              </h3>
              <p className="text-xs text-slate-500">
                Hourly accumulated precipitation curve for {locationData?.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-scientific-600"></span>
              <span className="text-xs font-semibold text-slate-700">Projected Runoff Rain (mm)</span>
            </div>
          </div>

          <RainfallChart
            timeline={prediction?.timeline}
            currentIntensity={prediction?.rainfall_intensity_class}
          />
        </div>

        {/* Real-Time Observational Telemetry Snapshot */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-scientific-600" />
                <span>Station Telemetry Snapshot</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                AWS + DWR
              </span>
            </div>

            <div className="space-y-3">
              {/* Prior Rain */}
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">AWS Prior 1-Hour Gauge</span>
                    <span className="text-[10px] text-slate-500">Tipping bucket sensor</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm text-slate-900">
                  {telemetry?.observational_aws?.aws_rain_gauge_last_1h_mm} mm
                </span>
              </div>

              {/* Radar Reflectivity */}
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Radar Reflectivity (Z)</span>
                    <span className="text-[10px] text-slate-500">{locationData?.dwr_station}</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm text-slate-900">
                  {telemetry?.radar_dwr?.radar_reflectivity_dbz} dBZ
                </span>
              </div>

              {/* Barometric Pressure Tendency */}
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-cyan-100 text-cyan-700">
                    <Gauge className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">3h Pressure Tendency</span>
                    <span className="text-[10px] text-slate-500">Squall line barometer</span>
                  </div>
                </div>
                <span className={`font-mono font-bold text-sm ${
                  (telemetry?.observational_aws?.aws_pressure_tendency_3h || 0) < -1.5 ? 'text-rose-600' : 'text-slate-900'
                }`}>
                  {telemetry?.observational_aws?.aws_pressure_tendency_3h} hPa
                </span>
              </div>

              {/* Convective Energy */}
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">NWP Instability (CAPE)</span>
                    <span className="text-[10px] text-slate-500">WRF-3km mesoscale</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm text-slate-900">
                  {telemetry?.nwp_wrf?.nwp_cape_j_kg} J/kg
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateToTab('warnings')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>View Emergency Action Protocols</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
