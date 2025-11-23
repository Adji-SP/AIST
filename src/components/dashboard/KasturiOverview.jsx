import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Leaf, Thermometer, Droplet, Wind, Sun, Activity, BarChart3, AlertTriangle, Wifi, WifiOff, CloudRain, Sunrise, Sunset, X, Cloud, Zap, RefreshCw, ServerCrash
} from 'lucide-react';

// Import existing UI and layout components
import Header from '../layout/header';
import Sidebar from '../layout/sidebar';
import PlantInfo from '../ui/PlantInfo';
import MetricCard from '../ui/MetricCard';
import SensorChart from '../charts/sensorChart';
import Alerts from '../ui/Alerts';
import DeviceStatus from '../ui/DeviceStatus';
import ProductionOverview from '../ui/ProductionOverview';
import FarmingSuggestions from '../ui/FarmingSuggestions';
import image_url from '../images/limaunipis.png';

// Import the LandPlotsMap component from its separate file
import LandPlotsMap from '../ui/LandPlotMaps';

// Import custom hooks
import { useApi, useSerialConnection } from '../../hook/useApiClean';
import { useFirestore } from '../../hook/useFirestoreClean';
import { useWebSocketStatus } from '../../hook/useRealtimeClean';

// [NEW FUNCTION] To get weather icon and description based on WMO code
const getWeatherInfo = (code) => {
    switch (true) {
        case code <= 1: return { icon: Sun, description: "Clear" };
        case code <= 3: return { icon: Cloud, description: "Cloudy" };
        case (code >= 51 && code <= 67): return { icon: CloudRain, description: "Rain" };
        case (code >= 80 && code <= 82): return { icon: CloudRain, description: "Heavy Rain" };
        case (code >= 95 && code <= 99): return { icon: Zap, description: "Thunderstorm" };
        default: return { icon: Cloud, description: "Cloudy" };
    }
};

