import {
    Chart as ChartJS,
    ArcElement,
    DoughnutController,
    Tooltip
} from 'chart.js';
import React, { useRef, useEffect } from 'react';

ChartJS.register(
    ArcElement,
    DoughnutController,
    Tooltip
);

export default function GaugeChart({ 
    value = 75,
    maxValue = 100,
    options = {}, 
    colors = {
        primary: '#3b82f6',
        secondary: '#6b7280',
        text: '#ffffff'
    },
    className = '',
    height = 400,
    showText = true,
    unit = '%'
}) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    const defaultColors = {
        primary: '#3b82f6',
        secondary: '#6b7280',
        text: '#ffffff'
    };

    const finalColors = { ...defaultColors, ...colors };
    const percentage = Math.min((value / maxValue) * 100, 100);
    const remaining = 100 - percentage;

    const defaultData = {
        datasets: [{
            data: [percentage, remaining],
            backgroundColor: [finalColors.primary, finalColors.secondary],
            borderWidth: 0,
            cutout: '85%',
            circumference: 180,
            rotation: 270
        }]
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
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
        },
        animation: {
            animateRotate: true,
            animateScale: true
        }
    };

    const gaugeTextPlugin = {
        id: 'gaugeText',
        afterDraw: (chart) => {
            if (!showText) return;
            
            const { width, height, ctx } = chart;
            ctx.restore();
            const fontSize = (height / 180).toFixed(2);
            ctx.font = `${fontSize}em sans-serif`;
            ctx.textBaseline = 'middle';
            ctx.fillStyle = finalColors.text;
            const text = `${Math.round(value)}${unit}`;
            const textX = Math.round((width - ctx.measureText(text).width) / 2);
            const textY = height / 1.5;
            ctx.fillText(text, textX, textY);
            ctx.save();
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
                type: 'doughnut',
                data: defaultData,
                options: { ...defaultOptions, ...options },
                plugins: [gaugeTextPlugin]
            });
        }

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [value, maxValue, finalColors, showText, unit, options]);

    return (
        <div className={className} style={{ height }}>
            <canvas ref={canvasRef}></canvas>
        </div>
    );
}