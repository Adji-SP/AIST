import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    LineController,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import React, { useRef, useEffect } from 'react';
//
ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    LineController,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function LineChart({
    data,
    options = {},
    colors = {},
    className = '',
    height = 400
}) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    // --- PERUBAHAN DI SINI ---
    // Mengubah warna teks default dari putih menjadi abu-abu agar terlihat
    const defaultColors = {
        primary: '#3b82f6',
        secondary: '#f97316',
        text: '#6b7280', // Sebelumnya '#ffffff' (putih)
        border: document.documentElement?.getAttribute('data-theme') === 'dark'
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(229, 231, 235, 1)' // Menggunakan warna abu-abu yang lebih jelas
    };

    const finalColors = { ...defaultColors, ...colors };

    const defaultData = {
        labels: ['Aug 01', 'Aug 02', 'Aug 03', 'Aug 04', 'Aug 05', 'Aug 06'],
        datasets: [{
            label: 'CPU Usage',
            data: [65, 70, 68, 72, 75, 73],
            borderColor: finalColors.primary,
            backgroundColor: `${finalColors.primary}20`,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
        }, {
            label: 'Memory Usage',
            data: [55, 60, 58, 62, 65, 63],
            borderColor: finalColors.secondary,
            backgroundColor: `${finalColors.secondary}20`,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
        }]
    };

    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true, // Menampilkan legenda agar tahu garis mana milik data apa
                position: 'top',
                labels: {
                    color: finalColors.text
                }
            }
        },
        layout: {
            padding: {
                top: 5,
                right: 20,
                bottom: 5,
                left: 5
            }
        },
        scales: {
            x: {
                grid: { drawOnChartArea: false },
                ticks: { color: finalColors.text, font: { size: 12, weight: '500' } }
            },
            y: {
                grid: { color: finalColors.border, lineWidth: 1 },
                ticks: { color: finalColors.text, font: { size: 12, weight: '500' } },
                // Kita akan hapus min & max agar skala bisa otomatis menyesuaikan data
                // min: 0, 
                // max: 100 
            }
        },
        interaction: { intersect: false, mode: 'index' }
    };

    useEffect(() => {
        if (canvasRef.current) {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }

            const ctx = canvasRef.current.getContext('2d');
            chartRef.current = new ChartJS(ctx, {
                type: 'line',
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
    }, [data, options, finalColors]); // dependensi tetap

    return (
        <div className={className} style={{ height }}>
            <canvas ref={canvasRef}></canvas>
        </div>
    );
}