import React, { useState, useEffect } from 'react';

const DigitalClock = () => {
  const [time, setTime] = useState('00:00:00');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTime(`${hours}:${minutes}:${seconds}`);
    };

    updateClock(); // Update immediately
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div id="clockContainer">
      <div className="digital-clock p-8">{time}</div>
    </div>
  );
};

export default DigitalClock;