import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Download, 
  ShieldAlert, 
  Filter,
  Check
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function WarningsPage({ warnings = [], onSelectLocation }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const filteredWarnings = warnings.filter((w) => {
    if (filterSeverity === 'ALL') return true;
    return w.severity_color === filterSeverity;
  });

  const getSeverityClasses = (color) => {
    switch (color) {
      case 'RED':
        return {
          card: 'border-l-4 border-l-rose-600 bg-rose-50/30',
          badge: 'bg-rose-600 text-white',
          text: 'text-rose-900',
          icon: AlertOctagon,
          iconColor: 'text-rose-600',
        };
      case 'ORANGE':
        return {
          card: 'border-l-4 border-l-orange-500 bg-orange-50/30',
          badge: 'bg-orange-600 text-white',
          text: 'text-orange-900',
          icon: AlertTriangle,
          iconColor: 'text-orange-600',
        };
      case 'YELLOW':
        return {
          card: 'border-l-4 border-l-yellow-400 bg-yellow-50/30',
          badge: 'bg-yellow-500 text-white',
          text: 'text-yellow-900',
          icon: Info,
          iconColor: 'text-yellow-600',
        };
      default:
        return {
          card: 'border-l-4 border-l-emerald-500 bg-emerald-50/20',
          badge: 'bg-emerald-600 text-white',
          text: 'text-emerald-900',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600',
        };
    }
  };

  const downloadAdvisory = (warning) => {
    const text = `
============================================================
IMD-STANDARDIZED HEAVY RAINFALL & INUNDATION WARNING ADVISORY
SIH 2026 PS71 EARLY WARNING SYSTEM
============================================================
Warning ID: ${warning.warning_id}
Catchment Basin: ${warning.location_name} (${warning.region})
Alert Severity: ${warning.severity_color}
Issued At: ${warning.issued_at}
Valid Until: ${warning.valid_until}

METEOROLOGICAL TRIGGER:
- Predicted 3-Hour Accumulation: ${warning.rainfall_trigger?.predicted_3h_accumulation_mm} mm
- Rainfall Intensity Category: ${warning.rainfall_trigger?.intensity_class}

HYDROLOGICAL INUNDATION TRIGGER:
- Catchment Flood Risk Tier: ${warning.inundation_trigger?.risk_tier}
- Peak Localized Underpass Depth: ${warning.inundation_trigger?.peak_waterlogging_depth_cm} cm

PREEMPTIVE DISASTER MANAGEMENT PROTOCOLS:
${warning.action_guidelines?.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Data Fidelity: ${warning.data_fidelity}
Generated via Loop Engineering PS71 Predictive Framework.
============================================================
`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ADVISORY_${warning.location_id}_${warning.severity_color}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Actionable Early Warnings & Disaster Advisories
            </h2>
            <StatusBadge fidelity="SIMULATED" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic threshold-driven early warnings synthesized directly from backend ML predictions
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm self-start sm:self-auto">
          {['ALL', 'RED', 'ORANGE', 'YELLOW', 'GREEN'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterSeverity === sev
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Warnings List */}
      <div className="space-y-4">
        {filteredWarnings.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-slate-400 text-sm">
            No warnings match the selected severity filter.
          </div>
        ) : (
          filteredWarnings.map((warning) => {
            const styling = getSeverityClasses(warning.severity_color);
            const IconComponent = styling.icon;

            return (
              <div
                key={warning.warning_id}
                className={`glass-card rounded-2xl p-5 shadow-sm transition-all space-y-4 ${styling.card}`}
              >
                {/* Warning Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-200">
                      <IconComponent className={`w-6 h-6 ${styling.iconColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${styling.badge}`}>
                          {warning.severity_color} ALERT
                        </span>
                        <h3 className="font-bold text-slate-900 text-base">
                          {warning.warning_title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{warning.location_name} ({warning.region})</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => downloadAdvisory(warning)}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
                      title="Download Official Plain-Text Advisory"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Notice</span>
                    </button>
                  </div>
                </div>

                {/* Triggers Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-white/80 border border-slate-200/70">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Predicted Rainfall</span>
                    <span className="text-base font-bold font-mono text-slate-900 block mt-0.5">
                      {warning.rainfall_trigger?.predicted_3h_accumulation_mm} mm/3h
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Category: {warning.rainfall_trigger?.intensity_class}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/80 border border-slate-200/70">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Inundation Risk</span>
                    <span className="text-base font-bold text-slate-900 block mt-0.5">
                      {warning.inundation_trigger?.risk_tier} RISK
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Peak Depth: {warning.inundation_trigger?.peak_waterlogging_depth_cm} cm
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/80 border border-slate-200/70">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Issued At</span>
                    <span className="text-xs font-mono font-semibold text-slate-800 block mt-1">
                      {new Date(warning.issued_at).toLocaleTimeString()} IST
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Valid for 6 hours
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/80 border border-slate-200/70">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Urgency Protocol</span>
                    <span className="text-xs font-bold font-mono text-scientific-700 block mt-1">
                      {warning.urgency}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Disaster management tier
                    </span>
                  </div>
                </div>

                {/* Preemptive Action Checklists */}
                <div className="bg-white/80 p-4 rounded-xl border border-slate-200/70 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Disaster Mitigation & Preemptive Civic Actions
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {warning.action_guidelines?.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
