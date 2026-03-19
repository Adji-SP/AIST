// =================================================================================
// SOIL QUALITY ANALYTICS DASHBOARD v2
// Restored: Header, Sidebar, CSV Import, Firestore hooks
// Added: NPK Analytics, Yield + Pentagonal Radar, Manual Input Modal
// =================================================================================
import React, { useState, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, RadialLinearScale, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar, Radar } from 'react-chartjs-2';
import {
    Leaf, Droplets, Activity, Wifi, WifiOff, Download, FileText,
    Share2, Eye, TrendingUp, TrendingDown, AlertTriangle, BarChart3,
    Info, Loader2, UploadCloud, X, CheckCircle, FlaskConical, Zap,
    Plus, Sliders, Save, Package
} from 'lucide-react';

// Layout
import Header from '../layout/header';
import Sidebar from '../layout/sidebar';

// Analytics Components
import SoilTextureTriangle, { getTextureClass } from '../charts/SoilTextureTriangle';
import NutrientHeatmap from '../charts/NutrientHeatmap';
import PredictionEngine from '../analytics/PredictionEngine';

// Hooks
import { useSensorData as useFirestoreSensorData, useFirestoreMutations } from '@lib/client/hooks/useFirestore';
import { useAuth } from '../../auth/AuthContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale, Title, Tooltip, Legend, Filler);


// =================================================================================
// DEMO DATA
// =================================================================================

const DEMO_SOIL = { sand: 45, silt: 35, clay: 20, ph: 6.5, moisture: 28.5, organic_matter: 4.2, nitrogen: 24, phosphorus: 18, potassium: 185 };

const DEMO_SAMPLES = [
    { id: 'Sample 01', nitrogen: 30, phosphorus: 15, potassium: 125, ph: 6.3, organic_matter: 4.5, moisture: 21.5 },
    { id: 'Sample 02', nitrogen: 19, phosphorus: 12, potassium: 125, ph: 6.1, organic_matter: 2.1, moisture: 34.5 },
    { id: 'Sample 03', nitrogen: 8.2, phosphorus: 6.5, potassium: 60, ph: 7.3, organic_matter: 5.8, moisture: 22.0 },
];

