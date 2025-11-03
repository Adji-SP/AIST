// components/ui/ProductionOverview.jsx
import React from 'react';

const ProductionOverview = ({ 
  title = "Production Overview",
  totalProduction = 1000,
  productionUnit = "Tons",
  totalLandArea = "1200 acres",
  landUsagePercentage = 56,
  revenue = "$500,000",
  timeframe = "Yearly",
  onTimeframeChange
}) => {
  // Calculate the circle progress
  const circumference = 2 * Math.PI * 56; // radius = 56
  const progressOffset = circumference - (landUsagePercentage / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <select 
          className="text-sm border border-gray-200 rounded-lg px-3 py-1"
          value={timeframe}
          onChange={(e) => onTimeframeChange && onTimeframeChange(e.target.value)}
        >
          <option value="Yearly">Yearly</option>
          <option value="Monthly">Monthly</option>
          <option value="Weekly">Weekly</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Production Circle Chart */}
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle 
                cx="64" 
                cy="64" 
                r="56" 
                fill="none" 
                stroke="#f3f4f6" 
                strokeWidth="8" 
              />
              <circle 
                cx="64" 
                cy="64" 
                r="56" 
                fill="none" 
                stroke="url(#gradient)" 
                strokeWidth="8" 
                strokeDasharray={circumference}
                strokeDashoffset={progressOffset}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">
                {totalProduction.toLocaleString()}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600">{productionUnit}</p>
        </div>
        
        {/* Statistics */}
        <div>
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-1">Total Land Area</div>
            <div className="text-2xl font-bold text-gray-900">{totalLandArea}</div>
            <div className="text-sm text-gray-500">{landUsagePercentage}% used</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Revenue</div>
            <div className="text-2xl font-bold text-green-600">{revenue}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionOverview;