import React, { useState } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import LineChart from './lineChart';

const SensorChart = ({
  data,
  title = 'Sensor History (Last 7 Days)',
  availableMetrics = [],
  defaultSelectedMetrics = ['temperature', 'humidity'],
  height = 300,
  loading = false,
  error = null,
  onRefresh,
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState(defaultSelectedMetrics);

  const defaultMetricOptions = [
    { key: 'temperature', label: 'Temperature' },
    { key: 'humidity', label: 'Humidity' },
    { key: 'ph', label: 'pH Level' },
    { key: 'nitrogenNPK', label: 'NPK Nitrogen' },
  ];

  const metricOptions = availableMetrics.length > 0 ? availableMetrics : defaultMetricOptions;

  const handleMetricChange = (metricKey) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metricKey)) {
        return prev.length === 1 ? prev : prev.filter(m => m !== metricKey);
      }
      return [...prev, metricKey];
    });
  };

  const chartData = {
    labels: data?.labels || [],
    datasets: selectedMetrics.map(key => data?.datasets?.[key]).filter(Boolean),
  };

  // ── Loading skeleton ──────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-48 bg-gray-200 rounded" />
          <div className="flex gap-2">
            {[1, 2, 3].map(i => <div key={i} className="h-7 w-20 bg-gray-200 rounded-full" />)}
          </div>
        </div>
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  // ── Error state ───────────────────────────────
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center gap-4 min-h-[200px] border border-red-100">
        <AlertTriangle className="w-8 h-8 text-red-400" />
        <p className="text-sm text-red-600 font-medium">Failed to load sensor chart</p>
        <p className="text-xs text-gray-500">{error?.message || String(error)}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        )}
      </div>
    );
  }

  // ── Normal render ─────────────────────────────
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

        <div className="flex items-center flex-wrap gap-2">
          {metricOptions.map(metric => (
            <button
              key={metric.key}
              onClick={() => handleMetricChange(metric.key)}
              className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${selectedMetrics.includes(metric.key)
                  ? 'bg-blue-500 text-white shadow'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {metric.label}
            </button>
          ))}
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh chart data"
              className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {chartData.labels.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm bg-gray-50 rounded-xl">
          No sensor data available yet
        </div>
      ) : (
        <LineChart data={chartData} height={height} />
      )}
    </div>
  );
};

export default SensorChart;