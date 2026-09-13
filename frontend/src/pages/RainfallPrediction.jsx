import React from 'react';
import { 
  CloudRain, 
  Radio, 
  TrendingUp, 
  Wind, 
  Droplets, 
  Gauge, 
  Eye, 
  Info, 
  CheckCircle2, 
  BarChart2, 
  Layers
} from 'lucide-react';
import RainfallChart from '../components/RainfallChart';
import StatusBadge from '../components/StatusBadge';

export default function RainfallPrediction({ locationData, rainfallData, onOpenWhatIf }) {
  const prediction = rainfallData?.prediction;
  const telemetry = rainfallData?.meteorological_telemetry;
  const attributions = rainfallData?.feature_attributions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              AI/ML Heavy Rainfall Predictive Intelligence
            </h2>
            <StatusBadge fidelity={rainfallData?.data_fidelity || 'SIMULATED'} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Nowcasting & short-range quantitative precipitation forecasting for {locationData?.name}
          </p>
        </div>

        <button
          onClick={onOpenWhatIf}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-scientific-600 text-white hover:bg-scientific-700 shadow-sm transition-colors self-start sm:self-auto"
        >
          Simulate Storm Parameters
        </button>
      </div>

      {/* Main Prediction & Timeline Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Multi-Horizon Quantitative Forecast (QPE/QPF)
              </h3>
              <p className="text-xs text-slate-500">
                Calibrated ensemble combining Radar reflectivity, Satellite Tb, AWS gauges, and NWP fields
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-scientific-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-md">
                IMD {prediction?.rainfall_intensity_class?.toUpperCase()}
              </span>
            </div>
          </div>

          <RainfallChart timeline={prediction?.timeline} currentIntensity={prediction?.rainfall_intensity_class} />

          {/* Forecast Horizon Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {prediction?.timeline?.map((t, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">{t.horizon}</span>
                <span className="text-lg font-bold font-mono text-slate-900 mt-0.5 block">{t.accumulated_mm} mm</span>
                <span className="text-[10px] text-slate-400">+{t.hours}h accumulation</span>
              </div>
            ))}
          </div>
        </div>

        {/* Explainability & Feature Contribution Breakdown */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-scientific-600" />
                <span>Feature Attribution (XAI)</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Weight %</span>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Relative importance of each sensor feed in computing the current 3-hour precipitation output:
            </p>

            <div className="space-y-3.5">
              {attributions.map((attr, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-800">{attr.source}</span>
                    <span className="font-mono font-bold text-scientific-800">{attr.weight_pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-scientific-600 rounded-full"
                      style={{ width: `${attr.weight_pct}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>Observed Value:</span>
                    <span className="font-semibold text-slate-700">{attr.indicator}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>Complies with PS71 explainability standards. Weights dynamically scale with convective storm severity.</span>
          </div>
        </div>
      </div>

      {/* Physics Validation & Sensor Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Radar Z-R Card */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Radar Physics (Marshall-Palmer)</span>
            <Radio className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="my-1">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {telemetry?.radar_dwr?.radar_reflectivity_dbz} dBZ
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              Instantaneous Rate: <strong className="text-slate-800 font-mono">{prediction?.derived_physics?.marshall_palmer_radar_rate_mm_h} mm/h</strong>
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-100">
            Formula: Z = 200 * R^1.6
          </div>
        </div>

        {/* Satellite Cloud-Top Card */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Satellite IR Convective Tops</span>
            <Eye className="w-4 h-4 text-sky-600" />
          </div>
          <div className="my-1">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {telemetry?.satellite_insat?.sat_brightness_temp_k} K
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              Cloud Top Cooling: <strong className="text-slate-800 font-mono">{telemetry?.satellite_insat?.sat_cloud_top_cooling_rate} K/h</strong>
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-100">
            {prediction?.derived_physics?.cloud_top_convective_strength}
          </div>
        </div>

        {/* NWP Convective Instability Card */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">NWP Convective Instability</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="my-1">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {telemetry?.nwp_wrf?.nwp_cape_j_kg} J/kg
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              Precipitable Water: <strong className="text-slate-800 font-mono">{telemetry?.nwp_wrf?.nwp_pwat_mm} mm</strong>
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-100">
            Lifted Index: {telemetry?.nwp_wrf?.lifted_index}
          </div>
        </div>

        {/* Surface Barometric Tendency Card */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Surface AWS Barometer</span>
            <Gauge className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="my-1">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {telemetry?.observational_aws?.aws_pressure_hpa} hPa
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              3h Tendency: <strong className={`font-mono ${(telemetry?.observational_aws?.aws_pressure_tendency_3h || 0) < -1.5 ? 'text-rose-600' : 'text-slate-800'}`}>{telemetry?.observational_aws?.aws_pressure_tendency_3h} hPa</strong>
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-100">
            Gauge 24h: {telemetry?.observational_aws?.aws_rain_gauge_last_24h_mm} mm
          </div>
        </div>
      </div>
    </div>
  );
}
