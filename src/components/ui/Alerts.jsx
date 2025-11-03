// components/ui/Alerts.jsx
import React from 'react';

const Alerts = ({ 
  alerts = [],
  title = "Alerts",
  onViewAll,
  maxHeight = "400px"
}) => {
  // Data contoh default jika tidak ada lansiran yang diberikan
  const defaultAlerts = [
    {
      id: 1,
      title: "pH Level Too High",
      description: "Sensor #PH001 • Current: 8.2",
      severity: "critical",
      color: "red"
    },
    {
      id: 2,
      title: "Soil Moisture Low",
      description: "Garden Section A • Current: 45%",
      severity: "warning",
      color: "orange"
    },
    {
      id: 3,
      title: "Temperature Fluctuation",
      description: "Greenhouse B • Variance: ±5°C",
      severity: "info",
      color: "blue"
    },
    {
      id: 4,
      title: "High Humidity Detected",
      description: "Zone 3 • Current: 95%",
      severity: "caution",
      color: "yellow"
    },
    {
      id: 5,
      title: "Wind Speed Too High",
      description: "External Sensor • Current: 15m/s",
      severity: "critical",
      color: "red"
    }
  ];

  const alertsToShow =  defaultAlerts;
  const totalAlerts = alertsToShow.length;

  const getSeverityStyles = (color) => {
    const colorMap = {
      red: {
        bg: 'bg-red-50',
        border: 'border-red-400',
        badgeBg: 'bg-red-500',
        badgeText: 'text-white'
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-400',
        badgeBg: 'bg-orange-500',
        badgeText: 'text-white'
      },
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-400',
        badgeBg: 'bg-blue-500',
        badgeText: 'text-white'
      },
      yellow: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-400',
        badgeBg: 'bg-yellow-500',
        badgeText: 'text-white'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-400',
        badgeBg: 'bg-green-500',
        badgeText: 'text-white'
      }
    };

    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="text-white text-xs bg-gray-800 font-bold py-1 px-2.5 rounded-md">
          {totalAlerts}
        </span>
      </div>
      
      <div 
        className="flex-grow space-y-3 overflow-y-auto pr-2"
        style={{ maxHeight }}
      >
        {alertsToShow.map((alert) => {
          const styles = getSeverityStyles(alert.color || 'blue');
          
          return (
            <div 
              key={alert.id} 
              className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${styles.bg} ${styles.border}`}
            >
              <div>
                <p className="font-semibold text-gray-800 text-sm">{alert.title}</p>
                <p className="text-xs text-gray-500">{alert.description}</p>
              </div>
              <span className={`text-xs font-medium py-1 px-3 rounded-full ${styles.badgeBg} ${styles.badgeText}`}>
                {alert.severity ? (alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)) : 'Info'}
              </span>
            </div>
          );
        })}
      </div>
      
      {onViewAll && (
        <div className="mt-auto pt-4 text-center">
          <button 
            onClick={onViewAll}
            className="text-sm text-blue-700 hover:text-blue-900 font-semibold transition-colors"
          >
            View all alerts
          </button>
        </div>
      )}
    </div>
  );
};

export default Alerts;