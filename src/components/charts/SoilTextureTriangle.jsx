import React, { useState } from 'react';

// ─── Triangle geometry (equilateral in SVG viewport) ─────────────────────────
const V = { bL: [50, 346], bR: [350, 346], top: [200, 20] }; // Sand, Clay, Silt

// Sand/Silt/Clay → XY on ternary plot (barycentric coordinates)
const toXY = (sand, silt, clay) => {
    const s = sand / 100, si = silt / 100, c = clay / 100;
    const x = V.bL[0] * s + V.bR[0] * c + V.top[0] * si;
    const y = V.bL[1] * s + V.bR[1] * c + V.top[1] * si;
    return [x, y];
};

// ─── USDA texture class from percentages ────────────────────────────────────
const getTextureClass = (sand, silt, clay) => {
    if (clay >= 40) {
        if (silt >= 40) return 'Silty Clay';
        if (sand >= 45) return 'Sandy Clay';
        return 'Clay';
    }
    if (clay >= 27 && clay < 40) {
        if (sand >= 20 && sand < 45) return 'Clay Loam';
        if (sand >= 45) return 'Sandy Clay Loam';
        return 'Silty Clay Loam';
    }
    if (silt >= 50) {
        if (silt >= 80) return 'Silt';
        return 'Silt Loam';
    }
    if (sand >= 85) return 'Sand';
    if (sand >= 70) return 'Loamy Sand';
    if (clay >= 7 && clay < 27 && silt >= 28 && silt < 50 && sand < 52) return 'Loam';
    if (sand >= 43 && sand < 85) return 'Sandy Loam';
    return 'Loam';
};

// ─── Region labels placed at approximate centers ───────────────────────────
const LABELS = [
    { name: 'Clay', sand: 15, silt: 15, clay: 70 },
    { name: 'Silty\nClay', sand: 5, silt: 50, clay: 45 },
    { name: 'Sandy\nClay', sand: 52, silt: 5, clay: 43 },
    { name: 'Clay\nLoam', sand: 33, silt: 33, clay: 34 },
    { name: 'Silty Clay\nLoam', sand: 10, silt: 55, clay: 35 },
    { name: 'Sandy Clay\nLoam', sand: 58, silt: 10, clay: 32 },
    { name: 'Loam', sand: 42, silt: 38, clay: 20 },
    { name: 'Silt\nLoam', sand: 20, silt: 62, clay: 18 },
    { name: 'Sandy\nLoam', sand: 62, silt: 25, clay: 13 },
    { name: 'Loamy\nSand', sand: 80, silt: 12, clay: 8 },
    { name: 'Sand', sand: 92, silt: 4, clay: 4 },
    { name: 'Silt', sand: 8, silt: 87, clay: 5 },
];

// ─── USDA Region boundary lines (as polylines of ternary coords) ──────────
const BOUNDARIES = [
    // Clay line at 40%
    [[0, 60, 40], [40, 20, 40], [45, 15, 40]],
    [[0, 60, 40], [0, 40, 60]],
    [[40, 20, 40], [45, 0, 55]],
    // Clay 27%
    [[0, 73, 27], [20, 53, 27], [45, 28, 27], [72, 1, 27]],
    // Sandy Clay Loam / Sandy Loam
    [[45, 28, 27], [45, 55, 0]],
    [[52, 28, 20], [52, 48, 0]],
    // Silt Loam
    [[20, 53, 27], [20, 60, 20], [0, 80, 20]],
    [[20, 60, 20], [0, 80, 20]],
    // Loam / Silt Loam
    [[23, 50, 27], [50, 50, 0]],
    [[0, 80, 20], [0, 50, 50]],
    // Sand/Loamy Sand
    [[85, 15, 0], [85, 5, 10], [70, 30, 0]],
    [[90, 10, 0], [85, 5, 10]],
    // Silt boundary at 80%
    [[0, 80, 20], [8, 80, 12], [12, 80, 8], [20, 80, 0]],
];

