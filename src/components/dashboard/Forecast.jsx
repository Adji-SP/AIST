import React, { useState, useEffect, useMemo } from 'react';
import {
    Leaf, Thermometer, Droplet, Wind, Sun, Activity, BarChart3, AlertTriangle, Wifi, RefreshCw, CheckCircle, Clock
} from 'lucide-react';

// Pastikan path ke komponen-komponen ini benar
import Header from '../layout/header';
import Sidebar from '../layout/sidebar';
import LineChart from '../charts/lineChart';

// =================================================================================
// DATA & FUNGSI SIMULASI
// =================================================================================

// Fungsi untuk menghasilkan satu set data real-time
const generateDummyRealtimeData = () => ({
    temperature: (25 + Math.random() * 5).toFixed(1),      // 25-30°C
    soil_moisture: (60 + Math.random() * 15).toFixed(1),   // 60-75% (kondisi ideal)
    ph_level: (6.5 + Math.random() * 0.5).toFixed(1),      // 6.5-7.0
    nitrogen: (20 + Math.random() * 5).toFixed(1),         // 20-25 ppm
    potassium: (28 + Math.random() * 5).toFixed(1),        // 28-33 ppm
    light_intensity: (800 + Math.random() * 200).toFixed(0) // 800-1000 lux
});

// Fungsi untuk menghasilkan data peramalan untuk 7 hari ke depan
const generateDummyForecastData = (startData) => {
    const forecast = [];
    let currentMoisture = parseFloat(startData.soil_moisture);
    let currentTemp = parseFloat(startData.temperature);

    for (let i = 1; i <= 7; i++) {
        // Simulasikan penurunan kelembapan tanah setiap hari, dengan kemungkinan hujan
        const chanceOfRain = Math.random();
        if (chanceOfRain < 0.2) { // 20% kemungkinan hujan
            currentMoisture += 15 + Math.random() * 10;
        } else {
            currentMoisture -= 4 + Math.random() * 4;
        }
        currentMoisture = Math.max(30, Math.min(90, currentMoisture)); // Batasi antara 30-90%

        // Simulasikan fluktuasi suhu harian
        currentTemp += (Math.random() - 0.5) * 3; // Fluktuasi +/- 1.5°C
        currentTemp = Math.max(20, Math.min(35, currentTemp));

        forecast.push({
            day: `+${i} Hari`,
            temperature: currentTemp.toFixed(1),
            soil_moisture: currentMoisture.toFixed(1),
        });
    }
    return forecast;
};

// =================================================================================
// KOMPONEN-KOMPONEN VISUAL (DIRANCANG UNTUK FORECAST PAGE)
// =================================================================================

// [BARU] Kartu untuk menampilkan metrik real-time dengan status
const RealtimeMetricCard = ({ icon: Icon, label, value, unit, status }) => {
    const statusStyles = {
        Optimal: { text: 'text-green-700', bg: 'bg-green-100', icon: <CheckCircle className="w-4 h-4" /> },
        Waspada: { text: 'text-amber-700', bg: 'bg-amber-100', icon: <AlertTriangle className="w-4 h-4" /> },
        Tindakan: { text: 'text-red-700', bg: 'bg-red-100', icon: <AlertTriangle className="w-4 h-4" /> },
    };
    const currentStatus = statusStyles[status] || statusStyles['Waspada'];

    return (
        <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200 flex flex-col justify-between h-full">
            <div>
                <div className="flex items-center gap-3 text-slate-500 mb-2">
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold text-sm">{label}</span>
                </div>
                <div className="text-4xl font-bold text-slate-800">
                    {value} <span className="text-2xl font-medium text-slate-500">{unit}</span>
                </div>
            </div>
            <div className={`mt-4 text-xs font-semibold inline-flex items-center gap-2 px-2.5 py-1 rounded-full ${currentStatus.bg} ${currentStatus.text}`}>
                {currentStatus.icon}
                <span>{status}</span>
            </div>
        </div>
    );
};

// [BARU] Komponen Chart khusus untuk peramalan
const ForecastChart = ({ title, data, metricKey, color, icon: Icon }) => {
    const chartData = {
        labels: data.map(d => d.day),
        datasets: [{
            label: title,
            data: data.map(d => d[metricKey]),
            borderColor: color,
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                gradient.addColorStop(0, `${color}40`);
                gradient.addColorStop(1, `${color}00`);
                return gradient;
            },
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: color,
            borderWidth: 2,
        }],
    };

    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { font: { weight: '600' } } },
            y: { grid: { color: '#f1f5f9' }, border: { dash: [4, 4] } }
        },
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
                <Icon className="w-6 h-6" style={{ color }} />
                <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
            </div>
            <div className="h-64">
                <LineChart data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

