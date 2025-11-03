import React, { useState, useMemo } from 'react';
import {
    Leaf, Droplet, Users, ShieldCheck, LandPlot, Globe, Handshake, Landmark, TrendingUp, CheckCircle, Scale, RefreshCw, BarChartHorizontal, Target, Heart, Zap, Book, Fish, TreePine
} from 'lucide-react';

// Core Layout Components
import Header from '../layout/header';
import Sidebar from '../layout/sidebar';
import LineChart from '../charts/lineChart'; // Assuming a separate LineChart component

// Page Assets
import backgroundImage from '../images/sawah.jpg'; // Ensure this path is correct

// =================================================================================
// Professional UI Theme & Palette
// =================================================================================
const theme = {
    colors: {
        primary: '#16a34a', // green-600
        primary_light: 'rgba(22, 163, 74, 0.15)',
        secondary: '#475569', // slate-600
        secondary_light: 'rgba(71, 85, 105, 0.15)',
        border: '#e2e8f0', // slate-200
        text_header: '#1e293b', // slate-800
        text_body: '#475569', // slate-600
        background: '#f8fafc', // slate-50
    },
    shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
};

// =================================================================================
// Data Objects & KPI Integration
// =================================================================================

// TODO: Data ini akan diambil dari endpoint API yang berisi tujuan program secara global.
const programGoalsData = [{value: '10K',label: 'FARMERS',description: 'Support and collaborate with 10,000 farmers globally, equipping them with sustainable practices to transform agriculture into a regenerative, climate-positive industry.'},{value: '100K',label: 'HECTARES',description: 'Regenerate 100,000 hectares of farmland using zero-carbon techniques, creating fertile, carbon-rich soils that enhance productivity and sustainability.'},{value: '1M',label: 'TONS OF FOOD',description: 'Produce 1,000,000 tons of zero-carbon food, showcasing how sustainable agriculture can meet global food demands while minimizing environmental impact.'},{value: '10M',label: 'TONS OF CO2',description: 'Sequester 10,000,000 tons of CO2, contributing significantly to global climate action through advanced carbon farming and innovative methods.'},];

// [UPDATED] KPI dari Anda telah diintegrasikan di sini.
// TODO: Data untuk kartu-kartu ini sebaiknya diambil dari CMS atau tabel khusus di database.
const environmentalImpactData = { 
    title: 'Environmental', 
    summary: 'Restoring the planet by rebuilding soil health, sequestering carbon, and embracing renewable energy.', 
    icon: Globe, 
    borderColor: '#10b981', 
    points: [
        { title: 'Reduce CO2', description: 'Actively sequestering carbon from the atmosphere into the soil.' }, 
        { title: 'Optimize Soil Health', description: 'Enhancing fertility and water retention to create resilient ecosystems.' },
        { title: 'Provide Renewable Energy', description: 'Integrating clean energy sources into farming operations to minimize our carbon footprint.' }
    ]
};

