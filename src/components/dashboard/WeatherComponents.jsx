import React from 'react';
import {
    Thermometer, Droplet, CloudRain, Sunrise, Sunset, X, Sun, Cloud, Zap
} from 'lucide-react';

// Get weather icon and description based on WMO weather code
export const getWeatherInfo = (code) => {
    switch (true) {
        case code <= 1: return { icon: Sun, description: "Clear" };
        case code <= 3: return { icon: Cloud, description: "Cloudy" };
        case (code >= 51 && code <= 67): return { icon: CloudRain, description: "Rain" };
        case (code >= 80 && code <= 82): return { icon: CloudRain, description: "Heavy Rain" };
        case (code >= 95 && code <= 99): return { icon: Zap, description: "Thunderstorm" };
        default: return { icon: Cloud, description: "Cloudy" };
    }
};

export const WeatherForecastModal = ({ show, onClose, data }) => {
    return (
        <div
            className={`fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            <div
                className={`bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl transform transition-all duration-300 ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">5-Day Weather Forecast</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                {!data || !data.daily ? (
                    <div className="text-center py-10"><p>Loading forecast data...</p></div>
                ) : (
                    <div className="space-y-3">
                        {data.daily.time.slice(0, 5).map((day, index) => {
                            const { icon: WeatherIcon, description } = getWeatherInfo(data.daily.weather_code[index]);
                            return (
                                <div key={index} className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center bg-gray-50 p-3 rounded-lg border">
                                    <div className="col-span-2 md:col-span-1">
                                        <p className="font-semibold text-gray-800">{new Date(day).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                                        <p className="text-sm text-gray-500">{new Date(day).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    <div className="flex items-center justify-start md:justify-center space-x-2">
                                        <WeatherIcon className="w-8 h-8 text-gray-600" />
                                        <span className="text-sm text-gray-600 hidden md:block">{description}</span>
                                    </div>
                                    <div className="flex items-center justify-start md:justify-center space-x-2"><CloudRain className="w-5 h-5 text-blue-500" /><span className="font-medium text-gray-700">{data.daily.precipitation_sum[index]} mm</span></div>
                                    <div className="flex items-center justify-start md:justify-center space-x-2"><Thermometer className="w-5 h-5 text-red-500" /><span className="font-medium text-gray-700">{Math.round(data.daily.temperature_2m_max[index])}° / {Math.round(data.daily.temperature_2m_min[index])}°C</span></div>
                                    <div className="col-span-2 md:col-span-2 text-sm md:text-right space-y-1">
                                        <div className="flex items-center justify-start md:justify-end space-x-2"><Sunrise className="w-5 h-5 text-orange-400" /><span>{new Date(data.daily.sunrise[index]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
                                        <div className="flex items-center justify-start md:justify-end space-x-2"><Sunset className="w-5 h-5 text-indigo-500" /><span>{new Date(data.daily.sunset[index]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export const WeatherWidget = ({ data, loading, onMoreDetailsClick }) => {
    if (loading || !data || !data.hourly || !data.daily || !data.hourly.weathercode) {
        return <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 text-center h-full flex items-center justify-center"><p className="text-gray-500">Loading Weather Data...</p></div>;
    }

    const currentHourIndex = new Date().getHours();
    const currentTemp = data.hourly.temperature_2m[currentHourIndex];
    const currentHumidity = data.hourly.relative_humidity_2m[currentHourIndex];
    const currentWeatherCode = data.hourly.weathercode[currentHourIndex];
    const { icon: WeatherIcon, description } = getWeatherInfo(currentWeatherCode);

    return (
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 shadow-md border border-gray-200 flex flex-col justify-between h-full">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Selangor</h3>
                        <p className="text-sm text-slate-500">{description}</p>
                    </div>
                    <WeatherIcon className="w-16 h-16 text-slate-700" />
                </div>
                <p className="text-6xl font-bold text-slate-800 mb-6">{Math.round(currentTemp)}°C</p>

                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-600 mb-3 text-center">Next Few Hours</h4>
                    <div className="flex justify-between items-center space-x-2 md:space-x-4 px-2 py-3 bg-slate-100 rounded-lg">
                        {data.hourly.time.slice(currentHourIndex + 1, currentHourIndex + 6).map((time, index) => {
                            const hourIndex = currentHourIndex + 1 + index;
                            const { icon: HourlyIcon } = getWeatherInfo(data.hourly.weathercode[hourIndex]);
                            return (
                                <div key={time} className="flex flex-col items-center space-y-1">
                                    <span className="text-xs font-medium text-slate-500">
                                        {new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}
                                    </span>
                                    <HourlyIcon className="w-7 h-7 text-slate-600" />
                                    <span className="text-md font-bold text-slate-700">
                                        {Math.round(data.hourly.temperature_2m[hourIndex])}°
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-4">
                    <div className="flex items-center"><Droplet className="w-5 h-5 text-blue-500 mr-2" /><span>Humidity: {currentHumidity}%</span></div>
                    <div className="flex items-center"><CloudRain className="w-5 h-5 text-gray-500 mr-2" /><span>Rain: {data.hourly.rain[currentHourIndex]} mm</span></div>
                    <div className="flex items-center"><Sunrise className="w-5 h-5 text-orange-500 mr-2" /><span>{new Date(data.daily.sunrise[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
                    <div className="flex items-center"><Sunset className="w-5 h-5 text-indigo-500 mr-2" /><span>{new Date(data.daily.sunset[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
                </div>
            </div>
            <button
                onClick={onMoreDetailsClick}
                disabled={loading}
                className="w-full text-center bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold px-4 py-2 rounded-lg text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
                View 5-Day Details
            </button>
        </div>
    );
};
