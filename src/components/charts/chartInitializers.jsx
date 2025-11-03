import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
);

import React from 'react';
// import Chart from 'chart.js/auto';
export function initBarChart(canvasId) {
    const colors = {
        blue: '#3b82f6',
        orange: '#f97316',
        gray: '#6b7280',
        text: '#ffffff',
        border: document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
    };

    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['HTML', 'CSS', 'JavaScript', 'Images', 'Fonts', 'API'],
            datasets: [{
                label: 'Cache Hit',
                data: [85, 92, 78, 95, 88, 72],
                backgroundColor: colors.blue,
                borderRadius: 6,
                borderSkipped: false,
            }, {
                label: 'Cache Miss',
                data: [10, 6, 15, 3, 8, 20],
                backgroundColor: colors.orange,
                borderRadius: 6,
                borderSkipped: false,
            }, {
                label: 'No Cache',
                data: [5, 2, 7, 2, 4, 8],
                backgroundColor: colors.gray,
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            layout: {
                padding: {
                    top: 20,
                    right: 20,
                    bottom: 40,
                    left: 20
                }
            },
            scales: {
                x: { grid: { color: colors.border, lineWidth: 1 }, ticks: { color: colors.text, font: { size: 12, weight: '500' } } },
                y: { grid: { color: colors.border, lineWidth: 1 }, ticks: { color: colors.text, font: { size: 12, weight: '500' } } }
            }
        }
    });
}

export function initLineChart(canvasId) {
    const colors = {
        blue: '#3b82f6',
        orange: '#f97316',
        text: '#ffffff',
        border: document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
    };

    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Aug 01', 'Aug 02', 'Aug 03', 'Aug 04', 'Aug 05', 'Aug 06'],
            datasets: [{
                label: 'CPU Usage',
                data: [65, 70, 68, 72, 75, 73],
                borderColor: colors.blue,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6,
            }, {
                label: 'Memory Usage',
                data: [55, 60, 58, 62, 65, 63],
                borderColor: colors.orange,
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            layout: {
                padding: {
                    top: 20,
                    right: 20,
                    bottom: 40,
                    left: 20
                }
            },
            scales: {
                x: { grid: { color: colors.border, lineWidth: 1 }, ticks: { color: colors.text, font: { size: 12, weight: '500' } } },
                y: { grid: { color: colors.border, lineWidth: 1 }, ticks: { color: colors.text, font: { size: 12, weight: '500' } }, min: 0, max: 100 }
            },
            interaction: { intersect: false, mode: 'index' }
        }
    });
}

export function initPentagonalChart(canvasId) {
    const colors = {
        blue: '#3b82f6',
        orange: '#f97316',
        green: '#10b981',
        gray: '#6b7280',
        text: '#ffffff',
        border: document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
    };

    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx.getContext('2d'), {
        type: 'radar',
        data: {
            labels: ['Load Time', 'First Paint', 'DOM Loaded', 'Cache Efficiency', 'JS Execution'],
            datasets: [
                {
                    label: 'Chrome',
                    data: [75, 80, 85, 85, 78],
                    borderColor: '#ffffff',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: colors.blue
                },
                {
                    label: 'Firefox',
                    data: [68, 75, 80, 78, 72],
                    borderColor: '#ffffff',
                    backgroundColor: 'rgba(249, 115, 22, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: colors.orange
                },
                {
                    label: 'Safari',
                    data: [82, 85, 78, 92, 76],
                    borderColor: '#ffffff',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: colors.green
                },
                {
                    label: 'IE',
                    data: [55, 60, 52, 65, 58],
                    borderColor: '#ffffff',
                    backgroundColor: 'rgba(107, 114, 128, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: colors.gray
                }
            ]
        },
        options: {
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
                    angleLines: { color: colors.border },
                    grid: { color: colors.border },
                    pointLabels: { color: colors.text, font: { size: 12, weight: '500' } },
                    ticks: { color: colors.text, backdropColor: 'transparent' }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

export function initGaugeChart(canvasId) {
    const colors = {
        blue: '#3b82f6',
        gray: '#6b7280',
        text: '#ffffff',
        border: document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
    };

    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [75, 25],
                backgroundColor: [colors.blue, colors.gray],
                borderWidth: 0,
                cutout: '85%',
                circumference: 180,
                rotation: 270
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 45,
                    right: 45,
                    bottom: 75,
                    left: 45
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
        },
        plugins: [{
            id: 'gaugeText',
            afterDraw: (chart) => {
                const { width, height, ctx } = chart;
                ctx.restore();
                const fontSize = (height / 180).toFixed(2);
                ctx.font = `${fontSize}em sans-serif`;
                ctx.textBaseline = 'middle';
                ctx.fillStyle = colors.text;
                const text = '75%';
                const textX = Math.round((width - ctx.measureText(text).width) / 2);
                const textY = height / 1.5;
                ctx.fillText(text, textX, textY);
                ctx.save();
            }
        }]
    });
}

export function initPieChart(canvasId) {
    const colors = {
        text: '#ffffff',
        border: document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
    };

    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx.getContext('2d'), {
        type: 'pie',
        data: {
            labels: ["Monday", "Tuesday", "Wednesday", "Thursday"],
            datasets: [{
                data: [1234, 2234, 3234, 4234],
                backgroundColor: ["rgba(117,169,255,0.6)", "rgba(148,223,215,0.6)", "rgba(208,129,222,0.6)", "rgba(247,127,167,0.6)"]
            }]
        },
        options: {
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
                    position: 'top',
                    padding: 20,
                    labels: {
                        color: colors.text,
                        font: { size: 12, weight: '500' }
                    }
                }
            }
        }
    });
}

// No default export; this file provides initializer functions for charts