// [BARU] Komponen untuk menampilkan rekomendasi/saran
const ForecastSummary = ({ forecastData }) => {
    const recommendations = useMemo(() => {
        const results = [];
        if (!forecastData || forecastData.length === 0) return results;

        const moistureForecast = forecastData.map(d => parseFloat(d.soil_moisture));
        const minMoisture = Math.min(...moistureForecast);
        const dayOfMinMoisture = forecastData[moistureForecast.indexOf(minMoisture)]?.day;

        if (minMoisture < 45) {
            results.push({
                icon: Droplet,
                color: 'text-blue-500',
                title: "Perlu Irigasi",
                text: `Kelembapan tanah diperkirakan akan turun signifikan sekitar ${dayOfMinMoisture}. Persiapkan jadwal irigasi untuk menjaga hidrasi tanaman.`
            });
        } else {
             results.push({
                icon: CheckCircle,
                color: 'text-green-500',
                title: "Kelembapan Tanah Stabil",
                text: "Kondisi kelembapan tanah diperkirakan akan tetap berada pada level yang optimal selama 7 hari ke depan."
            });
        }
        // Bisa ditambahkan logika lain, misal untuk suhu ekstrem, dll.

        return results;
    }, [forecastData]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Rekomendasi & Peringatan</h3>
            <div className="space-y-4">
                {recommendations.map(rec => (
                    <div key={rec.title} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                        <rec.icon className={`w-8 h-8 flex-shrink-0 ${rec.color}`} />
                        <div>
                            <h4 className="font-semibold text-slate-800">{rec.title}</h4>
                            <p className="text-sm text-slate-600">{rec.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


// =================================================================================
// KOMPONEN UTAMA HALAMAN
// =================================================================================

const ForecastPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedGarden, setSelectedGarden] = useState("Spinach Garden 08");
    const [activeMenuItem, setActiveMenuItem] = useState("Forecast"); // Set menu aktif

    const [realtimeData, setRealtimeData] = useState(null);
    const [forecastData, setForecastData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Fungsi untuk mengambil dan memperbarui semua data
    const fetchData = () => {
        setLoading(true);
        setTimeout(() => {
            const newRealtimeData = generateDummyRealtimeData();
            setRealtimeData(newRealtimeData);
            setForecastData(generateDummyForecastData(newRealtimeData));
            setLastUpdated(new Date());
            setLoading(false);
        }, 1000);
    };

    useEffect(() => {
        fetchData();
    }, [selectedGarden]);

    // Menentukan status untuk setiap metrik real-time
    const getMetricStatus = (key, value) => {
        const val = parseFloat(value);
        switch (key) {
            case 'temperature': return val > 32 ? 'Waspada' : 'Optimal';
            case 'soil_moisture': return val < 50 ? 'Waspada' : 'Optimal';
            case 'ph_level': return val < 6 || val > 7.5 ? 'Waspada' : 'Optimal';
            default: return 'Optimal';
        }
    };

    const metrics = [
        { key: 'temperature', label: 'Suhu Tanah', icon: Thermometer, unit: '°C' },
        { key: 'soil_moisture', label: 'Kelembapan Tanah', icon: Droplet, unit: '%' },
        { key: 'ph_level', label: 'Tingkat pH', icon: Activity, unit: '' },
        { key: 'light_intensity', label: 'Intensitas Cahaya', icon: Sun, unit: 'lux' },
    ];
    
    return (
        <div className="min-h-screen bg-slate-50 flex text-slate-700">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeItem={activeMenuItem} onItemClick={(key, label) => setActiveMenuItem(label)} />
            <div className="flex-1 flex flex-col min-w-0">
                <Header onMenuClick={() => setSidebarOpen(true)} selectedGarden={selectedGarden} onGardenChange={(garden) => setSelectedGarden(garden)} />
                <div className="bg-white/60 backdrop-blur-sm border-b border-slate-200 px-6 py-2 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2"><Wifi className="w-3 h-3 text-emerald-500" /><span className="text-emerald-600 font-semibold">Terhubung</span></div>
                    <div className="flex items-center gap-2 text-slate-500"><Clock className="w-3 h-3" /><span>Data diperbarui pada: {lastUpdated.toLocaleTimeString()}</span></div>
                </div>
                
                <main className="flex-1 p-6 lg:p-8 overflow-auto">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Peramalan Kondisi Lahan</h1>
                            <p className="text-slate-500 mt-1">Analisis data real-time dan prediksi untuk 7 hari ke depan.</p>
                        </div>
                        <button onClick={fetchData} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-200">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Memuat Ulang...' : 'Perbarui Data'}
                        </button>
                    </div>

                    {/* Bagian Data Real-time */}
                    <div className="mb-10">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Kondisi Saat Ini</h2>
                        {loading ? <p>Memuat data...</p> : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {metrics.map(metric => (
                                    <RealtimeMetricCard 
                                        key={metric.key}
                                        icon={metric.icon}
                                        label={metric.label}
                                        value={realtimeData?.[metric.key]}
                                        unit={metric.unit}
                                        status={getMetricStatus(metric.key, realtimeData?.[metric.key])}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Bagian Peramalan */}
                    <div>
                         <h2 className="text-xl font-bold text-slate-800 mb-4">Peramalan & Rekomendasi 7 Hari</h2>
                         {loading ? <p>Memuat peramalan...</p> : (
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 grid grid-cols-1 gap-8">
                                    <ForecastChart title="Peramalan Kelembapan Tanah (%)" data={forecastData} metricKey="soil_moisture" color="#3b82f6" icon={Droplet} />
                                    <ForecastChart title="Peramalan Suhu Tanah (°C)" data={forecastData} metricKey="temperature" color="#f97316" icon={Thermometer} />
                                </div>
                                <div className="lg:col-span-1">
                                    <ForecastSummary forecastData={forecastData} />
                                </div>
                             </div>
                         )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ForecastPage;