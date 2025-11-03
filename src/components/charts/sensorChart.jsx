// components/charts/SensorChart.jsx
import React, { useState } from 'react';
import LineChart from '../charts/lineChart'; // Adjust path as needed

const SensorChart = ({ 
  data,
  title = "Sensor History (Last 7 Days)",
  availableMetrics = [],
  defaultSelectedMetrics = ['soilMoisture', 'temperature'],
  height = 300
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState(defaultSelectedMetrics);

  // Default metrics if none provided
  const defaultMetricOptions = [
    { key: 'soilMoisture', label: 'Soil Moisture' },
    { key: 'temperature', label: 'Temperature' },
    { key: 'phLevel', label: 'pH Level' },
    { key: 'soilNitrogen', label: 'Soil Nitrogen' }
  ];

  const metricOptions = availableMetrics.length > 0 ? availableMetrics : defaultMetricOptions;

  const handleMetricChange = (metricKey) => {
    setSelectedMetrics(prevMetrics => {
      if (prevMetrics.includes(metricKey)) {
        // Don't allow deselecting all metrics
        if (prevMetrics.length === 1) return prevMetrics;
        return prevMetrics.filter(m => m !== metricKey);
      } else {
        return [...prevMetrics, metricKey];
      }
    });
  };

  // Prepare chart data based on selected metrics
  const chartData = {
    labels: data?.labels || [],
    datasets: selectedMetrics
      .map(key => data?.datasets?.[key])
      .filter(Boolean) // Remove undefined datasets
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">
          {title}
        </h3>
        
        <div className="flex items-center flex-wrap gap-2">
          {metricOptions.map(metric => (
            <button 
              key={metric.key} 
              onClick={() => handleMetricChange(metric.key)} 
              className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                selectedMetrics.includes(metric.key) 
                  ? 'bg-blue-500 text-white shadow' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>
      
      <LineChart data={chartData} height={height} />
    </div>
  );
};

export default SensorChart;