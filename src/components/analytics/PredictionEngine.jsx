import React, { useState } from 'react';
import {
    FlaskConical, Zap, Droplets, Leaf, ThermometerSun,
    CloudRain, Wind, Play, RotateCcw, Sparkles, AlertTriangle,
    ChevronRight, Info, Loader2, TrendingUp
} from 'lucide-react';

const DEMO = {
    moisture: 28.5, organic_matter: 4.2, sand: 45, silt: 35, clay: 20,
    nitrogen: 24.0, potassium: 185, ph: 6.5, humidity: 72, rainfall: 12.5, temperature: 28,
};

const FIELDS = [
    { key: 'moisture', label: 'Moisture', unit: '%', icon: Droplets, range: '20–40%', tip: 'Soil water content.' },
    { key: 'organic_matter', label: 'Organic Matter', unit: '%', icon: Leaf, range: '3–6%', tip: 'Decomposed plant material.' },
    { key: 'sand', label: 'Sand', unit: '%', icon: FlaskConical, range: '30–50%', tip: 'Large particles.' },
    { key: 'silt', label: 'Silt', unit: '%', icon: FlaskConical, range: '25–45%', tip: 'Medium particles.' },
    { key: 'clay', label: 'Clay', unit: '%', icon: FlaskConical, range: '15–30%', tip: 'Fine particles.' },
    { key: 'nitrogen', label: 'Nitrogen (N)', unit: 'ppm', icon: Zap, range: '18–30', tip: 'Essential for growth.' },
    { key: 'potassium', label: 'Potassium (K)', unit: 'ppm', icon: Zap, range: '100–200', tip: 'Fruit quality.' },
    { key: 'ph', label: 'pH', unit: '', icon: FlaskConical, range: '6.0–7.0', tip: 'Soil acidity.' },
];

const OPT_FIELDS = [
    { key: 'humidity', label: 'Humidity', unit: '%', icon: Wind },
    { key: 'rainfall', label: 'Rainfall', unit: 'mm', icon: CloudRain },
    { key: 'temperature', label: 'Temp', unit: '°C', icon: ThermometerSun },
];

const computeScore = (v) => {
    let s = 50;
    const phD = v.ph >= 6 && v.ph <= 7 ? 0 : Math.min(Math.abs(v.ph - 6.5), 3);
    s += (3 - phD) * 5;
    const omD = v.organic_matter >= 3 && v.organic_matter <= 6 ? 0 : Math.min(Math.abs(v.organic_matter - 4.5), 4);
    s += (4 - omD) * 3;
    s += (v.moisture >= 20 && v.moisture <= 40) ? 8 : -Math.min(Math.abs(v.moisture - 30), 10);
    s += (v.nitrogen >= 18 && v.nitrogen <= 30) ? 8 : -Math.min(Math.abs(v.nitrogen - 24), 8);
    s += (v.potassium >= 100 && v.potassium <= 200) ? 7 : -Math.min(Math.abs(v.potassium - 150) / 20, 7);
    return Math.max(0, Math.min(100, Math.round(s)));
};

const getCategory = (s) => {
    if (s >= 85) return { label: 'Excellent', color: 'bg-emerald-100 text-emerald-800', ring: 'ring-emerald-400' };
    if (s >= 70) return { label: 'Very Good', color: 'bg-green-100 text-green-800', ring: 'ring-green-400' };
    if (s >= 50) return { label: 'Good', color: 'bg-yellow-100 text-yellow-800', ring: 'ring-yellow-400' };
    if (s >= 30) return { label: 'Fair', color: 'bg-orange-100 text-orange-800', ring: 'ring-orange-400' };
    return { label: 'Poor', color: 'bg-red-100 text-red-800', ring: 'ring-red-400' };
};

const getLimiting = (v) => {
    const f = [];
    if (v.ph < 6) f.push({ p: 'pH', issue: 'Too acidic', s: 'high', fix: 'Apply lime' });
    if (v.ph > 7) f.push({ p: 'pH', issue: 'Too alkaline', s: 'medium', fix: 'Apply sulfur' });
    if (v.nitrogen < 18) f.push({ p: 'Nitrogen', issue: 'Low', s: 'high', fix: 'Add N fertilizer/compost' });
    if (v.organic_matter < 3) f.push({ p: 'Organic Matter', issue: 'Low', s: 'high', fix: 'Add compost/mulch' });
    if (v.moisture < 20) f.push({ p: 'Moisture', issue: 'Dry', s: 'medium', fix: 'Increase irrigation' });
    if (v.moisture > 40) f.push({ p: 'Moisture', issue: 'Excess', s: 'medium', fix: 'Improve drainage' });
    if (v.potassium < 100) f.push({ p: 'Potassium', issue: 'Low', s: 'medium', fix: 'Apply K₂SO₄' });
    return f;
};

const getImportance = (v) => {
    const items = [
        { name: 'pH', w: Math.abs(v.ph - 6.5) * 15 },
        { name: 'Organic Matter', w: Math.abs(v.organic_matter - 4.5) * 10 },
        { name: 'Moisture', w: Math.abs(v.moisture - 30) * 5 },
        { name: 'Nitrogen', w: Math.abs(v.nitrogen - 24) * 8 },
        { name: 'Potassium', w: Math.abs(v.potassium - 150) / 5 },
    ];
    const mx = Math.max(...items.map(i => i.w), 1);
    return items.map(i => ({ ...i, pct: Math.round((i.w / mx) * 100) })).sort((a, b) => b.pct - a.pct);
};

