/**
 * Centralized REST API Service for SIH 2026 PS71
 * Connects React strictly to Flask REST backend (React -> Flask -> MongoDB)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.message || `HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err);
    throw err;
  }
}

export const apiService = {
  // Catchments / Locations
  getLocations: () => request('/locations'),
  getLocationById: (id) => request(`/locations/${id}`),

  // Weather Telemetry
  getWeatherAll: () => request('/weather'),
  getWeatherByLocation: (locationId) => request(`/weather/${locationId}`),

  // Heavy Rainfall Predictions
  getRainfallPrediction: (locationId) => request(`/predictions/rainfall/${locationId}`),
  predictCustomRainfall: (features) =>
    request('/predictions/rainfall', {
      method: 'POST',
      body: JSON.stringify(features),
    }),

  // Inundation Predictions
  getInundationPrediction: (locationId, rainMm = null) => {
    const q = rainMm !== null ? `?rain_mm=${rainMm}` : '';
    return request(`/predictions/inundation/${locationId}${q}`);
  },
  predictCustomInundation: (payload) =>
    request('/predictions/inundation', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Early Warnings
  getWarnings: (severity = '') => {
    const q = severity ? `?severity=${severity}` : '';
    return request(`/warnings${q}`);
  },
  getLocationWarning: (locationId) => request(`/warnings/${locationId}`),

  // Data Integration Stream Telemetry
  getDataSourcesStatus: () => request('/data-sources'),
  getHealth: () => request('/health'),
};
