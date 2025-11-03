import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    BarController,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import React, { useRef, useEffect } from 'react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    BarController,
    Title,
    Tooltip,
    Legend
);

export default function BarChart({ 
    data, 
    options = {}, 
    colors = {
        primary: '#3b82f6',
        secondary: '#f97316', 
        tertiary: '#6b7280',
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
        tertiary: '#6b7280',
        text: '#ffffff',
        border: document.documentElement?.getAttribute('data-theme') === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)'
    };

    const finalColors = { ...defaultColors, ...colors };

    const defaultData = {
        labels: ['HTML', 'CSS', 'JavaScript', 'Images', 'Fonts', 'API'],
        datasets: [{
            label: 'Cache Hit',
            data: [85, 92, 78, 95, 88, 72],
            backgroundColor: finalColors.primary,
            borderRadius: 6,
            borderSkipped: false,
        }, {
            label: 'Cache Miss',
            data: [10, 6, 15, 3, 8, 20],
            backgroundColor: finalColors.secondary,
            borderRadius: 6,
            borderSkipped: false,
        }, {
            label: 'No Cache',
            data: [5, 2, 7, 2, 4, 8],
            backgroundColor: finalColors.tertiary,
            borderRadius: 6,
            borderSkipped: false,
        }]
    };

    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        layout: {
            padding: {
                top: 20,
                right: 20,
                bottom: 10,
                left: 20
            }
        },
        scales: {
            x: { 
                grid: { color: finalColors.border, lineWidth: 1 }, 
                ticks: { color: finalColors.text, font: { size: 12, weight: '500' } } 
            },
            y: { 
                grid: { color: finalColors.border, lineWidth: 1 }, 
                ticks: { color: finalColors.text, font: { size: 12, weight: '500' } } 
            }
        }
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
                type: 'bar',
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