const PredictionEngine = () => {
    const [inputs, setInputs] = useState({});
    const [result, setResult] = useState(null);
    const [running, setRunning] = useState(false);
    const [tipKey, setTipKey] = useState(null);

    const upd = (k, val) => setInputs(p => ({ ...p, [k]: parseFloat(val) || 0 }));
    const vals = { ...DEMO, ...inputs };

    const run = () => {
        setRunning(true);
        setTimeout(() => {
            const score = computeScore(vals);
            setResult({ score, cat: getCategory(score), lim: getLimiting(vals), imp: getImportance(vals) });
            setRunning(false);
        }, 1000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Form */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100 rounded-t-xl">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-emerald-600" /> Soil Quality Prediction
                    </h3>
                </div>
                <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2.5">
                        {FIELDS.map(f => (
                            <div key={f.key} className="relative">
                                <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 mb-0.5">
                                    <f.icon className="w-3 h-3 text-slate-400" /> {f.label}
                                    {f.unit && <span className="text-slate-400 font-normal">({f.unit})</span>}
                                    <Info className="w-2.5 h-2.5 text-slate-300 ml-auto cursor-help"
                                        onMouseEnter={() => setTipKey(f.key)} onMouseLeave={() => setTipKey(null)} />
                                </label>
                                <input type="number" step="0.1" value={inputs[f.key] ?? ''} onChange={e => upd(f.key, e.target.value)}
                                    placeholder={String(DEMO[f.key])}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-300 placeholder:text-slate-300" />
                                <span className="text-[8px] text-slate-400">{f.range}</span>
                                {tipKey === f.key && (
                                    <div className="absolute z-50 bottom-full left-0 mb-1 w-44 bg-slate-800 text-white rounded-lg p-2 text-[9px] shadow-lg pointer-events-none">
                                        {f.tip}<div className="absolute bottom-0 left-3 translate-y-1/2 rotate-45 w-1.5 h-1.5 bg-slate-800" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {/* Optional */}
                    <div className="grid grid-cols-3 gap-2">
                        {OPT_FIELDS.map(f => (
                            <div key={f.key}>
                                <label className="text-[10px] font-semibold text-slate-500 flex items-center gap-1"><f.icon className="w-3 h-3" />{f.label}</label>
                                <input type="number" step="0.1" value={inputs[f.key] ?? ''} onChange={e => upd(f.key, e.target.value)}
                                    placeholder={String(DEMO[f.key])}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-300 placeholder:text-slate-300" />
                            </div>
                        ))}
                    </div>
                    {/* Buttons */}
                    <div className="flex gap-2 pt-1">
                        <button onClick={run} disabled={running}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-60">
                            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                            {running ? 'Analyzing…' : 'Run Prediction'}
                        </button>
                        <button onClick={() => setInputs(DEMO)} className="px-2.5 py-2 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-500 hover:bg-slate-50">
                            <Sparkles className="w-3 h-3 inline mr-0.5" />Demo
                        </button>
                        <button onClick={() => { setInputs({}); setResult(null); }} className="px-2.5 py-2 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-500 hover:bg-slate-50">
                            <RotateCcw className="w-3 h-3 inline mr-0.5" />Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 rounded-t-xl">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" /> Results & Recommendations
                    </h3>
                </div>
                <div className="p-4">
                    {!result && !running ? (
                        <div className="flex flex-col items-center py-12 text-center">
                            <FlaskConical className="w-10 h-10 text-slate-200 mb-3" />
                            <p className="text-xs font-semibold text-slate-400">Run prediction to see results</p>
                        </div>
                    ) : running ? (
                        <div className="flex flex-col items-center py-12"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" /><p className="text-xs text-slate-500">Computing…</p></div>
                    ) : result && (
                        <div className="space-y-4">
                            {/* Score */}
                            <div className="text-center">
                                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ring-4 ${result.cat.ring} bg-white shadow-sm`}>
                                    <span className="text-2xl font-black text-slate-800">{result.score}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">out of 100</p>
                                <span className={`inline-block mt-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${result.cat.color}`}>{result.cat.label}</span>
                            </div>
                            {/* Limiting */}
                            {result.lim.length > 0 && (
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Limiting Factors</p>
                                    {result.lim.map((f, i) => (
                                        <div key={i} className={`flex items-center gap-2 p-2 rounded-lg text-[10px] mb-1 ${f.s === 'high' ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
                                            <AlertTriangle className={`w-3 h-3 ${f.s === 'high' ? 'text-red-500' : 'text-amber-500'}`} />
                                            <strong>{f.p}:</strong> {f.issue}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* Recommendations */}
                            {result.lim.length > 0 && (
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Recommendations</p>
                                    {result.lim.map((f, i) => (
                                        <div key={i} className="flex items-start gap-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg mb-1">
                                            <ChevronRight className="w-3 h-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-[10px] text-emerald-800 font-semibold">{f.fix}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* Feature Importance */}
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Feature Impact</p>
                                {result.imp.slice(0, 4).map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] text-slate-600 w-20 truncate">{f.name}</span>
                                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full" style={{ width: `${f.pct}%` }} />
                                        </div>
                                        <span className="text-[9px] text-slate-400 w-7 text-right">{f.pct}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PredictionEngine;
