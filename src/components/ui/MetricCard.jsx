// components/ui/MetricCard.jsx
import React from 'react';
import { Settings } from 'lucide-react';

const MetricCard = ({ 
  icon: Icon,
  title,
  value,
  description,
  iconColor = "text-gray-500",
  gradient = false,
  gradientFrom = "from-green-500",
  gradientTo = "to-green-600",
  onClick
}) => {
  const cardClasses = gradient 
    ? `bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white`
    : "bg-white";

  const iconColorClass = gradient ? "text-white" : iconColor;
  const textColor = gradient ? "text-white" : "text-gray-900";
  const descriptionColor = gradient ? "text-white opacity-90" : "text-gray-600";
  const settingsColor = gradient ? "text-white opacity-70" : "text-gray-400";

  return (
    <div 
      className={`${cardClasses} rounded-2xl shadow-sm p-6 h-full transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-6 h-6 ${iconColorClass}`} />
        <Settings className={`w-5 h-5 ${settingsColor}`} />
      </div>
      
      <h3 className={`text-sm font-medium mb-2 ${gradient ? 'opacity-90' : 'text-gray-700'}`}>
        {title}
      </h3>
      
      <div className={`text-3xl font-bold mb-2 ${textColor}`}>
        {value}
      </div>
      
      <p className={`text-sm ${descriptionColor}`}>
        {description}
      </p>
    </div>
  );
};

export default MetricCard;