const WeatherForecastModal = ({ show, onClose, data }) => {
    return (
        <div
            className={`fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
        >
            <div
                className={`bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl transform transition-all duration-300 ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    }`}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">5-Day Weather Forecast</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                {!data || !data.daily ? (
                    <div className="text-center py-10"> <p>Loading forecast data...</p> </div>
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

const WeatherWidget = ({ data, loading, onMoreDetailsClick }) => {
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

// Main Page Component
const KasturiOverview = () => {
    // API and connection hooks
    const { getDataByFilters, error, loading } = useApi();
    const { connected: wsConnected } = useWebSocketStatus();
    const { status: serialStatus, reconnect: serialReconnect } = useSerialConnection();
    const isConnected = !loading && !error;

    // Firestore real-time data hooks - Using new collections with sample_id filtering
    const sampleId = 'kasturi_orchard';

    // Sensors collection - 4 main sensor readings (primary data source)
    const sensorsData = useFirestore('sensors', {
        where: { field: 'sample_id', operator: '==', value: sampleId },
        orderBy: { field: 'timestamp', direction: 'desc' },
        limit: 30
    });

    // Alerts collection - system alerts
    const alertsData = useFirestore('alerts', {
        where: { field: 'sample_id', operator: '==', value: sampleId },
        orderBy: { field: 'timestamp', direction: 'desc' },
        limit: 10
    });

    // Optional: Uncomment if needed for specific features
    // const datasetParamData = useFirestore('dataset_param', { where: { field: 'sample_id', operator: '==', value: sampleId }, limit: 20 });
    // const actionsData = useFirestore('actions', { where: { field: 'sample_id', operator: '==', value: sampleId }, limit: 15 });
    // const historyData = useFirestore('history', { where: { field: 'sample_id', operator: '==', value: sampleId }, limit: 25 });
    // const forecastData = useFirestore('forecast', { where: { field: 'sample_id', operator: '==', value: sampleId }, limit: 7 });

    // Use the new collections data
    const sensorData = sensorsData.data?.length > 0 ? sensorsData.data : [];
    const sensorLoading = sensorsData.loading;
    const sensorError = sensorsData.error;

    // Create a refetch function for compatibility
    const refetchSensorData = () => {
        // For Firestore real-time data, we don't need to manually refetch
        console.log('Firestore data updates automatically via real-time listeners');
    };
    
    const lastUpdated = sensorData[0]?.timestamp || new Date().toISOString();
    const [devices, setDevices] = useState([]);
    const [plantData, setPlantData] = useState(null);
    const [productionData, setProductionData] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const fetchControllerRef = useRef(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedGarden, setSelectedGarden] = useState("Kasturi Orchard");
    const [showWeatherModal, setShowWeatherModal] = useState(false);

    useEffect(() => {
        const fetchWeatherData = async () => {
            try {
                const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=3.50744&longitude=101.1077&hourly=temperature_2m,relative_humidity_2m,rain,is_day,weathercode&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&timezone=auto');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setWeatherData(data);
            } catch (error) { console.error('Error fetching weather data:', error); }
        };
        fetchWeatherData();
        const interval = setInterval(fetchWeatherData, 300000);
        return () => clearInterval(interval);
    }, []);

    const fetchAdditionalData = async () => {
        if (!isConnected) return;
        if (fetchControllerRef.current) fetchControllerRef.current.abort();
        const controller = new AbortController();
        fetchControllerRef.current = controller;
        try {
            const [devicesResponse, plantResponse, productionResponse] = await Promise.all([
                getDataByFilters('devices', {}, { orderBy: { column: 'last_seen', direction: 'DESC' } }, { signal: controller.signal }),
                getDataByFilters('plants', { garden_id: selectedGarden }, { limit: 1 }, { signal: controller.signal }),
                getDataByFilters('production', { month: new Date().getMonth() + 1, year: new Date().getFullYear() }, { limit: 1 }, { signal: controller.signal })
            ]);
            setDevices(devicesResponse || []);
            setPlantData(plantResponse?.[0] || null);
            setProductionData(productionResponse?.[0] || null);
        } catch (error) { if (error.name !== 'AbortError') console.error('Error fetching additional data:', error); }
    };

    useEffect(() => {
        fetchAdditionalData();
        return () => { if (fetchControllerRef.current) fetchControllerRef.current.abort(); }
    }, [isConnected, selectedGarden]);

    const latestSensorData = useMemo(() => sensorData?.[0] || null, [sensorData]);
    const latestDatasetParam = useMemo(() => datasetParamData.data?.[0] || null, [datasetParamData.data]);

    // Calculate yield using dataset_param collection data
    const calculatedYield = useMemo(() => {
        if (!latestDatasetParam) return 0;
        const { total_nitrogen, organic_matter, total_carbon, temperature, humidity } = latestDatasetParam;
        if (!total_nitrogen || !organic_matter || !total_carbon || !temperature || !humidity) return 0;
        
        // Formula for Kasturi yield calculation - different from Nipis
        const yieldKg = -113481.12 + (652168.99 * total_nitrogen) + (1228.76 * organic_matter) + (-20577.85 * total_carbon) + (-1107.59 * temperature) + (1349.29 * humidity);
        return Math.max(0, yieldKg.toFixed(2));
    }, [latestDatasetParam]);

    // Calculate revenue based on yield
    const calculatedRevenue = useMemo(() => {
        const revenue = calculatedYield * 3.03;
        return revenue.toFixed(2);
    }, [calculatedYield]);

    const chartData = useMemo(() => {
        if (!sensorData || sensorData.length === 0) { return { labels: [], datasets: {} }; }
        const groupedData = sensorData.reduce((acc, reading) => {
            const date = new Date(reading.timestamp || reading.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!acc[date]) acc[date] = [];
            acc[date].push(reading);
            return acc;
        }, {});
        const labels = Object.keys(groupedData).sort((a, b) => new Date(a) - new Date(b));
        const createDataset = (key, label, color) => ({
            label, data: labels.map(date => (groupedData[date].reduce((sum, r) => sum + (r[key] || 0), 0) / groupedData[date].length).toFixed(2)),
            borderColor: color, backgroundColor: `${color}1A`, borderWidth: 2, fill: true, tension: 0.4
        });
        return {
            labels, datasets: {
                temperature: createDataset('temperature', 'Temperature (°C)', '#f97316'),
                humidity: createDataset('humidity', 'Humidity (%)', '#3b82f6'),
                ph: createDataset('ph', 'pH Level', '#10b981'),
                nitrogenNPK: createDataset('npk.nitrogen', 'NPK Nitrogen (ppm)', '#8b5cf6')
            }
        };
    }, [sensorData]);

    // Updated metrics using dataset_param collection for top 4, sensors for bottom 4
    const metricsData = useMemo(() => {
        const latestDataset = latestDatasetParam;
        const latestSensor = latestSensorData;
        return [
            // Top 4 from dataset_param collection
            { icon: Leaf, title: "Total Nitrogen", value: latestDataset?.total_nitrogen ? `${latestDataset.total_nitrogen}%` : "N/A", description: "Soil nitrogen content", gradient: true, gradientFrom: "from-green-500", gradientTo: "to-green-600" },
            { icon: Activity, title: "Organic Matter", value: latestDataset?.organic_matter ? `${latestDataset.organic_matter}%` : "N/A", description: "Soil organic content", iconColor: "text-orange-500" },
            { icon: Droplet, title: "Total Carbon", value: latestDataset?.total_carbon ? `${latestDataset.total_carbon}%` : "N/A", description: "Carbon levels", iconColor: "text-blue-400" },
            { icon: Thermometer, title: "Temperature", value: latestDataset?.temperature ? `${latestDataset.temperature}°C` : "N/A", description: "Environmental temp", iconColor: "text-red-500" },
            // Bottom 4 from sensors collection  
            { icon: Wind, title: "Humidity", value: latestSensor?.humidity ? `${latestSensor.humidity}%` : "N/A", description: "Air moisture", iconColor: "text-sky-500" },
            { icon: Sun, title: "pH Level", value: latestSensor?.ph || "N/A", description: "Soil acidity", iconColor: "text-yellow-500" },
            { icon: BarChart3, title: "NPK-N", value: latestSensor?.npk?.nitrogen ? `${latestSensor.npk.nitrogen}ppm` : "N/A", description: "Available nitrogen", iconColor: "text-indigo-500" },
            { icon: Leaf, title: "NPK-P", value: latestSensor?.npk?.phosphorus ? `${latestSensor.npk.phosphorus}ppm` : "N/A", description: "Available phosphorus", iconColor: "text-purple-500" },
        ];
    }, [latestDatasetParam, latestSensorData]);

    const connectionStatus = useMemo(() => {
        if (error || sensorError) {
            return {
                Icon: AlertTriangle,
                text: "Connection Issues",
                color: "bg-red-100 text-red-800",
                pulse: false
            };
        }
        if (!isConnected) {
            return {
                Icon: WifiOff,
                text: "Disconnected",
                color: "bg-gray-200 text-gray-700",
                pulse: false
            };
        }
        if (isConnected) {
            return {
                Icon: Wifi,
                text: "Connected",
                color: "bg-green-100 text-green-800",
                pulse: wsConnected
            };
        }
        return {
            Icon: ServerCrash,
            text: "Unknown Status",
            color: "bg-yellow-100 text-yellow-800",
            pulse: false
        };
    }, [isConnected, wsConnected, error, sensorError]);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)}
            />

            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
                }`}>
                <Header
                    onMenuClick={() => setSidebarOpen(true)}
                    selectedGarden={selectedGarden}
                    onGardenChange={(garden) => setSelectedGarden(garden)}
                />

                <div className="bg-white border-b px-4 py-2 flex justify-between items-center text-sm sticky top-0 z-10">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${connectionStatus.color}`}>
                        <connectionStatus.Icon className="w-4 h-4" />
                        <span>{connectionStatus.text}</span>
                        {connectionStatus.pulse && <div className="w-2 h-2 bg-current rounded-full animate-pulse" title="Receiving live data"></div>}
                    </div>
                    {lastUpdated && <span className="text-gray-500 hidden md:block">Last updated: {new Date(lastUpdated).toLocaleTimeString('en-US')}</span>}
                </div>

                <main className="flex-1 px-4 py-6 overflow-auto">
                    {(loading || (sensorLoading && !sensorData)) && <div className="text-center py-12 font-medium text-gray-600">Loading dashboard data...</div>}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            <PlantInfo plantName={plantData?.name || "Limau Kasturi"} description={plantData?.description || "Kasturi lime cultivation with sustainable farming methods"} backgroundImage={plantData?.image_url || image_url} detailsLink={`/plant-details/${plantData?.id || 'kasturi'}`} />
                            
                            {/* Metrics display - top 4 from dataset_param, bottom 4 from sensors */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {metricsData.map((metric, index) => <MetricCard key={index} {...metric} loading={sensorLoading && !latestSensorData} />)}
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <ProductionOverview
                                    totalProduction={calculatedYield}
                                    productionUnit="kg"
                                    totalLandArea={productionData?.land_area || "2.5 hectares"}
                                    landUsagePercentage={productionData?.land_usage || 0}
                                    revenue={`RM ${calculatedRevenue}`}
                                    loading={loading || sensorLoading}
                                />
                                {/* Farming suggestions based on sensor data */}
                                <FarmingSuggestions sensorData={latestSensorData} loading={sensorLoading} />
                            </div>
                            
                            {/* Chart focused on sensors collection data */}
                            <SensorChart 
                                data={chartData} 
                                availableMetrics={[
                                    { key: 'temperature', label: 'Temperature' }, 
                                    { key: 'humidity', label: 'Humidity' }, 
                                    { key: 'ph', label: 'pH Level' }, 
                                    { key: 'nitrogenNPK', label: 'NPK Nitrogen' }
                                ]} 
                                defaultSelectedMetrics={['temperature', 'humidity']} 
                                loading={sensorLoading} 
                                error={sensorError} 
                                onRefresh={refetchSensorData} 
                            />

                            <LandPlotsMap />
                        </div>
                        
                        <div className="flex flex-col gap-6">
                            <WeatherWidget data={weatherData} loading={!weatherData} onMoreDetailsClick={() => setShowWeatherModal(true)} />
                            
                            {/* Alerts from alerts collection */}
                            <Alerts alerts={alertsData.data || []} onViewAll={() => { }} loading={alertsData.loading} />
                            
                            <DeviceStatus devices={devices} serialStatus={serialStatus} onSerialReconnect={serialReconnect} loading={loading} />
                            
                            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
                                <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={refetchSensorData}
                                        disabled={sensorLoading}
                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${sensorLoading ? 'animate-spin' : ''}`} />
                                        {sensorLoading ? 'Refreshing...' : 'Refresh Sensor Data'}
                                    </button>
                                    <button
                                        onClick={serialReconnect}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        Reconnect Serial
                                    </button>
                                    <button
                                        onClick={fetchAdditionalData}
                                        disabled={loading}
                                        className="w-full bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                    >
                                        {loading ? 'Loading...' : 'Refresh All Data'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <WeatherForecastModal show={showWeatherModal} onClose={() => setShowWeatherModal(false)} data={weatherData} />
        </div>
    );
};

export default KasturiOverview;