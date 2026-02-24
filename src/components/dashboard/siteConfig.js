import { Leaf, Thermometer, Droplet, Wind, Sun, Activity, BarChart3 } from 'lucide-react';

// ─────────────────────────────────────────────
// Shared config — identical across all orchards
// ─────────────────────────────────────────────

const SHARED_METRICS = (datasetParam, sensorData) => [
    { icon: Leaf, title: 'Total Nitrogen', value: datasetParam?.total_nitrogen ? `${datasetParam.total_nitrogen}%` : 'N/A', description: 'Soil nitrogen content', gradient: true, gradientFrom: 'from-green-500', gradientTo: 'to-green-600' },
    { icon: Activity, title: 'Organic Matter', value: datasetParam?.organic_matter ? `${datasetParam.organic_matter}%` : 'N/A', description: 'Soil organic content', iconColor: 'text-orange-500' },
    { icon: Droplet, title: 'Total Carbon', value: datasetParam?.total_carbon ? `${datasetParam.total_carbon}%` : 'N/A', description: 'Carbon levels', iconColor: 'text-blue-400' },
    { icon: Thermometer, title: 'Temperature', value: datasetParam?.temperature ? `${datasetParam.temperature}°C` : 'N/A', description: 'Environmental temp', iconColor: 'text-red-500' },
    { icon: Wind, title: 'Humidity', value: sensorData?.humidity ? `${sensorData.humidity}%` : 'N/A', description: 'Air moisture', iconColor: 'text-sky-500' },
    { icon: Sun, title: 'pH Level', value: sensorData?.ph || 'N/A', description: 'Soil acidity', iconColor: 'text-yellow-500' },
    { icon: BarChart3, title: 'NPK-N', value: sensorData?.npk?.nitrogen ? `${sensorData.npk.nitrogen}ppm` : 'N/A', description: 'Available nitrogen', iconColor: 'text-indigo-500' },
    { icon: Leaf, title: 'NPK-P', value: sensorData?.npk?.phosphorus ? `${sensorData.npk.phosphorus}ppm` : 'N/A', description: 'Available phosphorus', iconColor: 'text-purple-500' },
];

const SHARED_CHART_DATASETS = (createDataset) => ({
    temperature: createDataset('temperature', 'Temperature (°C)', '#f97316'),
    humidity: createDataset('humidity', 'Humidity (%)', '#3b82f6'),
    ph: createDataset('ph', 'pH Level', '#10b981'),
    nitrogenNPK: createDataset('npk.nitrogen', 'NPK Nitrogen (ppm)', '#8b5cf6'),
});

const SHARED_CHART_METRICS = [
    { key: 'temperature', label: 'Temperature' },
    { key: 'humidity', label: 'Humidity' },
    { key: 'ph', label: 'pH Level' },
    { key: 'nitrogenNPK', label: 'NPK Nitrogen' },
];

const DEFAULT_CHART_METRICS = ['temperature', 'humidity'];

// Shared yield guard — both sites use the same input fields
const extractYieldInputs = (datasetParam) => {
    if (!datasetParam) return null;
    const { total_nitrogen, organic_matter, total_carbon, temperature, humidity } = datasetParam;
    if (!total_nitrogen || !organic_matter || !total_carbon || !temperature || !humidity) return null;
    return { total_nitrogen, organic_matter, total_carbon, temperature, humidity };
};

// ─────────────────────────────────────────────
// Per-site configuration
// ─────────────────────────────────────────────

const SITES = {
    nipis_orchard: {
        label: 'Nipis Orchard',
        plant: {
            name: 'Lime',
            description: 'Nipis lime cultivation with precision agriculture monitoring',
            detailsSlug: 'lime',
        },
        yieldFormula: (datasetParam) => {
            const v = extractYieldInputs(datasetParam);
            if (!v) return 0;
            const kg = 42434.72
                + (-8647.17 * v.total_nitrogen)
                + (1751.18 * v.organic_matter)
                + (-8005.21 * v.total_carbon)
                + (-29.76 * v.temperature)
                + (-4.01 * v.humidity);
            return Math.max(0, parseFloat(kg.toFixed(2)));
        },
        revenuePerKg: 3.65,
        metrics: SHARED_METRICS,
        chartDatasets: SHARED_CHART_DATASETS,
        chartMetrics: SHARED_CHART_METRICS,
        defaultChartMetrics: DEFAULT_CHART_METRICS,
    },

    kasturi_orchard: {
        label: 'Kasturi Orchard',
        plant: {
            name: 'Limau Kasturi',
            description: 'Kasturi lime cultivation with sustainable farming methods',
            detailsSlug: 'kasturi',
        },
        yieldFormula: (datasetParam) => {
            const v = extractYieldInputs(datasetParam);
            if (!v) return 0;
            const kg = -113481.12
                + (652168.99 * v.total_nitrogen)
                + (1228.76 * v.organic_matter)
                + (-20577.85 * v.total_carbon)
                + (-1107.59 * v.temperature)
                + (1349.29 * v.humidity);
            return Math.max(0, parseFloat(kg.toFixed(2)));
        },
        revenuePerKg: 3.03,
        metrics: SHARED_METRICS,
        chartDatasets: SHARED_CHART_DATASETS,
        chartMetrics: SHARED_CHART_METRICS,
        defaultChartMetrics: DEFAULT_CHART_METRICS,
    },
};

// ─────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────

export const SITE_IDS = Object.keys(SITES);
export const getSiteConfig = (siteId) => SITES[siteId] || SITES.nipis_orchard;
export const getSiteOptions = () => SITE_IDS.map(id => ({ value: id, label: SITES[id].label }));

export default SITES;