const SoilTextureTriangle = ({ sand = 45, silt = 35, clay = 20, onSampleClick }) => {
    const [hovered, setHovered] = useState(false);
    const [px, py] = toXY(sand, silt, clay);
    const textureClass = getTextureClass(sand, silt, clay);

    // Helper to draw grid lines at specific clay percentages
    const gridLines = [10, 20, 30, 40, 50, 60, 70, 80, 90];

    return (
        <div className="w-full">
            <svg viewBox="0 0 400 380" className="w-full h-auto" style={{ maxHeight: 340 }}>
                <defs>
                    <linearGradient id="triFill" x1="0%" y1="100%" x2="50%" y2="0%">
                        <stop offset="0%" stopColor="#fefce8" />
                        <stop offset="45%" stopColor="#dcfce7" />
                        <stop offset="100%" stopColor="#fef3c7" />
                    </linearGradient>
                    <filter id="ptShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.2" />
                    </filter>
                </defs>

                {/* Main triangle */}
                <polygon
                    points={`${V.bL.join(',')} ${V.top.join(',')} ${V.bR.join(',')}`}
                    fill="url(#triFill)" stroke="#94a3b8" strokeWidth="1.5"
                />

                {/* Grid lines (clay %) — left edge to right edge */}
                {gridLines.map(pct => {
                    const r = pct / 100;
                    // Left edge: Sand varies, Silt = 100 - Sand - Clay
                    const lx = V.bL[0] * (1 - r) + V.top[0] * 0 + V.bR[0] * r;
                    const ly = V.bL[1] * (1 - r) + V.top[1] * 0 + V.bR[1] * r;
                    // interpolate along left edge
                    const [x1, y1] = toXY(100 - pct, 0, pct);
                    const [x2, y2] = toXY(0, 100 - pct, pct);
                    return (
                        <g key={`grid-${pct}`}>
                            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3,3" />
                        </g>
                    );
                })}

                {/* Axis tick labels */}
                {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(pct => {
                    // Bottom axis (Sand→Clay, left to right = increasing Clay)
                    const [bx, by] = toXY(100 - pct, 0, pct);
                    // Left axis (Sand→Silt, bottom-left to top = increasing Silt)
                    const [lx, ly] = toXY(100 - pct, pct, 0);
                    // Right axis (Silt→Clay, top to bottom-right = increasing Clay)
                    const [rx, ry] = toXY(0, 100 - pct, pct);
                    return (
                        <g key={`tick-${pct}`}>
                            <text x={bx} y={by + 14} fontSize="7" fill="#94a3b8" textAnchor="middle">{pct}</text>
                            <text x={lx - 10} y={ly + 3} fontSize="7" fill="#94a3b8" textAnchor="end">{pct}</text>
                        </g>
                    );
                })}

                {/* Region labels */}
                {LABELS.map(l => {
                    const [cx, cy] = toXY(l.sand, l.silt, l.clay);
                    const lines = l.name.split('\n');
                    return (
                        <text key={l.name} x={cx} y={cy} textAnchor="middle" fontSize="7.5" fill="#64748b" fontWeight="500" className="pointer-events-none select-none">
                            {lines.map((line, i) => (
                                <tspan key={i} x={cx} dy={i === 0 ? 0 : 10}>{line}</tspan>
                            ))}
                        </text>
                    );
                })}

                {/* Axis Labels */}
                <text x={V.bL[0] - 8} y={V.bL[1] + 16} fontSize="11" fill="#334155" fontWeight="700" textAnchor="middle">Sand</text>
                <text x={V.bR[0] + 8} y={V.bR[1] + 16} fontSize="11" fill="#334155" fontWeight="700" textAnchor="middle">Clay</text>
                <text x={V.top[0]} y={V.top[1] - 8} fontSize="11" fill="#334155" fontWeight="700" textAnchor="middle">Silt</text>

                {/* Sample point — pulsing ring + solid dot */}
                <circle cx={px} cy={py} r="14" fill="rgba(239,68,68,0.12)" className="animate-pulse" />
                <circle
                    cx={px} cy={py} r="6"
                    fill="#ef4444" stroke="#fff" strokeWidth="2.5"
                    filter="url(#ptShadow)"
                    className="cursor-pointer"
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    onClick={() => onSampleClick && onSampleClick()}
                />

                {/* Tooltip on hover */}
                {hovered && (
                    <g className="pointer-events-none">
                        <rect x={Math.min(px + 12, 270)} y={py - 44} width="120" height="56" rx="8" fill="#1e293b" fillOpacity="0.95" />
                        <text x={Math.min(px + 20, 278)} y={py - 28} fontSize="9" fontWeight="700" fill="#fff">Your Sample</text>
                        <text x={Math.min(px + 20, 278)} y={py - 16} fontSize="8" fill="#94a3b8">{`Sand ${sand}% · Silt ${silt}% · Clay ${clay}%`}</text>
                        <text x={Math.min(px + 20, 278)} y={py - 4} fontSize="8.5" fontWeight="600" fill="#4ade80">{textureClass}</text>
                    </g>
                )}
            </svg>
        </div>
    );
};

export { getTextureClass };
export default SoilTextureTriangle;
