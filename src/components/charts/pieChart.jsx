import {
    Chart as ChartJS,
    ArcElement,
    PieController,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import React, { useRef, useEffect } from 'react';

ChartJS.register(
    ArcElement,
    PieController,
    Title,
    Tooltip,
    Legend
);

export default function PieChart({ 
    data, 
    options = {}, 
    colors = {
        text: '#ffffff'
    },
    className = '',
    height = 400,
    showLegend = true 
}) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    const defaultColors = {
        text: '#ffffff',
        border: document.documentElement?.getAttribute('data-theme') === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)'
    };

    const finalColors = { ...defaultColors, ...colors };

    const defaultData = {
        labels: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        datasets: [{
            data: [1234, 2234, 3234, 4234],
            backgroundColor: [
                "rgba(117,169,255,0.6)", 
                "rgba(148,223,215,0.6)", 
                "rgba(208,129,222,0.6)", 
                "rgba(247,127,167,0.6)"
            ]
        }]
    };

    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 20,
                right: 20,
                bottom: 40,
                left: 20
            }
        },
        plugins: {
            legend: {
                display: showLegend,
                position: 'top',
                padding: 20,
                labels: {
                    color: finalColors.text,
                    font: { size: 12, weight: '500' }
                }
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
                type: 'pie',
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
    }, [data, options, finalColors, showLegend]);

    return (
        <div className={className} style={{ height }}>
            <canvas ref={canvasRef}></canvas>
        </div>
    );
}