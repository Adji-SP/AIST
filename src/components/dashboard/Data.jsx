// =================================================================================
// IMPORTS
// =================================================================================
import React, { useState, useMemo, useEffect } from 'react';
import Papa from 'papaparse';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Radar, Bar } from 'react-chartjs-2';
import { Leaf, Thermometer, Droplet, Wind, Sun, Activity, SlidersHorizontal, UploadCloud, FileText, X, LoaderCircle, CheckCircle, TrendingDown, TrendingUp, DollarSign, AlertTriangle, Package, FlaskConical } from 'lucide-react';

// Components & Custom Hooks
import Header from '../layout/header';
import Sidebar from '../layout/sidebar';
import keylimeBackground from '../images/image.png';
import { useApi } from '../../hook/useApiClean';
import { useSensorData as useFirestoreSensorData, useFinancialData as useFirestoreFinancialData, useFirestoreMutations } from '../../hook/useFirestoreClean';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale, Title, Tooltip, Legend, Filler);


// =================================================================================
// REUSABLE UI COMPONENTS (Tidak ada perubahan)
// =================================================================================

const MetricDisplayCard = ({ icon: Icon, title, value, unit }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
        <div className="p-3 rounded-full bg-green-50"><Icon className="w-6 h-6 text-green-600" /></div>
        <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-xl font-bold text-slate-800">{value} <span className="text-base font-medium text-slate-500">{unit}</span></p>
        </div>
    </div>
);

