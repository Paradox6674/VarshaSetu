import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LiveWeatherCanvas from './components/LiveWeatherCanvas';
import WarningBanner from './components/WarningBanner';
import WhatIfSimulatorModal from './components/WhatIfSimulatorModal';
import Dashboard from './pages/Dashboard';
import RainfallPrediction from './pages/RainfallPrediction';
import InundationPrediction from './pages/InundationPrediction';
import DataIntegration from './pages/DataIntegration';
import WarningsPage from './pages/WarningsPage';
import { apiService } from './services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState('mumbai_coastal');

  const [rainfallData, setRainfallData] = useState(null);
  const [inundationData, setInundationData] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [streamTelemetry, setStreamTelemetry] = useState(null);

  const [isLiveWallpaperActive, setIsLiveWallpaperActive] = useState(true);
  const [isWhatIfModalOpen, setIsWhatIfModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // 1. Initial Load: Locations, Warnings & Stream Telemetry
  useEffect(() => {
    async function initApp() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const [locRes, warnRes, teleRes] = await Promise.all([
          apiService.getLocations(),
          apiService.getWarnings(),
          apiService.getDataSourcesStatus(),
        ]);

        const locs = locRes.data.locations || [];
        setLocations(locs);
        if (locs.length > 0 && !selectedLocationId) {
          setSelectedLocationId(locs[0].id);
        }

        setWarnings(warnRes.data.warnings || []);
        setStreamTelemetry(teleRes.data || null);
      } catch (err) {
        console.error('Failed to initialize app from REST API:', err);
        setErrorMsg('Could not connect to Flask REST backend. Ensure backend is running on port 5000.');
      } finally {
        setLoading(false);
      }
    }
    initApp();
  }, []);

  // 2. Fetch Location-specific Predictions when selected location changes
  useEffect(() => {
    if (!selectedLocationId) return;

    async function fetchLocationData() {
      try {
        const [rainRes, inundRes] = await Promise.all([
          apiService.getRainfallPrediction(selectedLocationId),
          apiService.getInundationPrediction(selectedLocationId),
        ]);
        setRainfallData(rainRes.data);
        setInundationData(inundRes.data);
      } catch (err) {
        console.error(`Error loading predictions for ${selectedLocationId}:`, err);
      }
    }

    fetchLocationData();
  }, [selectedLocationId]);

  // Handler for custom rainfall override from Inundation page slider
  const handleSimulateRainfall = async (rainMm) => {
    try {
      const inundRes = await apiService.getInundationPrediction(selectedLocationId, rainMm);
      setInundationData(inundRes.data);
    } catch (err) {
      console.error('Failed to stress-test inundation:', err);
    }
  };

  const currentLocation = locations.find((l) => l.id === selectedLocationId) || locations[0];
  const activeLocationWarning = warnings.find((w) => w.location_id === selectedLocationId);
  const redOrangeWarningCount = warnings.filter((w) => w.severity_color === 'RED' || w.severity_color === 'ORANGE').length;

  return (
    <div className="relative min-h-screen flex flex-col font-sans">
      {/* Live Scientific Atmospheric Wallpaper Canvas */}
      <LiveWeatherCanvas
        isLiveActive={isLiveWallpaperActive}
        intensity={rainfallData?.prediction?.rainfall_intensity_class === 'Extremely Heavy' ? 'storm' : 'normal'}
      />

      {/* Main UI Layer (z-10) */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          locations={locations}
          selectedLocationId={selectedLocationId}
          setSelectedLocationId={setSelectedLocationId}
          isLiveWallpaperActive={isLiveWallpaperActive}
          setIsLiveWallpaperActive={setIsLiveWallpaperActive}
          onOpenWhatIfModal={() => setIsWhatIfModalOpen(true)}
          activeWarningCount={redOrangeWarningCount}
        />

        {/* Early Warning Banner for active location */}
        <WarningBanner
          warning={activeLocationWarning}
          onNavigateToWarnings={() => setActiveTab('warnings')}
        />

        {/* Backend Unavailable Error Notice */}
        {errorMsg && (
          <div className="max-w-7xl mx-auto px-4 mt-4 w-full">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-1 font-semibold underline hover:text-amber-950"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
          {loading && !rainfallData ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-scientific-600" />
              <span className="text-xs font-mono font-medium">
                Initializing SIH 2026 PS71 Multi-Sensor Engine...
              </span>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  locationData={currentLocation}
                  rainfallData={rainfallData}
                  inundationData={inundationData}
                  activeWarning={activeLocationWarning}
                  onNavigateToTab={setActiveTab}
                  onOpenWhatIf={() => setIsWhatIfModalOpen(true)}
                />
              )}

              {activeTab === 'rainfall' && (
                <RainfallPrediction
                  locationData={currentLocation}
                  rainfallData={rainfallData}
                  onOpenWhatIf={() => setIsWhatIfModalOpen(true)}
                />
              )}

              {activeTab === 'inundation' && (
                <InundationPrediction
                  locationData={currentLocation}
                  inundationData={inundationData}
                  onSimulateRainfall={handleSimulateRainfall}
                />
              )}

              {activeTab === 'integration' && (
                <DataIntegration streamTelemetry={streamTelemetry} />
              )}

              {activeTab === 'warnings' && (
                <WarningsPage
                  warnings={warnings}
                  onSelectLocation={(id) => {
                    setSelectedLocationId(id);
                    setActiveTab('dashboard');
                  }}
                />
              )}
            </>
          )}
        </main>

        {/* What-If Storm Simulator Modal */}
        <WhatIfSimulatorModal
          isOpen={isWhatIfModalOpen}
          onClose={() => setIsWhatIfModalOpen(false)}
          currentLocation={currentLocation}
        />

        {/* Scientific Government / Research Footer */}
        <footer className="w-full border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-4 mt-12 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div>
              <span className="font-semibold text-slate-700">SIH 2026 PS71</span> — AI/ML-Based Integrated Heavy Rainfall Early Warning & Inundation Prediction System
              <div className="text-[11px] text-slate-400 mt-0.5">
                Loop Engineering: Understand • Design • Implement • Test • Evaluate • Improve • Repeat
              </div>
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              React 18 • Flask 3.0 • MongoDB • scikit-learn
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
