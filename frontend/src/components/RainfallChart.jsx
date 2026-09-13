import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

export default function RainfallChart({ timeline = [], currentIntensity = 'Moderate' }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        No forecast timeline points available
      </div>
    );
  }

  // Custom tooltip for scientific light theme
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 text-xs font-sans">
          <p className="font-bold text-slate-900 mb-1">{data.horizon}</p>
          <p className="text-scientific-700 font-semibold font-mono">
            Accumulation: {data.accumulated_mm} mm
          </p>
          <p className="text-slate-500 text-[10px] mt-0.5">
            Forecast Horizon: +{data.hours} hours
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={timeline} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0284c7" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="horizon"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
            unit=" mm"
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* IMD Threshold Markers */}
          <ReferenceLine y={20} stroke="#ca8a04" strokeDasharray="4 4" label={{ value: 'Heavy Threshold (20mm/3h)', fill: '#ca8a04', fontSize: 10, position: 'insideTopRight' }} />
          <ReferenceLine y={45} stroke="#ea580c" strokeDasharray="4 4" label={{ value: 'Very Heavy (45mm/3h)', fill: '#ea580c', fontSize: 10, position: 'insideTopRight' }} />

          <Area
            type="monotone"
            dataKey="accumulated_mm"
            stroke="#0284c7"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#rainGradient)"
            name="Predicted Rain"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
