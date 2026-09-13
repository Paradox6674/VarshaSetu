import React, { useState } from 'react';
import { X, Sliders, RefreshCw, Zap, AlertTriangle, ShieldCheck, Check } from 'lucide-react';
import { apiService } from '../services/api';

export default function WhatIfSimulatorModal({ isOpen, onClose, currentLocation, onApplySimulation }) {
  if (!isOpen) return null;

  const [dbz, setDbz] = useState(48.0);
  const [tbK, setTbK] = useState(212.0);
  const [gaugeRain, setGaugeRain] = useState(22.0);
  const [nwpPrecip, setNwpPrecip] = useState(35.0);
  const [cape, setCape] = useState(2800.0);
  const [drainageScore, setDrainageScore] = useState(currentLocation?.drainage_capacity_score || 4.2);

  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      // 1. Predict rainfall
      const rainRes = await apiService.predictCustomRainfall({
        radar_reflectivity_dbz: parseFloat(dbz),
        sat_brightness_temp_k: parseFloat(tbK),
        aws_rain_gauge_last_1h_mm: parseFloat(gaugeRain),
        nwp_precip_forecast_3h_mm: parseFloat(nwpPrecip),
        nwp_cape_j_kg: parseFloat(cape),
        aws_rh_pct: 92.0,
        aws_pressure_tendency_3h: -2.4,
      });

      const predictedRainMm = rainRes.data.predicted_rainfall_3h_mm;

      // 2. Predict inundation
      const inundRes = await apiService.predictCustomInundation({
        predicted_rainfall_3h_mm: predictedRainMm,
        prior_rain_gauge_1h_mm: parseFloat(gaugeRain),
        drainage_capacity_score: parseFloat(drainageScore),
        catchment_elevation_m: currentLocation?.catchment_elevation_m || 10.0,
        catchment_slope_deg: currentLocation?.catchment_slope_deg || 1.5,
        soil_saturation_index: 0.85,
      });

      setSimResult({
        rainfall: rainRes.data,
        inundation: inundRes.data,
      });
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (presetType) => {
    if (presetType === 'cloudburst') {
      setDbz(58.5);
      setTbK(198.0);
      setGaugeRain(45.0);
      setNwpPrecip(70.0);
      setCape(3600.0);
      setDrainageScore(3.0);
    } else if (presetType === 'moderate') {
      setDbz(32.0);
      setTbK(240.0);
      setGaugeRain(6.0);
      setNwpPrecip(14.0);
      setCape(1400.0);
      setDrainageScore(6.0);
    } else {
      // Clear / light
      setDbz(16.0);
      setTbK(275.0);
      setGaugeRain(0.0);
      setNwpPrecip(1.0);
      setCape(600.0);
      setDrainageScore(7.5);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Interactive Storm Scenario Simulator
              </h3>
              <p className="text-xs text-slate-500">
                Tweak multi-sensor parameters to evaluate AI/ML model sensitivity for {currentLocation?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Simulation Presets
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => loadPreset('cloudburst')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Severe Convective Downpour (58 dBZ)</span>
              </button>
              <button
                onClick={() => loadPreset('moderate')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Moderate Monsoon Squall (32 dBZ)</span>
              </button>
              <button
                onClick={() => loadPreset('clear')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Light / Fair Weather (16 dBZ)</span>
              </button>
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Radar dBZ */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-slate-700">Radar Reflectivity (Z)</span>
                <span className="text-xs font-mono font-bold text-sky-700">{dbz} dBZ</span>
              </div>
              <input
                type="range"
                min="10"
                max="65"
                step="0.5"
                value={dbz}
                onChange={(e) => setDbz(e.target.value)}
                className="w-full accent-scientific-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Marshall-Palmer relation R = (10^(Z/10)/200)^0.625</span>
            </div>

            {/* Satellite Tb */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-slate-700">Satellite IR Cloud-Top (Tb)</span>
                <span className="text-xs font-mono font-bold text-sky-700">{tbK} K</span>
              </div>
              <input
                type="range"
                min="195"
                max="285"
                step="1"
                value={tbK}
                onChange={(e) => setTbK(e.target.value)}
                className="w-full accent-scientific-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Lower &lt;215K indicates high convective anvil cloud tops</span>
            </div>

            {/* Prior Rain Gauge */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-slate-700">AWS Prior 1-Hour Rain</span>
                <span className="text-xs font-mono font-bold text-sky-700">{gaugeRain} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="0.5"
                value={gaugeRain}
                onChange={(e) => setGaugeRain(e.target.value)}
                className="w-full accent-scientific-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Antecedent moisture saturating soil column</span>
            </div>

            {/* NWP CAPE */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-slate-700">NWP Convective Instability (CAPE)</span>
                <span className="text-xs font-mono font-bold text-sky-700">{cape} J/kg</span>
              </div>
              <input
                type="range"
                min="300"
                max="4200"
                step="50"
                value={cape}
                onChange={(e) => setCape(e.target.value)}
                className="w-full accent-scientific-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block mt-1">&gt;2000 J/kg indicates high thermodynamic energy</span>
            </div>

            {/* Catchment Drainage Score */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 md:col-span-2">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-slate-700">Catchment Storm Drainage Capacity</span>
                <span className="text-xs font-mono font-bold text-sky-700">{drainageScore} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={drainageScore}
                onChange={(e) => setDrainageScore(e.target.value)}
                className="w-full accent-scientific-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block mt-1">1 = severely silted/blocked culverts; 10 = newly dredged, high-flow storm canals</span>
            </div>
          </div>

          {/* Execute Button */}
          <div className="flex justify-end">
            <button
              onClick={runSimulation}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-scientific-600 text-white font-semibold text-sm hover:bg-scientific-700 shadow-md shadow-scientific-600/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Running ML Pipeline...' : 'Run Simulation Forecast'}</span>
            </button>
          </div>

          {/* Results Display */}
          {simResult && (
            <div className="p-4 rounded-xl bg-slate-900 text-white animate-in zoom-in-95 duration-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-sky-400" />
                  <span className="font-bold text-sm">Simulated ML Prediction Output</span>
                </div>
                <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  {simResult.rainfall.model_engine}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">3-Hour Accumulation</span>
                  <span className="text-xl font-bold font-mono text-sky-300">
                    {simResult.rainfall.predicted_rainfall_3h_mm} mm
                  </span>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Intensity Tier</span>
                  <span className="text-sm font-bold text-amber-300">
                    {simResult.rainfall.rainfall_intensity_class}
                  </span>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Inundation Risk</span>
                  <span className={`text-base font-bold ${
                    simResult.inundation.inundation_risk_tier === 'SEVERE' ? 'text-rose-400' :
                    simResult.inundation.inundation_risk_tier === 'HIGH' ? 'text-orange-400' :
                    simResult.inundation.inundation_risk_tier === 'MODERATE' ? 'text-yellow-400' : 'text-emerald-400'
                  }`}>
                    {simResult.inundation.inundation_risk_tier}
                  </span>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Waterlogging Depth</span>
                  <span className="text-xl font-bold font-mono text-cyan-300">
                    {simResult.inundation.estimated_waterlogging_depth_cm} cm
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-slate-800/50 p-2.5 rounded border border-slate-700/50">
                <strong>Hydrological Action Note:</strong> {simResult.inundation.advisory_notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
