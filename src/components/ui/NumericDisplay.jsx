import React, { useState, useEffect } from 'react';

const NumericDisplay = ({ id, value, label, iconClass, isPercentage = false }) => {
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    // Update value every 5 seconds with random data (simulating real-time updates)
    const interval = setInterval(() => {
      const newValue = Math.floor(Math.random() * 100);
      setCurrentValue(newValue);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="numeric-display" id={id}>
      <div className="stat-icon">
        <i className={iconClass}></i>
      </div>
      <div className="stat-value">
        {currentValue}{isPercentage ? '%' : ''}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

export default NumericDisplay;