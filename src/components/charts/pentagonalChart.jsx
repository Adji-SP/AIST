import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    RadarController,
    Filler,
    Tooltip,
    Legend
} from 'chart.js';
import React, { useRef, useEffect } from 'react';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    RadarController,
    Filler,
    Tooltip,
    Legend
);

export default function PentagonalChart({ 
    data, 
    options = {}, 
    colors = {
        primary: '#3b82f6',
        secondary: '#f97316',
        tertiary: '#10b981',
        quaternary: '#6b7280',
        text: '#ffffff'
    },
    className = '',
    height = 400 
}) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    const defaultColors = {
        primary: '#3b82f6',
        secondary: '#f97316',
        tertiary: '#10b981',
        quaternary: '#6b7280',
        text: '#ffffff',
        border: document.documentElement?.getAttribute('data-theme') === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)'
    };

    const finalColors = { ...defaultColors, ...colors };

    const defaultData = {
        labels: ['Load Time', 'First Paint', 'DOM Loaded', 'Cache Efficiency', 'JS Execution'],
        datasets: [
            {
                label: 'Chrome',
                data: [75, 80, 85, 85, 78],
                borderColor: '#ffffff',
                backgroundColor: `${finalColors.primary}33`,
                borderWidth: 2,
                pointBackgroundColor: finalColors.primary
            },
            {
                label: 'Firefox',
                data: [68, 75, 80, 78, 72],
                borderColor: '#ffffff',
                backgroundColor: `${finalColors.secondary}33`,
                borderWidth: 2,
                pointBackgroundColor: finalColors.secondary
            },
            {
                label: 'Safari',
                data: [82, 85, 78, 92, 76],
                borderColor: '#ffffff',
                backgroundColor: `${finalColors.tertiary}33`,
                borderWidth: 2,
                pointBackgroundColor: finalColors.tertiary
            },
            {
                label: 'IE',
                data: [55, 60, 52, 65, 58],
                borderColor: '#ffffff',
                backgroundColor: `${finalColors.quaternary}33`,
                borderWidth: 2,
                pointBackgroundColor: finalColors.quaternary
            }
        ]
    };

    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            }
        },
        scales: {
            r: {
                angleLines: { color: finalColors.border },
                grid: { color: finalColors.border },
                pointLabels: { color: finalColors.text, font: { size: 12, weight: '500' } },
                ticks: { color: finalColors.text, backdropColor: 'transparent' }
            }
        },
        plugins: { legend: { display: false } }
    };

    useEffect(() => {
        if (canvasRef.current) {
            // Destroy existing chart
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }

            const ctx = canvasRef.current.getContext('2d');
            chartRef.current = new ChartJS(ctx, {
                type: 'radar',
                data: data || defaultData,
                options: { ...defaultOptions, ...options }
            });
        }

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [data, options, finalColors]);

    return (
        <div className={className} style={{ height }}>
            <canvas ref={canvasRef}></canvas>
        </div>
    );
}