const ComparisonMetricCard = ({ title, value, icon: Icon, color, bgColor }) => {
    const colorClasses = { green: 'text-green-700', red: 'text-red-700', slate: 'text-slate-700' };
    const bgColorClasses = { green: 'bg-green-100', red: 'bg-red-100', slate: 'bg-slate-100' };
    return (
        <div className={`${bgColorClasses[bgColor]} p-4 rounded-lg border border-slate-200`}>
            <div className="flex items-center gap-3">
                <Icon className={`w-7 h-7 ${colorClasses[color]}`} />
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className={`text-xl font-bold ${colorClasses[color]}`}>Rp {value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
            </div>
        </div>
    );
};

const ProjectedResultCard = ({ icon: Icon, title, value, unit, description }) => (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 flex items-start gap-5 h-full">
        <div className="p-3 bg-green-100 rounded-lg flex-shrink-0">
            <Icon className="w-7 h-7 text-green-700" />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-4xl font-bold text-slate-800 my-1">{value.toLocaleString()}</p>
            <p className="text-base font-medium text-slate-600">{unit}</p>
            {description && <p className="text-xs text-slate-400 mt-2">{description}</p>}
        </div>
    </div>
);


const FileUploader = ({ onFileUpload, isLoading }) => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleFileProcess = (uploadedFile) => {
        if (!uploadedFile || !uploadedFile.type.startsWith('text/csv')) {
            setStatus('error'); setErrorMessage('Please upload a valid CSV file.'); return;
        }
        setFile(uploadedFile); setStatus('processing'); setErrorMessage('');
        Papa.parse(uploadedFile, {
            header: true, skipEmptyLines: true,
            complete: async (results) => {
                const success = await onFileUpload(results.data);
                if (success) { setStatus('success'); setTimeout(() => handleRemoveFile(), 5000); }
                else { setStatus('error'); setErrorMessage('Failed to upload data. Check console for details.'); }
            },
            error: (err) => { setStatus('error'); setErrorMessage(`CSV Parsing Error: ${err.message}`); }
        });
    };
    
    const handleDragEvents = (e, type) => { if (isLoading) return; e.preventDefault(); e.stopPropagation(); if (type === 'over') setStatus('dragging'); else if (type === 'leave') setStatus('idle'); };
    const handleDrop = (e) => { if (isLoading) return; handleDragEvents(e, 'leave'); handleFileProcess(e.dataTransfer.files[0]); };
    const handleRemoveFile = () => { setFile(null); setStatus('idle'); setErrorMessage(''); };

    const renderContent = () => {
        if (status === 'idle' || status === 'dragging') {
            return (
                <label
                    onDragOver={(e) => handleDragEvents(e, 'over')}
                    onDragLeave={(e) => handleDragEvents(e, 'leave')}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${status === 'dragging' ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className={`w-10 h-10 mb-3 ${status === 'dragging' ? 'text-green-600' : 'text-slate-400'}`} />
                        <p className="mb-2 text-sm text-slate-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-slate-400">CSV file up to 10MB</p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept=".csv"
                        disabled={isLoading}
                        onChange={(e) => handleFileProcess(e.target.files[0])}
                    />
                </label>
            );
        }
        return (
            <div className={`p-4 rounded-lg border ${status === 'success' ? 'bg-green-50 border-green-200' : status === 'error' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-4">
                    {status === 'success' && <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />}
                    {status === 'error' && <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />}
                    {(status === 'processing' || isLoading) && <FileText className="w-8 h-8 text-green-600 flex-shrink-0" />}
                    <div className="flex-grow">
                        <p className="font-semibold text-slate-800 truncate">{file?.name}</p>
                        <p className="text-sm text-slate-500">{((file?.size || 0) / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={handleRemoveFile} className="p-2 rounded-full hover:bg-slate-200">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                {(status === 'processing' || isLoading) && (
                    <div className="mt-3 flex items-center gap-3 text-sm text-slate-600">
                        <LoaderCircle className="w-4 h-4 animate-spin" /> <span>Parsing and uploading data...</span>
                    </div>
                )}
                {status === 'success' && (
                    <div className="mt-3 flex items-center gap-3 text-sm font-semibold text-green-700">
                        <CheckCircle className="w-4 h-4" /> <span>Upload successful! Data sent to collection.</span>
                    </div>
                )}
                {status === 'error' && (
                    <div className="mt-3 text-sm font-semibold text-red-700">{errorMessage}</div>
                )}
            </div>
        );
    };

    return (<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"><h2 className="text-xl font-bold text-slate-800 mb-4">Upload New Dataset</h2>{renderContent()}</div>);
};

const DataPage = () => {

    // =================================================================================
    // DATA LAYER & STATE MANAGEMENT
    // =================================================================================

    // --- 1. Real-time Backend Data (Firestore) ---
    // Real-time sensor data with Firestore real-time updates
    const { getSensorData } = useApi();
    const siteId = 'site_a_3_acres';
    
    // Use Firestore hooks for real-time data
    const firestoreSensorData = useFirestoreSensorData(siteId, 30);
    const firestoreFinancialData = useFirestoreFinancialData(siteId, 10);

    // Firestore data state
    const [loading, setLoading] = useState(false);
    const [fallbackSensorData, setFallbackSensorData] = useState(null);

    // CSV upload state
    const [uploading, setUploading] = useState(false);
    const [csvData, setCsvData] = useState(() => {
        // Initialize CSV data from localStorage if available
        try {
            const savedCsvData = localStorage.getItem('ipcc_csv_data');
            if (savedCsvData) {
                const parsedData = JSON.parse(savedCsvData);
                console.log('🔄 Loaded CSV data from localStorage:', parsedData.length, 'rows');
                return parsedData;
            }
            return [];
        } catch (error) {
            console.warn('Failed to load CSV data from localStorage:', error);
            return [];
        }
    });
    const { addDocument } = useFirestoreMutations('dataset_param');

    // Load fallback data if Firestore fails
    useEffect(() => {
        if (firestoreSensorData.error && !fallbackSensorData && !loading) {
            console.log('🔄 Firestore failed, falling back to API...');
            setLoading(true);
            getSensorData({ limit: 30 })
                .then(data => {
                    setFallbackSensorData(data || generateDummyData());
                    console.log('✅ Fallback data loaded');
                })
                .catch(() => {
                    console.log('⚠️ API fallback failed, using dummy data');
                    setFallbackSensorData(generateDummyData());
                })
                .finally(() => setLoading(false));
        }
    }, [firestoreSensorData.error, fallbackSensorData, loading, getSensorData]);

    // CSV upload handler
    const handleCsvUpload = async (csvRows) => {
        if (!csvRows || csvRows.length === 0) {
            console.error('No CSV data provided');
            return false;
        }

        setUploading(true);
        console.log('🚀 Starting CSV upload process...', csvRows.length, 'rows');

        try {
            const uploadPromises = csvRows.map(async (row, index) => {
                // Parse and validate numeric values
                const parseNumeric = (value) => {
                    if (value === null || value === undefined || value === '') return 0;
                    const parsed = parseFloat(String(value).replace(/[^\d.-]/g, ''));
                    return isNaN(parsed) ? 0 : parsed;
                };

                const docData = {
                    sample_id: 'data_analytics_site',
                    source: 'csv_upload',
                    temperature: parseNumeric(row.temperature || row.Temperature || row['Temperature (C)'] || row.temp || 0),
                    humidity: parseNumeric(row.humidity || row.Humidity || row.hum || 0),
                    organic_matter: parseNumeric(row.organic_matter || row['Organic Matter (%)'] || row['Organic Matter'] || row.om || 0),
                    nitrogen: parseNumeric(row.nitrogen || row.Nitrogen || row['Total Nitrogen (%)'] || row.N || 0),
                    phosphorus: parseNumeric(row.phosphorus || row.Phosphorus || row.P || 0),
                    potassium: parseNumeric(row.potassium || row.Potassium || row.K || 0),
                    soil_health: parseNumeric(row.soil_health || row['Soil Health'] || row['Total Carbon (%)'] || row.ph || 0),
                    timestamp: new Date().toISOString(),
                    row_index: index
                };

                console.log(`📊 Processing row ${index + 1}:`, docData);
                return await addDocument(docData);
            });

            const results = await Promise.all(uploadPromises);
            const successCount = results.filter(r => r.success).length;
            
            console.log(`✅ CSV upload completed: ${successCount}/${csvRows.length} rows saved`);
            
            // Store CSV data for metrics and charts
            setCsvData(csvRows);
            
            // Persist CSV data to localStorage
            try {
                localStorage.setItem('ipcc_csv_data', JSON.stringify(csvRows));
                console.log('✅ CSV data saved to localStorage');
            } catch (error) {
                console.warn('Failed to save CSV data to localStorage:', error);
            }
            
            return successCount > 0;
        } catch (error) {
            console.error('❌ CSV upload failed:', error);
            return false;
        } finally {
            setUploading(false);
        }
    };

    // Generate dummy data function
    const generateDummyData = () => {
        const dummyData = [];
        for (let i = 0; i < 30; i++) {
            dummyData.push({
                timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
                temperature: (25 + Math.random() * 10).toFixed(1),
                humidity: (60 + Math.random() * 20).toFixed(1),
                soil_health: (7.0 + Math.random() * 1.5).toFixed(1),
                nitrogen: (20 + Math.random() * 10).toFixed(1),
                phosphorus: (15 + Math.random() * 8).toFixed(1),
                potassium: (180 + Math.random() * 40).toFixed(1),
                organic_matter: (3.5 + Math.random() * 2).toFixed(1)
            });
        }
        return dummyData;
    };



    // Regenerative field count state
    const [regenerativeFieldCount, setRegenerativeFieldCount] = useState(3);


    // Use Firestore data with fallbacks
    const sensorData = React.useMemo(() => {
        // Priority: Firestore data > API fallback > dummy data
        if (firestoreSensorData.data && firestoreSensorData.data.length > 0) {
            console.log('🔥 Using Firestore sensor data:', firestoreSensorData.data.length, 'records');
            return firestoreSensorData.data;
        }
        
        if (fallbackSensorData) {
            console.log('📡 Using API fallback sensor data:', fallbackSensorData.length, 'records');
            return fallbackSensorData;
        }
        
        console.log('🎭 Using dummy sensor data for demo');
        return generateDummyData();
    }, [firestoreSensorData.data, fallbackSensorData]);

    // Current sensor data selection
    const currentSensorData = csvData.length > 0 ? csvData.map((row, index) => ({
        timestamp: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
        temperature: parseFloat(row.temperature || row.Temperature || row['Temperature (C)'] || 0) || 25.5,
        humidity: parseFloat(row.humidity || row.Humidity || 0) || 65.2,
        soil_health: parseFloat(row.soil_health || row['Total Carbon (%)'] || row.ph || 0) || 7.2,
        nitrogen: parseFloat(row.nitrogen || row['Total Nitrogen (%)'] || row.N || 0) || 22.1,
        phosphorus: parseFloat(row.phosphorus || row.P || 0) || 18.3,
        potassium: parseFloat(row.potassium || row.K || 0) || 195.7,
        organic_matter: parseFloat(row.organic_matter || row['Organic Matter (%)'] || row.om || 0) || 4.2
    })) : sensorData;

    // Site/garden profile (could be fetched from sites API)
    const [gardenProfile] = useState({
        name: "Key Lime",
        description: "The Key Lime (*Citrus aurantiifolia*) is a small, highly aromatic citrus fruit prized for its distinctively tart and flavorful juice. Unlike other limes, it has a higher acidity, a stronger aroma, and a thinner rind. <br/><br/> Thriving in well-drained soil and sunny conditions, this crop is sensitive to fluctuations in soil pH, moisture, and nutrient balance. This dashboard provides the real-time data crucial for managing these parameters, preventing disease, and ensuring a healthy, high-yield orchard.",
        imageUrl: keylimeBackground
    });

    // App configuration
    const appConfig = {
        siteProfile: {
            name: gardenProfile.name,
            description: gardenProfile.description
        },
        metrics: [
            { key: 'temperature', label: 'Temperature', unit: '°C', icon: Thermometer },
            { key: 'humidity', label: 'Humidity', unit: '%', icon: Droplet },
            { key: 'soil_health', label: 'Soil Health', unit: 'pH', icon: Activity },
            { key: 'organic_matter', label: 'Organic Matter', unit: '%', icon: Leaf }
        ],
        palette: {
            primary: '#22c55e',
            primary_transparent: 'rgba(34, 197, 94, 0.1)',
            secondary: '#3b82f6',
            secondary_transparent: 'rgba(59, 130, 246, 0.1)',
            secondary_light: '#dbeafe',
            primary_light: '#dcfce7',
            text_secondary: '#64748b',
            border: '#e2e8f0'
        },
        baseValues: {
            conventional: {
                yield: 12000,
                costBenefit: 2.2
            },
            regenerative: {
                yield: 15500,
                costBenefit: 3.8
            }
        }
    };

    // Color palette
    const palette = appConfig.palette;

    // Financial metrics (use Firestore data if available)
    const financialMetrics = React.useMemo(() => {
        if (firestoreFinancialData.data && firestoreFinancialData.data.length > 0) {
            const latest = firestoreFinancialData.data[0];
            console.log('💰 Using Firestore financial data:', latest);
            return {
                convCost: latest.conventional_cost || 5330,
                regenCost: latest.regenerative_cost || 4260,
                revenue: latest.revenue || 15500
            };
        }
        
        console.log('💰 Using default financial data');
        return {
            convCost: 5330,
            regenCost: 4260,
            revenue: 15500
        };
    }, [firestoreFinancialData.data]);


    // --- 2. UI-Specific State ---
    // State ini mengontrol elemen UI dan input dari pengguna, tidak langsung terkait dengan data backend.

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedGarden] = useState("Primary Key Lime Orchard");
    const [selectedMetric, setSelectedMetric] = useState('soil_health');
    const [comparisonRatio, setComparisonRatio] = useState(9);
    const [microalgaeInput, setMicroalgaeInput] = useState(6000);
    const [landAreaInput, setLandAreaInput] = useState(3);


    // =================================================================================
    // DATA PROCESSING & CALCULATIONS (Memoized)
    // =================================================================================
    // Bagian ini memproses data mentah dari state menjadi format yang siap untuk ditampilkan.

    const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', align: 'end', labels: { color: palette.text_secondary, boxWidth: 12 } } }, scales: { y: { grid: { color: palette.border }, ticks: { color: palette.text_secondary } }, x: { grid: { display: false }, ticks: { color: palette.text_secondary } } } };

    const processedData = useMemo(() => {
        if (!appConfig || currentSensorData.length === 0) return { latestReading: {}, mainLineChartData: { labels: [], datasets: [] }, radarData: { labels: [], datasets: [] }, nutrientData: { labels: [], datasets: [] }, soilHealthTrendData: { labels: [], datasets: [] } };
        const { palette } = appConfig;
        
        // Use first row of CSV data for metrics (as requested), or latest sensor data as fallback
        const latestReading = csvData.length > 0 ? {
            temperature: parseFloat(csvData[0].temperature || csvData[0].Temperature || csvData[0]['Temperature (C)'] || 0) || 25.5,
            humidity: parseFloat(csvData[0].humidity || csvData[0].Humidity || 0) || 65.2,
            soil_health: parseFloat(csvData[0].soil_health || csvData[0]['Total Carbon (%)'] || csvData[0].ph || 0) || 7.2,
            nitrogen: parseFloat(csvData[0].nitrogen || csvData[0]['Total Nitrogen (%)'] || csvData[0].N || 0) || 22.1,
            phosphorus: parseFloat(csvData[0].phosphorus || csvData[0].P || 0) || 18.3,
            potassium: parseFloat(csvData[0].potassium || csvData[0].K || 0) || 195.7,
            organic_matter: parseFloat(csvData[0].organic_matter || csvData[0]['Organic Matter (%)'] || csvData[0].om || 0) || 4.2
        } : currentSensorData[currentSensorData.length - 1];
        
        const labels = currentSensorData.map((d, i) => csvData.length > 0 ? `Row ${i + 1}` : new Date(d.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }));
        
        return {
            latestReading,
            mainLineChartData: { 
                labels, 
                datasets: [
                    { 
                        label: 'Selected Metric', 
                        data: currentSensorData.map(d => parseFloat(d[selectedMetric]) || 0), 
                        borderColor: palette.primary, 
                        backgroundColor: palette.primary_transparent, 
                        fill: true, 
                        tension: 0.4, 
                        pointRadius: 1 
                    }, 
                    { 
                        label: '7-Day Moving Average', 
                        data: currentSensorData.map((_, i, arr) => {
                            const slice = arr.slice(Math.max(0, i - 6), i + 1);
                            const sum = slice.reduce((acc, val) => acc + (parseFloat(val[selectedMetric]) || 0), 0);
                            return (sum / Math.min(i + 1, 7)).toFixed(1);
                        }), 
                        borderColor: palette.secondary, 
                        borderDash: [5, 5], 
                        fill: false, 
                        tension: 0.4, 
                        pointRadius: 0 
                    }
                ] 
            },
            radarData: { 
                labels: ['Health', 'Humidity', 'Nitrogen', 'Phosphorus', 'Potassium', 'Organic Matter'], 
                datasets: [{
                    label: 'Current Performance (Avg)', 
                    data: ['soil_health', 'humidity', 'nitrogen', 'phosphorus', 'potassium', 'organic_matter'].map(metric => {
                        const slice = currentSensorData.slice(-7);
                        const sum = slice.reduce((sum, d) => sum + (parseFloat(d[metric]) || 0), 0);
                        return (sum / Math.max(1, Math.min(7, currentSensorData.length))).toFixed(1);
                    }), 
                    backgroundColor: 'rgba(59, 130, 246, 0.2)', 
                    borderColor: '#3b82f6', 
                    borderWidth: 2 
                }] 
            },
            nutrientData: { 
                labels: ['Nitrogen', 'Phosphorus', 'Potassium'], 
                datasets: [{ 
                    label: 'Average Level (ppm)', 
                    data: ['nitrogen', 'phosphorus', 'potassium'].map(nutrient => {
                        const sum = currentSensorData.reduce((s, d) => s + (parseFloat(d[nutrient]) || 0), 0);
                        return (sum / currentSensorData.length).toFixed(1);
                    }), 
                    backgroundColor: ['#22c55e', '#f59e0b', '#8b5cf6'] 
                }] 
            },
            soilHealthTrendData: { 
                labels, 
                datasets: [{ 
                    label: 'Soil Health', 
                    data: currentSensorData.map(d => parseFloat(d.soil_health) || 0), 
                    borderColor: palette.secondary, 
                    backgroundColor: palette.secondary_transparent, 
                    fill: true, 
                    tension: 0.3, 
                    pointRadius: 0 
                }] 
            }
        };
    }, [currentSensorData, selectedMetric, appConfig, csvData]);
    
    const comparisonChartsData = useMemo(() => {
        if (!appConfig) return { yieldChartData: {}, costBenefitChartData: {} };
        const { conventional, regenerative } = appConfig.baseValues;
        const { palette } = appConfig;
        return {
            yieldChartData: { labels: ['Total Conventional'], datasets: [{ label: 'Yield Potential (kg/ha)', data: [conventional.yield, regenerative.yield], backgroundColor: [palette.secondary_light, palette.primary_light], borderColor: [palette.secondary, palette.primary], borderWidth: 1, borderRadius: 4 }] },
            costBenefitChartData: { labels: ['Conventional Ref.', 'Regenerative'], datasets: [{ label: 'Cost-Benefit Ratio', data: [conventional.costBenefit, regenerative.costBenefit], backgroundColor: [palette.secondary_light, palette.primary_light], borderColor: [palette.secondary, palette.primary], borderWidth: 1, borderRadius: 4 }] }
        };
    }, [appConfig]);

    // =================================================================================
    // >>>>> PERUBAHAN DIMULAI DI SINI <<<<<
    // =================================================================================
    const simulationResults = useMemo(() => {
        if (!appConfig || landAreaInput <= 0) {
            return { totalRegenerativeAreaHa: 0, requiredMicroalgae: 0, projectedHarvest: 0, operationalCost: 0 };
        }
        
        // 1. Hitung total luas lahan regeneratif
        const totalRegenerativeAreaHa = regenerativeFieldCount * landAreaInput;

        // 2. Hitung kebutuhan mikroalga untuk total lahan regeneratif
        const regenerativeAreaM2 = totalRegenerativeAreaHa * 10000;
        const soilVolumeM3 = regenerativeAreaM2 * 0.4;
        const microalgaeVolumeM3 = soilVolumeM3 * 0.0005;
        const requiredMicroalgae = Math.round(microalgaeVolumeM3 * 1000);

        // 3. Hitung proyeksi panen dari total lahan regeneratif
        const projectedHarvest = Math.round(totalRegenerativeAreaHa * appConfig.baseValues.regenerative.yield);

        // 4. Hitung biaya operasional berdasarkan logika baru
        const microalgaeCost = requiredMicroalgae * 0.1; // RM 0.1 per liter
        const pesticideLiters = requiredMicroalgae / 1500; // Rasio 1:1500
        const pesticideCost = pesticideLiters * (5500 / 2); // RM 55 per 2 liter
        const operationalCost = microalgaeCost + pesticideCost;

        return { totalRegenerativeAreaHa, requiredMicroalgae, projectedHarvest, operationalCost };

    }, [landAreaInput, regenerativeFieldCount, appConfig]);
    // =================================================================================
    // >>>>> PERUBAHAN SELESAI DI SINI <<<<<
    // =================================================================================


    // LAYER 4: PRESENTATION
    if (loading.config || loading.sensorData) return <div className="flex items-center justify-center min-h-screen bg-slate-50"><LoaderCircle className="w-12 h-12 text-green-600 animate-spin" /><p className="ml-4 text-lg font-semibold text-slate-700">Loading Dashboard Data...</p></div>;
    
    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)} />
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <Header onMenuClick={() => setSidebarOpen(true)} selectedGarden={appConfig.siteProfile.name} onGardenChange={() => { }} />
                <main className="flex-1 p-4 sm:p-6 overflow-auto">
                    {/* Firestore Connection Status */}
                    <div className={`mb-4 p-3 border rounded-lg flex items-center gap-2 ${
                        !firestoreSensorData.loading && !firestoreSensorData.error ? 'bg-green-50 border-green-200' :
                        firestoreSensorData.loading ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
                    }`}>
                        <div className={`w-2 h-2 rounded-full ${
                            !firestoreSensorData.loading && !firestoreSensorData.error ? 'bg-green-500 animate-pulse' :
                            firestoreSensorData.loading ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                        }`}></div>
                        <span className={`font-medium ${
                            !firestoreSensorData.loading && !firestoreSensorData.error ? 'text-green-700' :
                            firestoreSensorData.loading ? 'text-yellow-700' : 'text-red-700'
                        }`}>
                            {!firestoreSensorData.loading && !firestoreSensorData.error ? '🔥 Firestore Connected - Real-time updates active' :
                             firestoreSensorData.loading ? '⏳ Connecting to Firestore...' : 
                             `❌ Using Fallback Data - ${firestoreSensorData.error?.message || 'Connection failed'}`}
                        </span>
                    </div>
                    {loading && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                            <LoaderCircle className="w-4 h-4 text-blue-600 animate-spin" />
                            <span className="text-blue-700 font-medium">Loading sensor data...</span>
                        </div>
                    )}
                    <div className="relative p-8 rounded-xl shadow-lg overflow-hidden mb-6 bg-cover bg-center" style={{ backgroundImage: `url(${gardenProfile.imageUrl})` }}>
                        <div className="absolute inset-0 bg-black/60"></div>
                        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
                            <div className="md:col-span-2"><h2 className="text-3xl font-extrabold mb-3">Crop Profile: {appConfig.siteProfile.name}</h2><p className="text-slate-200 text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: appConfig.siteProfile.description }}></p></div>
                            <div className="p-6 bg-black/30 rounded-lg"><h3 className="text-xl font-bold mb-4">Ideal Soil Set Points</h3><ul className="space-y-3 text-base"><li className="flex items-center gap-3"><Droplet className="w-5 h-5 text-green-400" /><span><strong>CEC:</strong> 21,94 </span></li><li className="flex items-center gap-3"><Droplet className="w-5 h-5 text-green-400" /><span><strong>Nitrogen:</strong> 0,53 %</span></li><li className="flex items-center gap-3"><Sun className="w-5 h-5 text-green-400" /><span><strong>Nitrogen (N):</strong> 18 - 25 ppm</span></li><li className="flex items-center gap-3"><Activity className="w-5 h-5 text-green-400" /><span><strong>Phosphorus (P):</strong> 8 - 25 ppm</span></li><li className="flex items-center gap-3"><Wind className="w-5 h-5 text-green-400" /><span><strong>Potassium (K):</strong> 173,9 ppm</span></li></ul></div>
                        </div>
                    </div>                    {/* this metrix display is from the dataset collection variable,... show em all*/}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"> {appConfig.metrics.map(metric => <MetricDisplayCard key={metric.key} icon={metric.icon} title={metric.label} value={processedData.latestReading?.[metric.key] || 'N/A'} unit={metric.unit} />)} </div>
                    {/* this input of file uploader is insert into dataset collection */}
                    <div className="mb-6"><FileUploader onFileUpload={handleCsvUpload} isLoading={uploading || apiLoading} /></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200"><div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4"><h3 className="text-lg font-bold text-slate-800 mb-2 sm:mb-0">Metric Statistics Over Time</h3><select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)} className="text-sm border-slate-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-green-300 focus:border-green-300">{appConfig.metrics.map(metric => <option key={metric.key} value={metric.key}>{metric.label}</option>)}</select></div><div className="h-80"><Line data={processedData.mainLineChartData} options={chartOptions} /></div></div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"><h3 className="text-lg font-bold text-slate-800 mb-4">Overall Performance</h3><div className="h-80"><Radar data={processedData.radarData} options={{ ...chartOptions, scales: { r: { pointLabels: { font: { size: 10 } }, grid: { color: appConfig.palette.border } } } }} /></div></div>
                        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200"><h3 className="text-lg font-bold text-slate-800 mb-4">Average Nutrient Levels (NPK)</h3><div className="h-64"><Bar data={processedData.nutrientData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} /></div></div>
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200"><h3 className="text-lg font-bold text-slate-800 mb-4">Soil Health (30-Day Trend)</h3><p className="text-xs text-slate-500 -mt-3 mb-4">A stable or upward trend indicates positive soil activity.</p><div className="h-52"><Line data={processedData.soilHealthTrendData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} /></div></div>
                    </div>

                    <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Regenerative Farming Simulation</h2>
                        
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8">
                            <h3 className="text-lg font-bold text-slate-700 mb-4">Step 1: Define Regenerative Fields</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div>
                                    <h4 className="font-semibold text-slate-600">Size per Field</h4>
                                    <label htmlFor="landarea" className="block text-sm font-medium text-slate-700 my-1">Enter area per field in Hectares (Ha)</label>
                                    <input type="number" id="landarea" value={landAreaInput} onChange={(e) => setLandAreaInput(Number(e.target.value))} className="w-full border-slate-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2"><h4 className="font-semibold text-slate-600">Number of Fields</h4><SlidersHorizontal className="w-5 h-5 text-slate-400" /></div>
                                    <p className="text-xs text-slate-500 mb-4">Use the slider to set the number of regenerative fields for this simulation.</p>
                                    <input type="range" min="1" max="10" value={regenerativeFieldCount} onChange={(e) => setRegenerativeFieldCount(parseInt(e.target.value, 10))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600" />
                                    <div className="flex justify-between text-sm font-medium text-slate-600 mt-2">
                                        <span>Fields: <strong>{regenerativeFieldCount}</strong></span>
                                        <span>Total Area: <strong>{simulationResults.totalRegenerativeAreaHa.toFixed(2)} Ha</strong></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-bold text-slate-700 mb-4">Step 2: Review Simulation Results</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <ComparisonMetricCard title="Conventional Cost Ref. (6-mo)" value={financialMetrics.convCost} icon={TrendingDown} color="red" bgColor="red" />
                                <ComparisonMetricCard title="Regenerative Revenue per Month" value={financialMetrics.regenCost} icon={TrendingUp} color="green" bgColor="green" />
                                {/* ======================================================================= */}
                                {/* >>>>> PERUBAHAN DI SINI: Menggunakan nilai dari simulationResults <<<<< */}
                                {/* ======================================================================= */}
                                <ComparisonMetricCard title="Operational Cost per Month" value={simulationResults.operationalCost} icon={DollarSign} color="slate" bgColor="slate" />
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                <div className="lg:col-span-2 flex flex-col gap-6">
                                    <ProjectedResultCard icon={Package} title="Total Projected Harvest" value={simulationResults.projectedHarvest} unit="Kilograms (kg)" description={`Harvest (Kg) = 23902.86 + (-198.40 * Nitrogen) + (-1831.07 * Organic Matter) + (-241.60 * Carbon)`} />
                                    <ProjectedResultCard icon={FlaskConical} title="Required Microalgae" value={simulationResults.requiredMicroalgae} unit="Liters (L)" description={`Based on the soil formula for a total of ${simulationResults.totalRegenerativeAreaHa.toFixed(2)} Ha and The Ratio Pesticide with MIcroalgae is 1 : 1500`} />
                                </div>
                                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200"><h3 className="font-bold text-center text-slate-800 mb-4">Yield Potential (kg/ha)</h3><div className="h-64"><Bar data={comparisonChartsData.yieldChartData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} /></div></div>
                                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200"><h3 className="font-bold text-center text-slate-800 mb-4">Cost-Benefit Ratio</h3><div className="h-64"><Bar data={comparisonChartsData.costBenefitChartData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} /></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DataPage;