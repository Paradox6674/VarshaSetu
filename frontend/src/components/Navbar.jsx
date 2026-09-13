import React from 'react';
import { 
  CloudRain, 
  Layers, 
  AlertTriangle, 
  Radio, 
  Play, 
  Pause, 
  Sliders, 
  MapPin, 
  Activity, 
  Sparkles,
  BarChart3,
  Waves
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function Navbar({
  activeTab,
  setActiveTab,
  locations,
  selectedLocationId,
  setSelectedLocationId,
  isLiveWallpaperActive,
  setIsLiveWallpaperActive,
  onOpenWhatIfModal,
  activeWarningCount
}) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel-header">
      {/* Top Ministry / Institutional Bar */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1 text-xs font-mono flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-semibold text-white">VARSHA-SETU</span>
          <span className="text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-300">AI/ML Heavy Rainfall Early Warning & Inundation Prediction</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="hidden md:inline text-slate-400">Loop Engineering Architecture</span>
          <span className="bg-sky-950 text-sky-300 border border-sky-800 px-1.5 py-0.2 rounded text-[10px] font-semibold">
            METEOROLOGICAL PLATFORM
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Location Selector */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-scientific-700 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <CloudRain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-base leading-tight tracking-tight">
                  VARSHA-SETU
                </h1>
                <span className="text-[10px] bg-sky-50 text-sky-700 font-semibold px-1.5 py-0.5 rounded border border-sky-200">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Integrated Rainfall & Inundation Warning
              </p>
            </div>
          </div>

          {/* Location Selector Dropdown */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm">
              <MapPin className="w-4 h-4 text-scientific-600" />
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                aria-label="Monitored Catchment Location"
                className="text-xs font-semibold text-slate-800 bg-transparent outline-none cursor-pointer pr-1"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-scientific-600 text-white shadow-sm shadow-scientific-600/25'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('rainfall')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'rainfall'
                ? 'bg-scientific-600 text-white shadow-sm shadow-scientific-600/25'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Rainfall Prediction</span>
          </button>

          <button
            onClick={() => setActiveTab('inundation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'inundation'
                ? 'bg-scientific-600 text-white shadow-sm shadow-scientific-600/25'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Inundation Risk</span>
          </button>

          <button
            onClick={() => setActiveTab('integration')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'integration'
                ? 'bg-scientific-600 text-white shadow-sm shadow-scientific-600/25'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Data Ingestion</span>
          </button>

          <button
            onClick={() => setActiveTab('warnings')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'warnings'
                ? 'bg-scientific-600 text-white shadow-sm shadow-scientific-600/25'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Early Warnings</span>
            {activeWarningCount > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {activeWarningCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Tools: Wallpaper toggle & What-If Simulator */}
        <div className="flex items-center gap-2 justify-end">
          {/* Wallpaper Animation Toggle */}
          <button
            onClick={() => setIsLiveWallpaperActive(!isLiveWallpaperActive)}
            title={isLiveWallpaperActive ? 'Pause live weather canvas animation' : 'Resume live weather canvas animation'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            {isLiveWallpaperActive ? (
              <>
                <Pause className="w-3 h-3 text-slate-500" />
                <span className="hidden lg:inline text-[11px]">Live Canvas</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-emerald-600" />
                <span className="hidden lg:inline text-[11px] text-slate-500">Paused</span>
              </>
            )}
          </button>

          {/* What-If Simulator Modal Trigger */}
          <button
            onClick={onOpenWhatIfModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-800 hover:bg-sky-100 transition-colors shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-600" />
            <span>Simulate Storm</span>
          </button>
        </div>
      </div>
    </header>
  );
}
