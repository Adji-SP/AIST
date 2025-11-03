// components/ui/PlantInfo.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const PlantInfo = ({ 
  plantName = "Limau",
  description = "Your plants are thriving and showing excellent growth. The current conditions are optimal for Kangkung cultivation.",
  backgroundImage,
  detailsLink = "/plant-details/kangkung",
  buttonText = "Plant Information",
  showClock = true,
  className = ""
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!showClock) return;
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [showClock]);

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  
  const formattedDate = currentTime.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const backgroundStyle = backgroundImage 
    ? { backgroundImage: `url(${backgroundImage})` }
    : { background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)' };

  return (
    <div
      className={`relative rounded-2xl shadow-sm p-12 text-white overflow-hidden bg-cover bg-center ${className}`}
      style={backgroundStyle}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      
      {/* Plant Information Button */}
      <Link 
        to={detailsLink}
        className="absolute z-20 top-8 right-8 bg-yellow-400 text-gray-900 text-sm font-semibold py-3 px-5 rounded-full 
                transform transition-all duration-300 ease-in-out 
                shadow-md hover:bg-yellow-300 hover:shadow-lg hover:scale-105 hover:-translate-y-1"
      >
        {buttonText}
      </Link>

      {/* Main Content */}
      <div className="relative z-20">
        <Leaf className="w-10 h-10 mb-16" />
        <div className="text-5xl font-bold mb-3">{plantName}</div>
        <p className="text-base opacity-90 max-w-lg">
          {description}
        </p>
      </div>
      
      {/* Real-time Clock */}
      {showClock && (
        <div className="absolute z-20 bottom-8 right-8 text-right filter drop-shadow-lg">
          <p className="text-4xl font-bold tracking-wider">{formattedTime}</p>
          <p className="text-sm text-white/90 uppercase">{formattedDate}</p>
        </div>
      )}
    </div>
  );
};

export default PlantInfo;