// SDGs Impact Data for Regenerative Farming - Based on Scientific Research
// Note: All data points are research-based estimates and should be validated with current studies
const sdgsImpactData = [
    {
        goal: 1,
        title: "No Poverty",
        description: "Regenerative farming creates sustainable livelihoods for smallholder farmers through increased soil productivity and reduced input costs.",
        impact: "20-40% increase in farmer profitability (estimated range)",
        icon: Target,
        color: "#E5243B",
        metrics: [
            { label: "Input cost reduction", value: "15-25%" },
            { label: "Yield stability", value: "+improved" }
        ],
        sources: "Estimated based on reduced input costs and improved yield stability from regenerative practices",
        disclaimer: "Data ranges based on general regenerative farming studies - specific percentages vary by region and crop"
    },
    {
        goal: 2,
        title: "Zero Hunger",
        description: "Enhanced soil health and biodiversity lead to more nutritious food production and improved food security for farming communities.",
        impact: "10-29% yield increase potential in degraded soils",
        icon: Leaf,
        color: "#DDA63A",
        metrics: [
            { label: "Yield resilience", value: "+20-30%" },
            { label: "Nutrient density", value: "Variable" }
        ],
        sources: "Gattinger et al. (2012) - meta-analysis of organic vs conventional yields",
        disclaimer: "Yield improvements typically seen after 3-5 year transition period"
    },
    {
        goal: 3,
        title: "Good Health",
        description: "Reduced chemical pesticide use and improved soil microbiome contribute to healthier food systems and communities.",
        impact: "Significant reduction in synthetic chemical exposure",
        icon: Heart,
        color: "#4C9F38",
        metrics: [
            { label: "Pesticide reduction", value: "50-90%" },
            { label: "Health co-benefits", value: "Positive" }
        ],
        sources: "Typical reductions in regenerative/organic systems (variable by practice)",
        disclaimer: "Health benefits are qualitative and vary by implementation"
    },
    {
        goal: 6,
        title: "Clean Water",
        description: "Regenerative practices improve water retention, reduce erosion, and minimize agricultural runoff that pollutes water sources.",
        impact: "30-50% improvement in water infiltration rates",
        icon: Droplet,
        color: "#26BDE2",
        metrics: [
            { label: "Water retention", value: "+30-50%" },
            { label: "Erosion reduction", value: "Up to 90%" }
        ],
        sources: "Soil Health Institute studies on cover crops and no-till practices",
        disclaimer: "Results vary significantly by soil type and climate conditions"
    },
    {
        goal: 7,
        title: "Affordable Energy",
        description: "Integration of renewable energy systems and biogas from organic waste reduces energy costs for farming operations.",
        impact: "20-40% reduction in external energy inputs",
        icon: Zap,
        color: "#FCC30B",
        metrics: [
            { label: "Fuel savings", value: "20-30%" },
            { label: "Energy efficiency", value: "Improved" }
        ],
        sources: "Estimated from reduced tillage and synthetic fertilizer production energy",
        disclaimer: "Energy savings primarily from reduced tillage and synthetic inputs"
    },
    {
        goal: 13,
        title: "Climate Action",
        description: "Carbon sequestration in soils and reduced emissions from synthetic fertilizers contribute significantly to climate mitigation.",
        impact: "0.3-2.0 tC/ha/yr soil carbon sequestration potential",
        icon: Globe,
        color: "#3F7E44",
        metrics: [
            { label: "Carbon sequestration", value: "0.3-2.0 tC/ha/yr" },
            { label: "GHG reduction", value: "10-40%" }
        ],
        sources: "Minasny et al. (2017), Paustian et al. (2016) - soil carbon sequestration studies",
        disclaimer: "Carbon sequestration rates highly variable by climate, soil type, and management"
    },
    {
        goal: 14,
        title: "Life Below Water",
        description: "Reduced agricultural runoff and elimination of harmful chemicals protect marine ecosystems and water quality.",
        impact: "Significant reduction in nutrient and chemical runoff",
        icon: Fish,
        color: "#0A97D9",
        metrics: [
            { label: "Nitrate leaching", value: "-40-70%" },
            { label: "Chemical runoff", value: "Minimized" }
        ],
        sources: "Studies on cover crops and reduced fertilizer applications",
        disclaimer: "Pollution reduction depends on specific practices and watershed characteristics"
    },
    {
        goal: 15,
        title: "Life on Land",
        description: "Regenerative farming practices restore biodiversity, improve soil health, and create habitats for wildlife.",
        impact: "2-5x increase in beneficial insect populations",
        icon: TreePine,
        color: "#56C02B",
        metrics: [
            { label: "Soil biodiversity", value: "+50-200%" },
            { label: "Wildlife habitat", value: "Enhanced" }
        ],
        sources: "Bengtsson et al. (2005) - biodiversity in organic farming systems",
        disclaimer: "Biodiversity benefits vary greatly by local ecosystem and farming transition period"
    }
];
const socialImpactData = { 
    title: 'Social', 
    summary: 'Fostering trust and collaboration across the entire value chain for shared prosperity.', 
    icon: Users, 
    borderColor: '#f97316', 
    points: [
        { title: 'Enhance Public Trust', description: 'Building confidence through transparent and ethical practices.' }, 
        { title: 'Engage The Triple Helix', description: 'Fostering innovation through collaboration between university, industry, and government.' },
        { title: 'Accelerate Supply Chain', description: 'Ensuring efficient and convenient trade transactions from farm to consumer.' }
    ]
};
const governanceImpactData = { 
    title: 'Governance', 
    summary: 'Ensuring a transparent, accountable, and financially robust framework for sustainable growth.', 
    icon: ShieldCheck, 
    borderColor: '#3b82f6', 
    points: [
        { title: 'Financial Transparency', description: 'Providing clear insights into company management and financial health.' },
        { title: 'Enhance Accountability', description: 'Attracting investors through a responsible and accountable operational model.' }, 
        { title: 'Optimize Tax Revenues', description: 'Promoting fiscal responsibility by reducing the potential for tax evasion.' }
    ]
};


