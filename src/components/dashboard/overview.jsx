import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  AlertTriangle, Wifi, WifiOff, RefreshCw, ServerCrash
} from 'lucide-react';

// Layout and UI components
import Header from '../layout/header';
import Sidebar from '../layout/sidebar';
import PlantInfo from '../ui/PlantInfo';
import MetricCard from '../ui/MetricCard';
import SensorChart from '../charts/sensorChart';
import Alerts from '../ui/Alerts';
import DeviceStatus from '../ui/DeviceStatus';
import Tasks from '../ui/Tasks';
import FarmingSuggestions from '../ui/FarmingSuggestions';
import LandPlotsMap from '../ui/LandPlotMaps';
import defaultImage from '../images/limaunipis.png';

// Shared weather components
import { WeatherForecastModal, WeatherWidget } from './WeatherComponents';

// Site configuration
import { getSiteConfig, getSiteOptions } from './siteConfig';

// Hooks
import { useApi, useSerialConnection } from '@lib/client/hooks/useApi';
import { useFirestore } from '@lib/client/hooks/useFirestore';
import { useWebSocketStatus } from '@lib/client/hooks/useRealtime';

// ============================================================
// Unified Overview Component
// Driven by siteConfig.js — one component for all orchards
// ============================================================
const Overview = () => {
  // --- Site Selection ---
  const siteOptions = useMemo(() => getSiteOptions(), []);
  const [siteId, setSiteId] = useState(siteOptions[0]?.value || 'nipis_orchard');
  const siteConfig = useMemo(() => getSiteConfig(siteId), [siteId]);

  // --- Connection Hooks ---
  const { getDataByFilters, error, loading } = useApi();
  const { connected: wsConnected } = useWebSocketStatus();
  const { status: serialStatus, reconnect: serialReconnect } = useSerialConnection();
  const isConnected = !loading && !error;

  // --- Firestore Real-time Data ---
  const sensorsData = useFirestore('sensors', {
    where: { field: 'sample_id', operator: '==', value: siteId },
    orderBy: { field: 'timestamp', direction: 'desc' },
    limit: 30
  });

  const alertsData = useFirestore('alerts', {
    where: { field: 'sample_id', operator: '==', value: siteId },
    orderBy: { field: 'timestamp', direction: 'desc' },
    limit: 10
  });

  const datasetParamData = useFirestore('dataset_param', {
    where: { field: 'sample_id', operator: '==', value: siteId },
    orderBy: { field: 'timestamp', direction: 'desc' },
    limit: 20
  });

  // --- Derived Data ---
  const sensorData = useMemo(() => sensorsData.data?.length > 0 ? sensorsData.data : [], [sensorsData.data]);
  const sensorLoading = sensorsData.loading;
  const sensorError = sensorsData.error;

  const latestSensorData = useMemo(() => sensorData?.[0] || null, [sensorData]);
  const latestDatasetParam = useMemo(() => datasetParamData.data?.[0] || null, [datasetParamData.data]);

  const lastUpdated = useMemo(() => {
    try {
      const ts = sensorData[0]?.timestamp;
      if (!ts) return null;
      if (typeof ts.toDate === 'function') return ts.toDate();
      const d = new Date(ts);
      return (d instanceof Date && !isNaN(d.getTime())) ? d : null;
    } catch {
      return null;
    }
  }, [sensorData]);

  // --- Refetch (no-op for Firestore real-time) ---
  const refetchSensorData = () => {
    console.log('🔄 Firestore data updates automatically via real-time listeners');
  };

  // --- Local State ---
  const [devices, setDevices] = useState([]);
  const [plantData, setPlantData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const fetchControllerRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedGarden, setSelectedGarden] = useState(siteConfig.label);
  const [showWeatherModal, setShowWeatherModal] = useState(false);

  // Sync selectedGarden label when site changes
  useEffect(() => {
    setSelectedGarden(siteConfig.label);
  }, [siteConfig.label]);

  // --- Weather Data ---
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

  // --- Additional Data via API ---
  const fetchAdditionalData = useCallback(async () => {
    if (!isConnected) return;
    if (fetchControllerRef.current) fetchControllerRef.current.abort();
    const controller = new AbortController();
    fetchControllerRef.current = controller;
    try {
      const [devicesResponse, plantResponse] = await Promise.all([
        getDataByFilters('devices', {}, { orderBy: { column: 'last_seen', direction: 'DESC' } }, { signal: controller.signal }),
        getDataByFilters('plants', { garden_id: selectedGarden }, { limit: 1 }, { signal: controller.signal }),
      ]);
      setDevices(devicesResponse || []);
      setPlantData(plantResponse?.[0] || null);
    } catch (err) { if (err.name !== 'AbortError') console.error('Error fetching additional data:', err); }
  }, [isConnected, selectedGarden, getDataByFilters]);

  useEffect(() => {
    fetchAdditionalData();
    return () => { if (fetchControllerRef.current) fetchControllerRef.current.abort(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, selectedGarden]);

  // --- Yield & Revenue (from siteConfig) ---
  const calculatedYield = useMemo(() => siteConfig.yieldFormula(latestDatasetParam), [siteConfig, latestDatasetParam]);
  const calculatedRevenue = useMemo(() => (calculatedYield * siteConfig.revenuePerKg).toFixed(2), [calculatedYield, siteConfig.revenuePerKg]);

  // --- Metrics (from siteConfig) ---
  const metricsData = useMemo(
    () => siteConfig.metrics(latestDatasetParam, latestSensorData),
    [siteConfig, latestDatasetParam, latestSensorData]
  );

  // --- Chart Data ---
  const chartData = useMemo(() => {
    if (!sensorData || sensorData.length === 0) return { labels: [], datasets: {} };
    const groupedData = sensorData.reduce((acc, reading) => {
      const ts = reading.timestamp;
      let dateStr;
      try {
        const d = typeof ts?.toDate === 'function' ? ts.toDate() : new Date(ts || reading.created_at);
        dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } catch {
        dateStr = 'Unknown';
      }
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(reading);
      return acc;
    }, {});

    const labels = Object.keys(groupedData).sort((a, b) => new Date(a) - new Date(b));
    const createDataset = (key, label, color) => ({
      label,
      data: labels.map(date => {
        const readings = groupedData[date];
        // Support nested keys like 'npk.nitrogen'
        const getValue = (r, k) => k.split('.').reduce((obj, part) => obj?.[part], r) || 0;
        return (readings.reduce((sum, r) => sum + getValue(r, key), 0) / readings.length).toFixed(2);
      }),
      borderColor: color,
      backgroundColor: `${color}1A`,
      borderWidth: 2,
      fill: true,
      tension: 0.4
    });

    return { labels, datasets: siteConfig.chartDatasets(createDataset) };
  }, [sensorData, siteConfig]);

  // --- Connection Status ---
  const connectionStatus = useMemo(() => {
    if (error || sensorError) return { Icon: AlertTriangle, text: 'Connection Issues', color: 'bg-red-100 text-red-800', pulse: false };
    if (!isConnected) return { Icon: WifiOff, text: 'Disconnected', color: 'bg-gray-200 text-gray-700', pulse: false };
    if (isConnected) return { Icon: Wifi, text: 'Connected', color: 'bg-green-100 text-green-800', pulse: wsConnected };
    return { Icon: ServerCrash, text: 'Unknown Status', color: 'bg-yellow-100 text-yellow-800', pulse: false };
  }, [isConnected, wsConnected, error, sensorError]);

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          selectedGarden={selectedGarden}
          onGardenChange={(garden) => setSelectedGarden(garden)}
        />

        {/* Status Bar */}
        <div className="bg-white border-b px-4 py-2 flex justify-between items-center text-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* Site Switcher */}
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              {siteOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${connectionStatus.color}`}>
              <connectionStatus.Icon className="w-4 h-4" />
              <span>{connectionStatus.text}</span>
              {connectionStatus.pulse && <div className="w-2 h-2 bg-current rounded-full animate-pulse" title="Receiving live data"></div>}
            </div>
          </div>
          {lastUpdated && <span className="text-gray-500 hidden md:block">Last updated: {lastUpdated.toLocaleTimeString('en-US')}</span>}
        </div>

        <main className="flex-1 px-4 py-6 overflow-auto">
          {(loading || (sensorLoading && !sensorData)) && <div className="text-center py-12 font-medium text-gray-600">Loading dashboard data...</div>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <PlantInfo
                plantName={plantData?.name || siteConfig.plant.name}
                description={plantData?.description || siteConfig.plant.description}
                backgroundImage={plantData?.image_url || defaultImage}
                detailsLink={`/plant-details/${plantData?.id || siteConfig.plant.detailsSlug}`}
              />

              {/* Metrics: top 4 from dataset_param, bottom 4 from sensors */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metricsData.map((metric, index) => <MetricCard key={index} {...metric} loading={sensorLoading && !latestSensorData} />)}
              </div>

              {/* Yield & Revenue summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-4 text-white shadow-md">
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Predicted Yield</p>
                  <p className="text-3xl font-bold mt-1">{calculatedYield > 0 ? `${calculatedYield.toLocaleString()} kg` : 'N/A'}</p>
                  <p className="text-xs opacity-70 mt-1">Based on latest soil parameters</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white shadow-md">
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Estimated Revenue</p>
                  <p className="text-3xl font-bold mt-1">{calculatedRevenue > 0 ? `RM ${parseFloat(calculatedRevenue).toLocaleString()}` : 'N/A'}</p>
                  <p className="text-xs opacity-70 mt-1">@ RM {siteConfig.revenuePerKg}/kg</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Tasks title="Daily Farming Tasks" loading={loading || sensorLoading} />
                <FarmingSuggestions sensorData={latestSensorData} loading={sensorLoading} />
              </div>

              {/* Chart — sensor collection data */}
              <SensorChart
                data={chartData}
                availableMetrics={siteConfig.chartMetrics}
                defaultSelectedMetrics={siteConfig.defaultChartMetrics}
                loading={sensorLoading}
                error={sensorError}
                onRefresh={refetchSensorData}
              />

              <LandPlotsMap />
            </div>

            <div className="flex flex-col gap-6">
              <WeatherWidget data={weatherData} loading={!weatherData} onMoreDetailsClick={() => setShowWeatherModal(true)} />
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

export default Overview;
