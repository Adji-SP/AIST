import React, { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';

// ─── Parameter definitions with agronomic thresholds ─────────────────────────
const ALL_PARAMS = [
    { key: 'nitrogen', label: 'Nitrogen (N)', unit: 'ppm', lo: 18, hi: 30, group: 'npk' },
    { key: 'phosphorus', label: 'Phosphorus (P)', unit: 'ppm', lo: 10, hi: 25, group: 'npk' },
    { key: 'potassium', label: 'Potassium (K)', unit: 'ppm', lo: 100, hi: 200, group: 'npk' },
    { key: 'ph', label: 'pH', unit: '', lo: 6.0, hi: 7.0, group: 'other' },
    { key: 'organic_matter', label: 'Organic Matter', unit: '%', lo: 3.0, hi: 6.0, group: 'other' },
    { key: 'moisture', label: 'Moisture', unit: '%', lo: 20, hi: 40, group: 'other' },
];

const getLevel = (v, p) => {
    if (v == null || isNaN(v)) return 'none';
    if (v < p.lo) return 'low';
    if (v > p.hi) return 'high';
    return 'optimal';
};

const LEVEL_STYLE = {
    low: { bar: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Low' },
    optimal: { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Optimal' },
    high: { bar: 'bg-red-400', badge: 'bg-red-50 text-red-700 border-red-200', label: 'High' },
    none: { bar: 'bg-slate-200', badge: 'bg-slate-50 text-slate-400 border-slate-200', label: '—' },
};

const INTERP = {
    nitrogen: { low: 'Consider nitrogen supplementation', high: 'Excessive — risk of leaf burn', optimal: 'Nitrogen is balanced' },
    phosphorus: { low: 'Add phosphorus fertilizer', high: 'Excess may inhibit micronutrients', optimal: 'Phosphorus OK' },
    potassium: { low: 'Apply potassium sulfate', high: 'May antagonize Mg/Ca uptake', optimal: 'Potassium in range' },
    ph: { low: 'Too acidic — consider liming', high: 'Too alkaline — add sulfur', optimal: 'pH ideal for crops' },
    organic_matter: { low: 'Add compost/mulch', high: 'High — good structure', optimal: 'Healthy OM level' },
    moisture: { low: 'Irrigation recommended', high: 'Waterlogging risk', optimal: 'Moisture adequate' },
};

const NutrientHeatmap = ({ samples = [], onSortChange }) => {
    const [tooltip, setTooltip] = useState(null);
    const [filterMode, setFilterMode] = useState('all'); // 'all' | 'npk'
    const [sortBy, setSortBy] = useState(null);

    const params = useMemo(() =>
        filterMode === 'npk' ? ALL_PARAMS.filter(p => p.group === 'npk') : ALL_PARAMS,
        [filterMode]
    );

    // Sort samples if requested
    const sortedSamples = useMemo(() => {
        if (!sortBy || samples.length === 0) return samples;
        return [...samples].sort((a, b) => (a[sortBy] ?? 999) - (b[sortBy] ?? 999));
    }, [samples, sortBy]);

    const data = sortedSamples.length > 0 ? sortedSamples : [
        { id: 'Sample 01', nitrogen: 30, phosphorus: 15, potassium: 125, ph: 6.3, organic_matter: 4.5, moisture: 21.5 },
        { id: 'Sample 02', nitrogen: 19, phosphorus: 12, potassium: 125, ph: 3.1, organic_matter: 2.1, moisture: 4.5 },
        { id: 'Sample 03', nitrogen: 6.2, phosphorus: 6.5, potassium: 60, ph: 7.3, organic_matter: 5.8, moisture: 22.0 },
    ];

    // Compute bar width (0–100% relative to param range)
    const barPct = (val, p) => {
        if (val == null) return 0;
        const range = p.hi * 1.5; // extend scale beyond optimal
        return Math.min(100, Math.max(3, (val / range) * 100));
    };

    return (
        <div className="w-full">
            {/* Controls row */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                {/* Filter toggle */}
                <div className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    {['all', 'npk'].map(mode => (
                        <button
                            key={mode}
                            onClick={() => setFilterMode(mode)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${filterMode === mode ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                        >
                            {mode === 'all' ? 'All Parameters' : 'NPK Only'}
                        </button>
                    ))}
                </div>

                {/* Sort dropdown */}
                <select
                    value={sortBy || ''}
                    onChange={e => setSortBy(e.target.value || null)}
                    className="text-[10px] border border-slate-200 rounded-lg px-2 py-1 text-slate-600 bg-white focus:ring-1 focus:ring-emerald-300"
                >
                    <option value="">Sort by…</option>
                    <option value="nitrogen">Lowest N</option>
                    <option value="phosphorus">Lowest P</option>
                    <option value="potassium">Lowest K</option>
                    <option value="ph">Most Acidic</option>
                    <option value="organic_matter">Lowest OM</option>
                </select>
            </div>

            {/* Threshold legend */}
            <div className="flex items-center gap-4 mb-3 text-[10px] text-slate-500">
                <span className="font-semibold uppercase tracking-wider">Thresholds:</span>
                <span className="flex items-center gap-1"><span className="w-6 h-1.5 rounded bg-amber-400" /> Low (below range)</span>
                <span className="flex items-center gap-1"><span className="w-6 h-1.5 rounded bg-emerald-500" /> Optimal</span>
                <span className="flex items-center gap-1"><span className="w-6 h-1.5 rounded bg-red-400" /> High (above range)</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-sm min-w-[480px]">
                    <thead>
                        <tr className="bg-slate-50/80">
                            <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 sticky left-0 bg-slate-50/80 z-10 min-w-[140px]">
                                Parameter
                            </th>
                            <th className="text-center px-2 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 w-20">
                                Range
                            </th>
                            {data.map(s => (
                                <th key={s.id} className="text-center px-3 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200 min-w-[110px]">
                                    {s.id}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {params.map((param, ri) => (
                            <tr key={param.key} className={`${ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} hover:bg-blue-50/30 transition-colors`}>
                                {/* Sticky param name */}
                                <td className="px-4 py-2.5 text-xs font-semibold text-slate-700 border-b border-slate-100 sticky left-0 bg-inherit z-10">
                                    <div className="flex items-center gap-1.5">
                                        {param.label}
                                        {param.unit && <span className="text-[9px] text-slate-400 font-normal">({param.unit})</span>}
                                    </div>
                                </td>
                                {/* Threshold range */}
                                <td className="px-2 py-2.5 text-center border-b border-slate-100">
                                    <span className="text-[9px] text-slate-400">{param.lo}–{param.hi}</span>
                                </td>
                                {/* Value cells */}
                                {data.map((sample, ci) => {
                                    const val = sample[param.key];
                                    const level = getLevel(val, param);
                                    const ls = LEVEL_STYLE[level];
                                    const interp = INTERP[param.key]?.[level] || '';
                                    const isHovered = tooltip?.row === ri && tooltip?.col === ci;

                                    return (
                                        <td
                                            key={`${param.key}-${ci}`}
                                            className="px-3 py-2.5 border-b border-slate-100 relative"
                                            onMouseEnter={() => setTooltip({ row: ri, col: ci })}
                                            onMouseLeave={() => setTooltip(null)}
                                        >
                                            {/* Mini-bar behind value */}
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center w-full">
                                                    <div className={`h-5 rounded ${ls.bar} opacity-15`} style={{ width: `${barPct(val, param)}%` }} />
                                                </div>
                                                <div className="relative flex items-center justify-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold ${ls.badge} border`}>
                                                        {val != null ? (typeof val === 'number' ? val.toFixed(1) : val) : '—'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Tooltip */}
                                            {isHovered && val != null && (
                                                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-800 text-white rounded-xl shadow-xl p-3 pointer-events-none">
                                                    <p className="text-[11px] font-bold">{param.label}</p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-[10px] text-slate-300">Value: <strong className="text-white">{val}{param.unit ? ` ${param.unit}` : ''}</strong></span>
                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${ls.badge}`}>{ls.label}</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 mt-1">Optimal: {param.lo}–{param.hi} {param.unit}</p>
                                                    {interp && <p className="text-[10px] text-emerald-300 mt-1.5 italic">{interp}</p>}
                                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-slate-800" />
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NutrientHeatmap;