// =================================================================================
// Refined Reusable Components
// =================================================================================

const SectionHeader = ({ title, subtitle }) => (
    <div className="mb-6">
        <h2 className={`text-2xl font-bold ${theme.colors.text_header}`}>{title}</h2>
        {subtitle && <p className={`mt-1 max-w-2xl text-base ${theme.colors.text_body}`}>{subtitle}</p>}
    </div>
);

const ProgramGoal = ({ value, label, description }) => (
    <div className="flex flex-col md:flex-row rounded-lg overflow-hidden backdrop-blur-md transition-all duration-300 hover:bg-white/20"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
        <div className="p-6 md:w-64 flex-shrink-0 flex items-center justify-center border-b-2 md:border-b-0 md:border-r-2 border-white/20">
            <div className="text-center">
                <span className="text-5xl lg:text-6xl font-extrabold text-white">{value}</span>
                <span className="mt-1 block text-lg font-semibold tracking-wider text-green-300">{label}</span>
            </div>
        </div>
        <div className="p-6 flex items-center">
            <p className="text-base font-medium text-white/90">{description}</p>
        </div>
    </div>
);

const ImpactCard = ({ impactData }) => {
    const { title, summary, icon: Icon, points, borderColor } = impactData;
    return (
        <div className="bg-white rounded-xl flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{ boxShadow: theme.shadow, borderTop: `4px solid ${borderColor}` }}>
            <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full" style={{ backgroundColor: `${borderColor}20` }}>
                         <Icon className="w-7 h-7" style={{ color: borderColor }}/>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                </div>
                 <p className="text-sm text-slate-600">{summary}</p>
            </div>
            <div className="p-6 border-t border-slate-100 flex-grow">
                <ul className="space-y-4">
                    {points.map((point) => (
                        <li key={point.title} className="flex items-start gap-4">
                            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: borderColor }} />
                            <div>
                                <h5 className="font-semibold text-slate-700">{point.title}</h5>
                                <p className="text-sm text-slate-500">{point.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const FinancialComparisonChart = ({ title, data, loading, onRefresh }) => {
    const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: true, backgroundColor: '#1e293b', titleColor: '#cbd5e1', bodyColor: '#fff', borderColor: '#334155', borderWidth: 1, padding: 10, displayColors: true, boxPadding: 4, callbacks: { label: function(context) { let label = context.dataset.label || ''; if (label) { label += ': '; } if (context.parsed.y !== null) { label += new Intl.NumberFormat('en-US').format(context.parsed.y); } return label; } } } }, scales: { x: { grid: { display: false }, ticks: { color: theme.colors.text_body } }, y: { grid: { color: theme.colors.border, border: { dash: [4, 4] } }, ticks: { color: theme.colors.text_body } } }, interaction: { intersect: false, mode: 'index' }, elements: { point: { radius: 3, hoverRadius: 6, borderWidth: 2, hoverBorderWidth: 2 } } };
    return (
        <div className="bg-white rounded-xl p-6 h-full flex flex-col" style={{ boxShadow: theme.shadow }}>
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                <button onClick={onRefresh} disabled={loading} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 disabled:opacity-50"><RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /></button>
            </div>
            <div className="flex-grow h-96">
                <LineChart data={data} options={chartOptions} />
            </div>
        </div>
    );
};

const SDGCard = ({ sdg }) => {
    const { goal, title, description, impact, icon: Icon, color, metrics, sources, disclaimer } = sdg;
    
    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: color }}>
                            {goal}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                            <p className="text-sm text-slate-500">SDG Goal {goal}</p>
                        </div>
                    </div>
                    <Icon className="w-8 h-8" style={{ color: color }} />
                </div>
                
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">{description}</p>
                
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Key Impact:</p>
                    <p className="text-base font-bold" style={{ color: color }}>{impact}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                </div>
                
                {/* Sources and Disclaimer */}
                <div className="border-t border-slate-200 pt-4">
                    <div className="mb-2">
                        <p className="text-xs font-medium text-slate-600 mb-1">Source:</p>
                        <p className="text-xs text-slate-500 leading-relaxed">{sources}</p>
                    </div>
                    {disclaimer && (
                        <div>
                            <p className="text-xs font-medium text-amber-600 mb-1">Note:</p>
                            <p className="text-xs text-amber-600 leading-relaxed">{disclaimer}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SDGsOverview = () => {
    const totalGoals = sdgsImpactData.length;
    
    return (
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 mb-8">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">SDGs Impact Dashboard</h3>
                <p className="text-slate-600">How regenerative farming contributes to UN Sustainable Development Goals</p>
                <p className="text-xs text-slate-500 mt-2">
                    * All data ranges are estimates based on scientific literature and may vary by location, climate, and implementation
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-blue-500 rounded-full flex items-center justify-center mb-2">
                        <Target className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{totalGoals}</p>
                    <p className="text-sm text-slate-600">SDGs Addressed</p>
                </div>
                
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-2">
                        <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-green-600">Variable</p>
                    <p className="text-sm text-slate-600">Impact Range</p>
                </div>
                
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-orange-500 rounded-full flex items-center justify-center mb-2">
                        <Book className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-orange-600">Research</p>
                    <p className="text-sm text-slate-600">Based Data</p>
                </div>
            </div>
        </div>
    );
};

const DOSMDataWidget = ({ dosmStats }) => {
    return (
        <div className="bg-white rounded-xl p-6 h-full" style={{ boxShadow: theme.shadow }}>
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">National Economic Context</h3>
                    <p className="text-sm text-slate-500">Source: Dept. of Statistics Malaysia (DOSM) - Simulated</p>
                </div>
                <Landmark className="w-7 h-7 text-slate-300"/>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                 <div>
                    <p className="text-4xl font-bold text-green-600">{dosmStats.gdpGrowth}%</p>
                    <p className="text-sm text-slate-500 mt-1">Q4 2024 Agri GDP Growth</p>
                </div>
                 <div>
                    <p className="text-4xl font-bold text-blue-600">{dosmStats.agriEmployment}</p>
                    <p className="text-sm text-slate-500 mt-1">Persons Employed in Agri</p>
                </div>
                 <div>
                    <p className="text-4xl font-bold text-orange-600">{dosmStats.foodSecurityIndex}</p>
                    <p className="text-sm text-slate-500 mt-1">Global Food Security Index</p>
                </div>
             </div>
        </div>
    );
}

// =================================================================================
// Main Page Component
// =================================================================================
const FinancePage = () => {

    // =================================================================================
    // A. DATA LAYER & STATE MANAGEMENT
    // =================================================================================

    // --- 1. Backend Data Placeholders ---
    // Di sinilah data dari backend akan disimpan. Gunakan useEffect untuk mengambilnya.

    // TODO: Ganti fungsi dummy ini dengan panggilan API untuk mengambil data time-series.
    const [financialData, setFinancialData] = useState(() => Array.from({ length: 30 }, (_, i) => ({ timestamp: new Date(new Date().setDate(new Date().getDate() - (29 - i))), regenerative_profit: parseFloat((6700 + Math.random() * 800 - 400).toFixed(0)), regenerative_cost: parseFloat((2750 + Math.random() * 300 - 150).toFixed(0)) })));
    
    // TODO: Ganti objek statis ini dengan data dari endpoint API DOSM atau database internal.
    const [dosmStats, setDosmStats] = useState({ 
        gdpGrowth: 2.9, 
        agriEmployment: "1.4M", 
        foodSecurityIndex: "81.3" 
    });


    // --- 2. UI-Specific State ---
    // State ini murni untuk mengontrol antarmuka, bukan data.

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);


    // =================================================================================
    // B. HANDLERS & DATA FETCHING
    // =================================================================================
    
    // TODO: Kembangkan fungsi ini untuk mengambil semua data yang relevan dari beberapa endpoint API secara bersamaan.
    const refetchAllData = () => { 
        setLoading(true); 
        console.log("Refetching data from backend...");
        // Simulasi panggilan API
        setTimeout(() => { 
            setFinancialData(Array.from({ length: 30 }, (_, i) => ({ 
                timestamp: new Date(new Date().setDate(new Date().getDate() - (29 - i))), 
                regenerative_profit: parseFloat((6700 + Math.random() * 800 - 400).toFixed(0)), 
                regenerative_cost: parseFloat((2750 + Math.random() * 300 - 150).toFixed(0)) 
            }))); 
            // setDosmStats(...) juga akan dipanggil di sini jika perlu di-refresh.
            setLoading(false); 
        }, 1000); 
    };


    // =================================================================================
    // C. DATA PROCESSING & MEMOIZATION
    // =================================================================================
    
    // Memoized Chart Data - Mengubah data mentah menjadi format yang siap untuk chart.
    const { profitData, costData } = useMemo(() => {
        // TODO: Pastikan nama field (e.g., regenerative_profit) cocok dengan yang dikirim oleh backend.
        if (!financialData) return { profitData: { labels: [], datasets: [] }, costData: { labels: [], datasets: [] }};
        const labels = financialData.map(r => r.timestamp.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }));
        return {
            profitData: { labels, datasets: [{ label: 'Profit', data: financialData.map(r => r.regenerative_profit), borderColor: theme.colors.primary, backgroundColor: theme.colors.primary_light, pointBackgroundColor: '#fff', pointBorderColor: theme.colors.primary, fill: true, tension: 0.4 }] },
            costData: { labels, datasets: [{ label: 'Cost', data: financialData.map(r => r.regenerative_cost), borderColor: theme.colors.secondary, backgroundColor: theme.colors.secondary_light, pointBackgroundColor: '#fff', pointBorderColor: theme.colors.secondary, fill: true, tension: 0.4 }] }
        };
    }, [financialData]);

    // =================================================================================
    // D. COMPONENT RENDERING (JSX)
    // =================================================================================

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)}
            />
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <Header onMenuClick={() => setSidebarOpen(true)} selectedGarden={"Global Impact Program"} onGardenChange={() => {}} />
                
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
                    {/* Hero Section */}
                    <div className="relative mb-12 rounded-xl shadow-lg overflow-hidden">
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }}></div>
                        <div className="absolute inset-0 bg-black/50"></div>
                        <div className="relative p-6 md:p-8 space-y-4">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight" style={{textShadow: '0 2px 5px rgba(0,0,0,0.5)'}}>Program Goals</h1>
                            <div className="space-y-6 mt-4">
                              {programGoalsData.map((goal, index) => <ProgramGoal key={index} {...goal} />)}
                            </div>
                        </div>
                    </div>
                    
                    {/* SDGs Impact Section */}
                    <div className="mb-12">
                        <SectionHeader 
                            title="UN Sustainable Development Goals Impact" 
                            subtitle="How regenerative farming practices contribute to global sustainability targets and create measurable positive impact." 
                        />
                        <SDGsOverview />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {sdgsImpactData.map((sdg, index) => (
                                <SDGCard key={index} sdg={sdg} />
                            ))}
                        </div>
                    </div>

                    {/* ESG Section */}
                    <div className="mb-12">
                        <SectionHeader 
                            title="ESG Impact Dimensions" 
                            subtitle="Analyzing the triple bottom line of regenerative agriculture: Environmental, Social, and Governance." 
                        />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <ImpactCard impactData={environmentalImpactData} />
                            <ImpactCard impactData={socialImpactData} />
                            <ImpactCard impactData={governanceImpactData} />
                        </div>
                    </div>

                    {/* Financial & National Context Section */}
                    {/* <div>
                         <SectionHeader 
                            title="Financial & Economic Insights"
                            subtitle="Tracking financial performance against the broader national economic landscape."
                         />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <FinancialComparisonChart title="Profitability Over Time" data={profitData} loading={loading} onRefresh={refetchAllData} />
                            <FinancialComparisonChart title="Operational Costs Over Time" data={costData} loading={loading} onRefresh={refetchAllData} />
                        </div>

                        <div className="mt-8">
                            <DOSMDataWidget dosmStats={dosmStats}/>
                        </div>
                    </div> */}
                </main>
            </div>
        </div>
    );
};

export default FinancePage;