const generateTrend = () => {
    const days = 30, now = Date.now();
    return Array.from({ length: days }, (_, i) => ({
        date: new Date(now - (days - 1 - i) * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        ph: +(6.2 + Math.sin(i / 5) * 0.4 + Math.random() * 0.2).toFixed(2),
        moisture: +(25 + Math.sin(i / 3) * 8 + Math.random() * 5).toFixed(1),
        organic_matter: +(4.0 + Math.sin(i / 7) * 0.8 + Math.random() * 0.3).toFixed(2),
        nitrogen: +(20 + Math.sin(i / 4) * 6 + Math.random() * 3).toFixed(1),
        phosphorus: +(14 + Math.sin(i / 6) * 4 + Math.random() * 2).toFixed(1),
        potassium: +(150 + Math.sin(i / 5) * 30 + Math.random() * 15).toFixed(0),
    }));
};
const DEMO_TREND = generateTrend();


// =================================================================================
// CSV FILE UPLOADER (RESTORED + ENHANCED)
// =================================================================================
const FileUploader = ({ onFileUpload, isLoading }) => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [preview, setPreview] = useState(null);

    const process = (uploaded) => {
        if (!uploaded || !uploaded.name.endsWith('.csv')) {
            setStatus('error'); setErrorMsg('Please upload a valid CSV file.'); return;
        }
        setFile(uploaded); setStatus('processing'); setErrorMsg('');
        Papa.parse(uploaded, {
            header: true, skipEmptyLines: true,
            complete: async (results) => {
                if (results.data.length > 0) setPreview(results.data.slice(0, 5));
                const success = await onFileUpload(results.data);
                if (success) { setStatus('success'); setTimeout(() => reset(), 5000); }
                else { setStatus('error'); setErrorMsg('Upload failed. Check console.'); }
            },
            error: (err) => { setStatus('error'); setErrorMsg(`Parse error: ${err.message}`); }
        });
    };

    const handleDrag = (e, type) => { if (isLoading) return; e.preventDefault(); e.stopPropagation(); if (type === 'over') setStatus('dragging'); else if (type === 'leave') setStatus('idle'); };
    const handleDrop = (e) => { if (isLoading) return; handleDrag(e, 'leave'); process(e.dataTransfer.files[0]); };
    const reset = () => { setFile(null); setStatus('idle'); setErrorMsg(''); setPreview(null); };

    if (status === 'idle' || status === 'dragging') {
        return (
            <label onDragOver={e => handleDrag(e, 'over')} onDragLeave={e => handleDrag(e, 'leave')} onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${status === 'dragging' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <UploadCloud className={`w-8 h-8 mb-2 ${status === 'dragging' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <p className="text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag & drop</p>
                <p className="text-xs text-slate-400 mt-1">CSV file up to 10MB</p>
                <input type="file" className="hidden" accept=".csv" disabled={isLoading} onChange={e => process(e.target.files[0])} />
            </label>
        );
    }

    return (
        <div className={`p-4 rounded-xl border ${status === 'success' ? 'bg-emerald-50 border-emerald-200' : status === 'error' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-3">
                {status === 'success' && <CheckCircle className="w-6 h-6 text-emerald-600" />}
                {status === 'error' && <AlertTriangle className="w-6 h-6 text-red-600" />}
                {(status === 'processing' || isLoading) && <FileText className="w-6 h-6 text-emerald-600" />}
                <div className="flex-grow">
                    <p className="font-semibold text-slate-800 text-sm truncate">{file?.name}</p>
                    <p className="text-xs text-slate-500">{((file?.size || 0) / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={reset} className="p-1.5 rounded-full hover:bg-slate-200"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            {(status === 'processing' || isLoading) && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-600"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Parsing & uploading…</div>
            )}
            {status === 'success' && <div className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Upload successful!</div>}
            {status === 'error' && <div className="mt-2 text-xs text-red-700 font-semibold">{errorMsg}</div>}
            {preview && status === 'processing' && (
                <div className="mt-3 overflow-x-auto max-h-32 border rounded-lg border-slate-200">
                    <table className="text-[10px] w-full">
                        <thead><tr className="bg-slate-100">{Object.keys(preview[0]).slice(0, 6).map(k => <th key={k} className="px-2 py-1 text-left font-bold text-slate-500">{k}</th>)}</tr></thead>
                        <tbody>{preview.map((r, i) => <tr key={i}>{Object.values(r).slice(0, 6).map((v, j) => <td key={j} className="px-2 py-1 text-slate-600">{v}</td>)}</tr>)}</tbody>
                    </table>
                </div>
            )}
        </div>
    );
};


// =================================================================================
// MANUAL INPUT MODAL
// =================================================================================
const ManualInputModal = ({ isOpen, onClose, onSave }) => {
    const [form, setForm] = useState({ sand: 45, silt: 35, clay: 20, ph: 6.5, moisture: 28, organic_matter: 4.0, nitrogen: 22, phosphorus: 15, potassium: 150, temperature: 28, rainfall: 10 });
    const [saving, setSaving] = useState(false);

    const updateField = (key, val) => {
        const num = parseFloat(val) || 0;
        if (['sand', 'silt', 'clay'].includes(key)) {
            // Auto-balance: adjust the other two proportionally so sum = 100
            const others = ['sand', 'silt', 'clay'].filter(k => k !== key);
            const remaining = 100 - num;
            const otherSum = form[others[0]] + form[others[1]];
            const ratio = otherSum > 0 ? remaining / otherSum : 0.5;
            setForm(prev => ({
                ...prev, [key]: num,
                [others[0]]: Math.round(prev[others[0]] * ratio),
                [others[1]]: Math.round(prev[others[1]] * ratio),
            }));
        } else {
            setForm(prev => ({ ...prev, [key]: num }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        await onSave(form);
        setSaving(false);
        onClose();
    };

    if (!isOpen) return null;

    const sum = form.sand + form.silt + form.clay;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-2xl">
                    <div>
                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2"><Sliders className="w-4 h-4 text-emerald-600" /> Manual Soil Input</h3>
                        <p className="text-xs text-slate-500">Enter soil parameters manually</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200"><X className="w-5 h-5 text-slate-500" /></button>
                </div>

                <div className="p-5 space-y-5">
                    {/* Composition (sliders) */}
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Soil Composition (must total 100%)</p>
                        {['sand', 'silt', 'clay'].map(key => (
                            <div key={key} className="mb-3">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-semibold text-slate-600 capitalize">{key}</span>
                                    <span className="font-bold text-slate-800">{form[key]}%</span>
                                </div>
                                <input type="range" min="0" max="100" value={form[key]} onChange={e => updateField(key, e.target.value)}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                            </div>
                        ))}
                        {sum !== 100 && (
                            <div className="flex items-center gap-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-700">
                                <AlertTriangle className="w-3.5 h-3.5" /> Total: {sum}% (should be 100%)
                            </div>
                        )}
                    </div>

                    {/* Chemistry */}
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Chemistry</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { key: 'ph', label: 'pH', unit: '', range: '6.0–7.0' },
                                { key: 'moisture', label: 'Moisture', unit: '%', range: '20–40%' },
                                { key: 'organic_matter', label: 'Organic Matter', unit: '%', range: '3–6%' },
                                { key: 'nitrogen', label: 'Nitrogen (N)', unit: 'ppm', range: '18–30' },
                                { key: 'phosphorus', label: 'Phosphorus (P)', unit: 'ppm', range: '10–25' },
                                { key: 'potassium', label: 'Potassium (K)', unit: 'ppm', range: '100–200' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="text-[10px] font-semibold text-slate-600">{f.label} {f.unit && <span className="text-slate-400 font-normal">({f.unit})</span>}</label>
                                    <input type="number" step="0.1" value={form[f.key]} onChange={e => updateField(f.key, e.target.value)}
                                        className="w-full mt-0.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-300" />
                                    <span className="text-[8px] text-slate-400">Optimal: {f.range}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Environment (optional) */}
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Environment (Optional)</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { key: 'temperature', label: 'Temperature', unit: '°C' },
                                { key: 'rainfall', label: 'Rainfall', unit: 'mm' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="text-[10px] font-semibold text-slate-600">{f.label} <span className="text-slate-400 font-normal">({f.unit})</span></label>
                                    <input type="number" step="0.1" value={form[f.key]} onChange={e => updateField(f.key, e.target.value)}
                                        className="w-full mt-0.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-300" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50 rounded-b-2xl">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
                    <button onClick={handleSave} disabled={saving || sum !== 100}
                        className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5">
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save as New Sample
                    </button>
                </div>
            </div>
        </div>
    );
};


// =================================================================================
// MAIN DATA PAGE
// =================================================================================
const DataPage = () => {
    const siteId = 'site_a_3_acres';
    const { role, userDevices } = useAuth();
    const firestoreSensor = useFirestoreSensorData(siteId, 30, role, userDevices);
    const { addDocument } = useFirestoreMutations('dataset_param');

    // UI State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [timeRange, setTimeRange] = useState('30d');
    const [visibleMetrics, setVisibleMetrics] = useState({ ph: true, moisture: true, organic_matter: true, nitrogen: false, phosphorus: false, potassium: false });
    const [uploading, setUploading] = useState(false);
    const [manualOpen, setManualOpen] = useState(false);
    const [dataSource, setDataSource] = useState('demo'); // 'demo' | 'csv' | 'manual' | 'live'
    const [selectedSample, setSelectedSample] = useState(0);

    // CSV data
    const [csvData, setCsvData] = useState(() => {
        try {
            const saved = localStorage.getItem('ipcc_csv_data');
            if (saved) { const d = JSON.parse(saved); if (d.length > 0) return d; }
        } catch (e) { /* ignore */ }
        return [];
    });

    // CSV Upload Handler (restored from original)
    const handleCsvUpload = useCallback(async (csvRows) => {
        if (!csvRows || csvRows.length === 0) return false;
        setUploading(true);
        try {
            const parseN = (v) => { if (v == null || v === '') return 0; const n = parseFloat(String(v).replace(/[^\d.-]/g, '')); return isNaN(n) ? 0 : n; };
            const uploads = csvRows.map(async (row, i) => {
                const doc = {
                    sample_id: 'data_analytics_site', source: 'csv_upload',
                    temperature: parseN(row.temperature || row.Temperature || row['Temperature (C)']),
                    humidity: parseN(row.humidity || row.Humidity),
                    organic_matter: parseN(row.organic_matter || row['Organic Matter (%)'] || row['Organic Matter']),
                    nitrogen: parseN(row.nitrogen || row.Nitrogen || row['Total Nitrogen (%)'] || row.N),
                    phosphorus: parseN(row.phosphorus || row.Phosphorus || row.P),
                    potassium: parseN(row.potassium || row.Potassium || row.K),
                    soil_health: parseN(row.soil_health || row['Total Carbon (%)'] || row.ph),
                    timestamp: new Date().toISOString(), row_index: i
                };
                return await addDocument(doc);
            });
            const results = await Promise.all(uploads);
            const ok = results.filter(r => r.success).length;
            setCsvData(csvRows);
            setDataSource('csv');
            try { localStorage.setItem('ipcc_csv_data', JSON.stringify(csvRows)); } catch (e) { /* ignore */ }
            return ok > 0;
        } catch (err) { console.error('CSV upload failed:', err); return false; }
        finally { setUploading(false); }
    }, [addDocument]);

    // Manual Input Save Handler
    const handleManualSave = useCallback(async (form) => {
        try {
            await addDocument({
                ...form, sample_id: 'manual_entry', source: 'manual',
                timestamp: new Date().toISOString(),
            });
            setDataSource('manual');
        } catch (e) { console.error('Manual save failed:', e); }
    }, [addDocument]);

    // ─── REACTIVE DATA: CSV → Firestore → Demo fallback ────────────────────
    // Helper to parse CSV column names flexibly
    const parseN = (row, ...keys) => {
        for (const k of keys) { if (row[k] != null && row[k] !== '') return parseFloat(row[k]) || 0; }
        return 0;
    };

    // Convert raw CSV rows into normalized sample objects
    const csvSamples = useMemo(() => {
        if (csvData.length === 0) return [];
        return csvData.map((r, i) => ({
            id: r.sample_id || r.Sample || r.id || `CSV Row ${i + 1}`,
            nitrogen: parseN(r, 'nitrogen', 'Nitrogen', 'N', 'Total Nitrogen (%)'),
            phosphorus: parseN(r, 'phosphorus', 'Phosphorus', 'P'),
            potassium: parseN(r, 'potassium', 'Potassium', 'K'),
            ph: parseN(r, 'ph', 'pH', 'soil_health'),
            organic_matter: parseN(r, 'organic_matter', 'Organic Matter (%)', 'Organic Matter', 'OM'),
            moisture: parseN(r, 'moisture', 'Moisture', 'Moisture (%)'),
            sand: parseN(r, 'sand', 'Sand'),
            silt: parseN(r, 'silt', 'Silt'),
            clay: parseN(r, 'clay', 'Clay'),
            temperature: parseN(r, 'temperature', 'Temperature', 'Temperature (C)'),
        }));
    }, [csvData]);

    // ★ currentSamples: ALL charts derive from this (reactive to CSV upload)
    const currentSamples = useMemo(() => csvSamples.length > 0 ? csvSamples : DEMO_SAMPLES, [csvSamples]);

    // Current soil data (for texture triangle — uses selected sample)
    const soilData = useMemo(() => {
        if (currentSamples.length > 0 && currentSamples !== DEMO_SAMPLES) {
            const r = currentSamples[selectedSample] || currentSamples[0];
            return {
                sand: r.sand || 45, silt: r.silt || 35, clay: r.clay || 20,
                ph: r.ph || 6.5, moisture: r.moisture || 28, organic_matter: r.organic_matter || 4,
                nitrogen: r.nitrogen || 22, phosphorus: r.phosphorus || 15, potassium: r.potassium || 150,
            };
        }
        return DEMO_SOIL;
    }, [currentSamples, selectedSample]);

    const textureClass = getTextureClass(soilData.sand, soilData.silt, soilData.clay);

    // Trend data — uses CSV if available, otherwise demo
    const trendData = useMemo(() => {
        // If CSV data has timestamps/rows, create trend from it
        if (csvSamples.length > 1) {
            const sliced = timeRange === '24h' ? csvSamples.slice(-1) : timeRange === '7d' ? csvSamples.slice(-7) : csvSamples;
            return sliced.map((s, i) => ({
                date: s.id || `Row ${i + 1}`,
                ph: s.ph, moisture: s.moisture, organic_matter: s.organic_matter,
                nitrogen: s.nitrogen, phosphorus: s.phosphorus, potassium: s.potassium / 10, // scaled
            }));
        }
        const demo = timeRange === '24h' ? DEMO_TREND.slice(-1) : timeRange === '7d' ? DEMO_TREND.slice(-7) : DEMO_TREND;
        return demo.map(d => ({ ...d, potassium: +(d.potassium / 10).toFixed(1) }));
    }, [timeRange, csvSamples]);

    // Color palette for ALL 6 metrics
    const C = {
        ph: { b: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
        moisture: { b: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
        organic_matter: { b: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
        nitrogen: { b: '#10b981', bg: 'rgba(16,185,129,0.1)' },
        phosphorus: { b: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        potassium: { b: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
    };

    // Trend Chart — includes NPK lines too
    const trendChartData = useMemo(() => ({
        labels: trendData.map(d => d.date),
        datasets: [
            visibleMetrics.ph && { label: 'pH', data: trendData.map(d => d.ph), borderColor: C.ph.b, backgroundColor: C.ph.bg, fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2 },
            visibleMetrics.moisture && { label: 'Moisture (%)', data: trendData.map(d => d.moisture), borderColor: C.moisture.b, backgroundColor: C.moisture.bg, fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2 },
            visibleMetrics.organic_matter && { label: 'Organic Matter (%)', data: trendData.map(d => d.organic_matter), borderColor: C.organic_matter.b, backgroundColor: C.organic_matter.bg, fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2 },
            visibleMetrics.nitrogen && { label: 'Nitrogen (ppm)', data: trendData.map(d => d.nitrogen), borderColor: C.nitrogen.b, backgroundColor: C.nitrogen.bg, fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2 },
            visibleMetrics.phosphorus && { label: 'Phosphorus (ppm)', data: trendData.map(d => d.phosphorus), borderColor: C.phosphorus.b, backgroundColor: C.phosphorus.bg, fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2 },
            visibleMetrics.potassium && { label: 'Potassium (÷10)', data: trendData.map(d => d.potassium), borderColor: C.potassium.b, backgroundColor: C.potassium.bg, fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2 },
        ].filter(Boolean),
    }), [trendData, visibleMetrics]);

    const chartOpts = {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', cornerRadius: 8 } },
        scales: { y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 10 } } }, x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 9 }, maxRotation: 0 } } },
    };

    // NPK Chart Data — ★ reactive to currentSamples
    const npkChartData = useMemo(() => ({
        labels: currentSamples.map(s => s.id),
        datasets: [
            { label: 'N (ppm)', data: currentSamples.map(s => s.nitrogen), backgroundColor: '#22c55e', borderRadius: 4, barThickness: 16 },
            { label: 'P (ppm)', data: currentSamples.map(s => s.phosphorus), backgroundColor: '#f59e0b', borderRadius: 4, barThickness: 16 },
            { label: 'K (ppm ÷10)', data: currentSamples.map(s => s.potassium / 10), backgroundColor: '#8b5cf6', borderRadius: 4, barThickness: 16 },
        ],
    }), [currentSamples]);

    // NPK Ratios — ★ reactive to currentSamples
    const npkRatios = useMemo(() => currentSamples.map(s => {
        const mn = Math.min(s.nitrogen || 1, s.phosphorus || 1, (s.potassium || 10) / 10);
        const norm = mn > 0 ? mn : 1;
        return { id: s.id, ratio: `${((s.nitrogen || 0) / norm).toFixed(1)} : ${((s.phosphorus || 0) / norm).toFixed(1)} : ${((s.potassium || 10) / 10 / norm).toFixed(1)}`, limiting: (s.nitrogen || 0) < 15 ? 'N' : (s.phosphorus || 0) < 8 ? 'P' : (s.potassium || 0) < 80 ? 'K' : null };
    }), [currentSamples]);

    // ─── SOIL PERFORMANCE INDEX (Pentagonal Radar) — ★ reactive ──────────
    const spiAxes = useMemo(() => {
        const norm = (val, lo, hi) => Math.max(0, Math.min(100, ((val - lo) / (hi - lo)) * 100));
        const d = soilData;
        const avgN = currentSamples.reduce((s, x) => s + (x.nitrogen || 0), 0) / currentSamples.length;
        const avgP = currentSamples.reduce((s, x) => s + (x.phosphorus || 0), 0) / currentSamples.length;
        const avgK = currentSamples.reduce((s, x) => s + (x.potassium || 0), 0) / currentSamples.length;
        return {
            labels: ['Nutrient Balance', 'Moisture\nAdequacy', 'pH\nSuitability', 'Organic Matter\nHealth', 'Texture\nSuitability'],
            scores: [
                Math.round((norm(avgN, 0, 40) + norm(avgP, 0, 30) + norm(avgK, 0, 250)) / 3),
                Math.round(d.moisture >= 20 && d.moisture <= 40 ? 85 : norm(d.moisture, 0, 60)),
                Math.round(d.ph >= 6 && d.ph <= 7 ? 92 : Math.max(0, 100 - Math.abs(d.ph - 6.5) * 25)),
                Math.round(norm(d.organic_matter, 0, 8)),
                Math.round(d.sand >= 30 && d.sand <= 55 && d.clay >= 10 && d.clay <= 35 ? 85 : 50),
            ],
        };
    }, [soilData, currentSamples]);

    const spiScore = useMemo(() => Math.round(spiAxes.scores.reduce((s, v) => s + v, 0) / 5), [spiAxes]);

    const radarData = useMemo(() => ({
        labels: spiAxes.labels,
        datasets: [{
            label: 'Soil Performance Index',
            data: spiAxes.scores,
            backgroundColor: 'rgba(34,197,94,0.15)',
            borderColor: '#22c55e',
            borderWidth: 2,
            pointBackgroundColor: '#22c55e',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
        }],
    }), [spiAxes]);

    const radarOpts = {
        responsive: true, maintainAspectRatio: false,
        scales: {
            r: {
                min: 0, max: 100,
                ticks: { stepSize: 20, color: '#94a3b8', font: { size: 9 }, backdropColor: 'transparent' },
                grid: { color: '#e2e8f0' },
                pointLabels: { color: '#475569', font: { size: 10, weight: '600' } },
                angleLines: { color: '#e2e8f0' },
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: '#1e293b', cornerRadius: 8, callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw}/100` } },
        },
    };

    // Yield estimates
    const yieldEst = useMemo(() => ({
        value: Math.round(12000 + spiScore * 45 + Math.random() * 500),
        confidence: Math.min(95, Math.round(spiScore * 0.9 + Math.random() * 5)),
        limiting: spiAxes.scores.map((s, i) => ({ axis: spiAxes.labels[i], score: s })).sort((a, b) => a.score - b.score).slice(0, 3),
    }), [spiScore, spiAxes]);

    const spiCategory = spiScore >= 80 ? { label: 'Excellent', color: 'bg-emerald-100 text-emerald-700' }
        : spiScore >= 60 ? { label: 'Good', color: 'bg-green-100 text-green-700' }
            : spiScore >= 40 ? { label: 'Fair', color: 'bg-yellow-100 text-yellow-700' }
                : { label: 'Poor', color: 'bg-red-100 text-red-700' };

    // Data quality
    const dataQuality = useMemo(() => {
        const total = DEMO_TREND.length, missing = Math.floor(Math.random() * 3);
        const pct = Math.round(((total - missing) / total) * 100);
        return { label: pct >= 95 ? 'Good' : pct >= 80 ? 'Fair' : 'Poor', color: pct >= 95 ? 'text-emerald-700 bg-emerald-100' : 'text-yellow-700 bg-yellow-100', pct, missing };
    }, []);

    const sourceLabel = dataSource === 'csv' ? 'Imported CSV' : dataSource === 'manual' ? 'Manual' : isLiveMode ? 'Live' : 'Demo Data';

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)} />

            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <Header onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 px-4 sm:px-6 py-5 overflow-auto">
                    {/* ─── TOP BAR ─── */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Soil Quality Analytics</h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Last sync: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                <span className="mx-1.5 text-slate-300">·</span>
                                Source: <strong className="text-slate-700">{sourceLabel}</strong>
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <button onClick={() => { setIsLiveMode(!isLiveMode); if (!isLiveMode) setDataSource('live'); else setDataSource('demo'); }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors ${isLiveMode ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                {isLiveMode ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />} {isLiveMode ? 'Live' : 'Demo'}
                            </button>
                            <button onClick={() => setManualOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100">
                                <Plus className="w-3 h-3" /> Manual Input
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50">
                                <Download className="w-3 h-3" /> Export
                            </button>
                        </div>
                    </div>

                    {/* Firestore status */}
                    <div className={`mb-4 p-2.5 border rounded-lg flex items-center gap-2 text-xs ${!firestoreSensor.loading && !firestoreSensor.error ? 'bg-emerald-50 border-emerald-200' : firestoreSensor.loading ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                        <div className={`w-2 h-2 rounded-full ${!firestoreSensor.loading && !firestoreSensor.error ? 'bg-emerald-500 animate-pulse' : firestoreSensor.loading ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className={`font-medium ${!firestoreSensor.loading && !firestoreSensor.error ? 'text-emerald-700' : firestoreSensor.loading ? 'text-yellow-700' : 'text-red-700'}`}>
                            {!firestoreSensor.loading && !firestoreSensor.error ? '🔥 Firestore Connected' : firestoreSensor.loading ? '⏳ Connecting…' : `❌ Fallback – ${firestoreSensor.error?.message || 'Connection failed'}`}
                        </span>
                    </div>

                    {/* Live mode banner */}
                    {isLiveMode && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                            <Loader2 className="w-5 h-5 text-amber-600 animate-spin flex-shrink-0" />
                            <div><p className="text-xs font-bold text-amber-800">Waiting for sensor stream…</p><p className="text-[10px] text-amber-600">Showing last known values below.</p></div>
                        </div>
                    )}

                    {/* ============================================================= */}
                    {/* SECTION A — SNAPSHOT CARDS                                     */}
                    {/* ============================================================= */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                        {/* A1: Soil Texture Analysis */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-800">Soil Texture Analysis</h3>
                                <div className="flex items-center gap-1.5">
                                    {[{ l: `Sand: ${soilData.sand}%`, c: 'bg-yellow-100 text-yellow-700' }, { l: `Silt: ${soilData.silt}%`, c: 'bg-green-100 text-green-700' }, { l: `Clay: ${soilData.clay}%`, c: 'bg-orange-100 text-orange-700' }].map(x => (
                                        <span key={x.l} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${x.c}`}>{x.l}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SoilTextureTriangle sand={soilData.sand} silt={soilData.silt} clay={soilData.clay} onSampleClick={() => setManualOpen(true)} />
                                <div className="space-y-2.5">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Composition</h4>
                                    {[{ l: 'Sand', v: soilData.sand, c: 'bg-yellow-400' }, { l: 'Silt', v: soilData.silt, c: 'bg-green-400' }, { l: 'Clay', v: soilData.clay, c: 'bg-orange-400' }].map(x => (
                                        <div key={x.l}>
                                            <div className="flex justify-between text-[11px] mb-0.5"><span className="font-medium text-slate-600">{x.l}</span><span className="font-bold text-slate-800">{x.v}%</span></div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${x.c}`} style={{ width: `${x.v}%` }} /></div>
                                        </div>
                                    ))}
                                    <div className="pt-2 mt-2 border-t border-slate-100 space-y-1.5">
                                        <div className="flex justify-between text-[11px]"><span className="text-slate-500">Texture Class</span><span className="font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px]">{textureClass}</span></div>
                                        <div className="flex justify-between text-[11px]"><span className="text-slate-500">pH Range</span><span className="font-semibold text-slate-700">6.0 – 7.0</span></div>
                                        <div className="flex justify-between text-[11px]"><span className="text-slate-500">Current pH</span><div className="flex items-center gap-1"><span className="font-bold text-slate-800">{soilData.ph}</span><span className={`w-2 h-2 rounded-full ${soilData.ph >= 6 && soilData.ph <= 7 ? 'bg-emerald-400' : 'bg-amber-400'}`} /></div></div>
                                        <div className="flex justify-between text-[11px]"><span className="text-slate-500">Suitability</span><span className="font-bold text-slate-800">{Math.round(soilData.sand >= 30 && soilData.sand <= 55 ? 85 : 60)}/100</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* A2: Nutrient Heatmap */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-2.5 border-b border-slate-100"><h3 className="text-sm font-bold text-slate-800">Soil Parameters Matrix</h3></div>
                            <div className="p-4"><NutrientHeatmap samples={currentSamples} /></div>
                        </div>
                    </div>

                    {/* ============================================================= */}
                    {/* SECTION B — TRENDS                                            */}
                    {/* ============================================================= */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
                        <div className="px-4 py-2.5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <h3 className="text-sm font-bold text-slate-800">Multi-Metric Trend</h3>
                            <div className="flex items-center gap-1.5">
                                {['24h', '7d', '30d'].map(r => (
                                    <button key={r} onClick={() => setTimeRange(r)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${timeRange === r ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{r}</button>
                                ))}
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                {[
                                    { k: 'ph', l: 'pH', c: C.ph.b },
                                    { k: 'moisture', l: 'Moisture', c: C.moisture.b },
                                    { k: 'organic_matter', l: 'Organic Matter', c: C.organic_matter.b },
                                    { k: 'nitrogen', l: 'N (ppm)', c: C.nitrogen.b },
                                    { k: 'phosphorus', l: 'P (ppm)', c: C.phosphorus.b },
                                    { k: 'potassium', l: 'K (÷10)', c: C.potassium.b },
                                ].map(m => (
                                    <button key={m.k} onClick={() => setVisibleMetrics(prev => ({ ...prev, [m.k]: !prev[m.k] }))}
                                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${visibleMetrics[m.k] ? 'border-current opacity-100' : 'border-slate-200 opacity-40'}`} style={{ color: m.c }}>
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.c }} />
                                        {m.l}
                                    </button>
                                ))}
                            </div>
                            <div className="h-64"><Line data={trendChartData} options={chartOpts} /></div>
                        </div>
                        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3 text-[10px]">
                            <Activity className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-500">Quality:</span>
                            <span className={`font-bold px-1.5 py-0.5 rounded-full ${dataQuality.color}`}>{dataQuality.label}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-500">Confidence: <strong className="text-slate-700">{dataQuality.pct}%</strong></span>
                        </div>
                    </div>

                    {/* ============================================================= */}
                    {/* SECTION C — NPK SENSOR ANALYTICS                              */}
                    {/* ============================================================= */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
                        {/* C1: NPK Bar Chart */}
                        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-2.5 border-b border-slate-100">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> NPK Sensor Analytics</h3>
                            </div>
                            <div className="p-4">
                                <div className="h-52"><Bar data={npkChartData} options={{ ...chartOpts, plugins: { ...chartOpts.plugins, legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 }, color: '#64748b' } } } }} /></div>
                                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg text-[10px] text-blue-700 flex items-center gap-1">
                                    <Info className="w-3 h-3 flex-shrink-0" /> Target: N 18–30 ppm · P 10–25 ppm · K 100–200 ppm (÷10 for scale)
                                </div>
                            </div>
                        </div>

                        {/* C2: NPK Ratio + Limiting */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-2.5 border-b border-slate-100"><h3 className="text-sm font-bold text-slate-800">N:P:K Ratio</h3></div>
                            <div className="p-4 space-y-3">
                                {npkRatios.map(r => (
                                    <div key={r.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                                        <p className="text-[10px] font-bold text-slate-500">{r.id}</p>
                                        <p className="text-sm font-bold text-slate-800 mt-0.5">{r.ratio}</p>
                                        {r.limiting && (
                                            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-700 font-semibold">
                                                <AlertTriangle className="w-3 h-3" /> Limiting: {r.limiting === 'N' ? 'Nitrogen' : r.limiting === 'P' ? 'Phosphorus' : 'Potassium'}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                                    <p className="text-[9px] font-bold text-emerald-600 uppercase">Sensor Status</p>
                                    <p className="text-[10px] text-emerald-700 mt-0.5">Calibrated · Confidence: 0.86</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ============================================================= */}
                    {/* SECTION D — YIELD & SOIL PERFORMANCE (PENTAGONAL RADAR)       */}
                    {/* ============================================================= */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                        {/* D1: Pentagonal Radar — Soil Performance Index */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-800">Soil Performance Index (SPI)</h3>
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${spiCategory.color}`}>{spiCategory.label} · {spiScore}/100</span>
                            </div>
                            <div className="p-4">
                                <div className="h-72"><Radar data={radarData} options={radarOpts} /></div>
                                <div className="mt-3 grid grid-cols-5 gap-1">
                                    {spiAxes.labels.map((l, i) => (
                                        <div key={i} className="text-center">
                                            <p className="text-[9px] text-slate-500 leading-tight">{l.replace('\n', ' ')}</p>
                                            <p className="text-xs font-bold text-slate-800">{spiAxes.scores[i]}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* D2: Yield Overview */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-2.5 border-b border-slate-100">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Package className="w-4 h-4 text-emerald-600" /> Yield Analytics</h3>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                                        <p className="text-[10px] font-bold text-emerald-500 uppercase">Est. Yield</p>
                                        <p className="text-2xl font-black text-emerald-800 mt-1">{yieldEst.value.toLocaleString()}</p>
                                        <p className="text-xs text-emerald-600">kg/ha</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                                        <p className="text-[10px] font-bold text-blue-500 uppercase">Confidence</p>
                                        <p className="text-2xl font-black text-blue-800 mt-1">{yieldEst.confidence}%</p>
                                        <p className="text-xs text-blue-600">prediction accuracy</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Yield Limiting Factors (Top 3)</p>
                                    {yieldEst.limiting.map((f, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 mb-1 bg-slate-50 rounded-lg border border-slate-200">
                                            <span className="text-[10px] font-semibold text-slate-700">{f.axis.replace('\n', ' ')}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${f.score >= 70 ? 'bg-emerald-500' : f.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${f.score}%` }} />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-600 w-8 text-right">{f.score}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="text-[10px] font-bold text-slate-500">Yield Formula</p>
                                    <p className="text-[9px] text-slate-400 mt-0.5 font-mono">Y = 23902.86 + (-198.40 × N) + (-1831.07 × OM) + (-241.60 × C)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ============================================================= */}
                    {/* SECTION E — PREDICTION                                        */}
                    {/* ============================================================= */}
                    <div className="mb-5">
                        <div className="flex items-center gap-2 mb-3">
                            <h2 className="text-sm font-bold text-slate-800">Prediction & Decision Support</h2>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">AI-Powered</span>
                        </div>
                        <PredictionEngine />
                    </div>

                    {/* ============================================================= */}
                    {/* SECTION F — CSV IMPORT + REPORTS                               */}
                    {/* ============================================================= */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* CSV Import */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <UploadCloud className="w-4 h-4 text-emerald-600" /> Import Dataset (CSV)
                            </h3>
                            <FileUploader onFileUpload={handleCsvUpload} isLoading={uploading} />
                        </div>

                        {/* Reports & Export */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-400" /> Reports & Sharing
                            </h3>
                            <p className="text-xs text-slate-500 mb-3">Export your analytics data for reporting</p>
                            <div className="flex items-center gap-2 mb-3">
                                <button className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"><Download className="w-3.5 h-3.5" /> CSV</button>
                                <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"><FileText className="w-3.5 h-3.5" /> PDF</button>
                                <button disabled className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold cursor-not-allowed"><Share2 className="w-3.5 h-3.5" /> Share</button>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3 text-[10px] text-slate-500">
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                <span>Charts: <strong className="text-slate-700">Texture, Heatmap, NPK, SPI, Trends</strong></span>
                                <span className="text-slate-300">·</span>
                                <span>Range: <strong className="text-slate-700">{timeRange}</strong></span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Manual Input Modal */}
            <ManualInputModal isOpen={manualOpen} onClose={() => setManualOpen(false)} onSave={handleManualSave} />
        </div>
    );
};

export default DataPage;
