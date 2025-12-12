import { useMemo } from 'react';
import {
    Droplet,
    Leaf,
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    Lightbulb,
    Beaker,
    // Removed unused: Scissors
    Sun,
    GlassWater,
    ShieldCheck
} from 'lucide-react';

const FarmingSuggestions = ({ sensorData, loading }) => {
    // Generate dynamic suggestions based on sensor data
    const suggestions = useMemo(() => {
        if (!sensorData) return [];

        const recommendations = [];
        const { soil_moisture, temperature, ph_level, nitrogen, organic_matter } = sensorData;

        // Soil Moisture Recommendations
        if (soil_moisture < 30) {
            recommendations.push({
                id: 'watering',
                type: 'critical',
                icon: Droplet,
                title: 'Immediate Irrigation Needed',
                description: `Low soil moisture (${soil_moisture}%)`,
                action: `Water with 15-20 liters per citrus tree. Focus on the root zone area with a radius of 1.5m from the trunk.`,
                priority: 'high',
                timeframe: 'Immediately (within 2 hours)',
                color: 'text-rose-700',
                bgColor: 'bg-gradient-to-r from-rose-50 to-pink-50',
                borderColor: 'border-rose-300',
                iconBg: 'bg-rose-100'
            });
        } else if (soil_moisture > 80) {
            recommendations.push({
                id: 'drainage',
                type: 'warning',
                icon: AlertTriangle,
                title: 'Drainage Required',
                description: `Soil moisture too high (${soil_moisture}%)`,
                action: 'Create drainage channels 30cm deep around the tree. Avoid watering for 2-3 days.',
                priority: 'medium',
                timeframe: '6-12 hours',
                color: 'text-amber-700',
                bgColor: 'bg-gradient-to-r from-amber-50 to-yellow-50',
                borderColor: 'border-amber-300',
                iconBg: 'bg-amber-100'
            });
        }

        // Temperature Recommendations
        if (temperature > 35) {
            recommendations.push({
                id: 'cooling',
                type: 'warning',
                icon: Sun,
                title: 'Heat Protection',
                description: `High temperature (${temperature}°C) may stress plants`,
                action: 'Install 40% shade net or 5-8cm thick organic mulch. Increase frequency of light watering.',
                priority: 'medium',
                timeframe: 'Today',
                color: 'text-orange-700',
                bgColor: 'bg-gradient-to-r from-orange-50 to-amber-50',
                borderColor: 'border-orange-300',
                iconBg: 'bg-orange-100'
            });
        }

        // pH Level Recommendations
        if (ph_level < 6.0) {
            recommendations.push({
                id: 'ph_adjustment',
                type: 'action',
                icon: Beaker,
                title: 'Soil pH Correction',
                description: `Soil pH too acidic (${ph_level})`,
                action: 'Apply 200-300g dolomite lime per tree. Mix with 2-3kg mature compost per tree.',
                priority: 'medium',
                timeframe: 'This week',
                color: 'text-blue-700',
                bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50',
                borderColor: 'border-blue-300',
                iconBg: 'bg-blue-100'
            });
        } else if (ph_level > 7.5) {
            recommendations.push({
                id: 'ph_lower',
                type: 'action',
                icon: Beaker,
                title: 'Lower Soil pH',
                description: `Soil pH too alkaline (${ph_level})`,
                action: 'Apply 50-80g elemental sulfur per tree or 3-4kg acidic organic compost per tree.',
                priority: 'medium',
                timeframe: 'This week',
                color: 'text-indigo-700',
                bgColor: 'bg-gradient-to-r from-indigo-50 to-purple-50',
                borderColor: 'border-indigo-300',
                iconBg: 'bg-indigo-100'
            });
        }

        // Nitrogen Recommendations
        if (nitrogen < 20) {
            recommendations.push({
                id: 'nitrogen',
                type: 'action',
                icon: Leaf,
                title: 'Nitrogen Fertilization',
                description: `Low nitrogen level (${nitrogen} ppm)`,
                action: 'Apply liquid organic NPK fertilizer at 100ml per 10 liters of water. Water the root zone twice a week.',
                priority: 'high',
                timeframe: '2-3 days',
                color: 'text-emerald-700',
                bgColor: 'bg-gradient-to-r from-emerald-50 to-teal-50',
                borderColor: 'border-emerald-300',
                iconBg: 'bg-emerald-100'
            });
        }

        // Microorganism Injection Recommendation
        if (organic_matter < 3) {
            recommendations.push({
                id: 'microorganisms',
                type: 'enhancement',
                icon: Activity,
                title: 'Microorganism Injection',
                description: `Low organic matter (${organic_matter}%)`,
                action: 'Inject EM4 250ml in 20 liters of water. Apply 2 liters per tree every 2 weeks.',
                priority: 'medium',
                timeframe: 'This week',
                color: 'text-violet-700',
                bgColor: 'bg-gradient-to-r from-violet-50 to-purple-50',
                borderColor: 'border-violet-300',
                iconBg: 'bg-violet-100'
            });
        }

        // Pruning Recommendation (seasonal)
        const currentMonth = new Date().getMonth();
        if (currentMonth >= 5 && currentMonth <= 7) { // June-August
            recommendations.push({
                id: 'pruning',
                type: 'maintenance',
                icon: GlassWater,
                title: 'Watering Suggestion',
                description: 'Optimal watering area',
                action: 'site A radius of 3 ares. should be watered 2000L Based on current soil moisture and temperature',
                priority: 'low',
                timeframe: 'This month',
                color: 'text-slate-700',
                bgColor: 'bg-gradient-to-r from-slate-50 to-gray-50',
                borderColor: 'border-slate-300',
                iconBg: 'bg-slate-100'
            });
        }

        // General soil health recommendation
        recommendations.push({
            id: 'soil_health',
            type: 'enhancement',
            icon: Lightbulb,
            title: 'Soil Health Improvement',
            description: 'Routine recommendation for healthy soil',
            action: 'Apply 5-8kg mature compost per tree every 3 months. Add 500g biochar per tree for water retention.',
            priority: 'low',
            timeframe: 'Monthly routine',
            color: 'text-teal-700',
            bgColor: 'bg-gradient-to-r from-teal-50 to-cyan-50',
            borderColor: 'border-teal-300',
            iconBg: 'bg-teal-100'
        });

        return recommendations.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }, [sensorData]);

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'medium': return <Clock className="w-4 h-4 text-amber-500" />;
            case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
            default: return <Lightbulb className="w-4 h-4 text-gray-500" />;
        }
    };

    const priorityCounts = useMemo(() => ({
        high: suggestions.filter(item => item.priority === 'high').length,
        medium: suggestions.filter(item => item.priority === 'medium').length,
        low: suggestions.filter(item => item.priority === 'low').length
    }), [suggestions]);

    const statusTone = useMemo(() => {
        if (suggestions.length === 0) {
            return {
                Icon: ShieldCheck,
                title: 'Healthy environment',
                message: 'All readings are inside the target range. We will surface next steps if anything drifts.',
                bg: 'bg-emerald-50',
                border: 'border-emerald-200',
                accent: 'bg-emerald-100 text-emerald-700'
            };
        }
        if (priorityCounts.high > 0) {
            return {
                Icon: AlertTriangle,
                title: 'Action needed',
                message: 'High-priority items detected. Address these first to keep plants stable.',
                bg: 'bg-rose-50',
                border: 'border-rose-200',
                accent: 'bg-rose-100 text-rose-700'
            };
        }
        if (priorityCounts.medium > 0) {
            return {
                Icon: Clock,
                title: 'Upcoming tasks',
                message: 'Medium-priority guidance available. Plan these into your next rounds.',
                bg: 'bg-amber-50',
                border: 'border-amber-200',
                accent: 'bg-amber-100 text-amber-700'
            };
        }
        return {
            Icon: Lightbulb,
            title: 'Advisory only',
            message: 'Low-priority optimizations to keep conditions on track.',
            bg: 'bg-sky-50',
            border: 'border-sky-200',
            accent: 'bg-sky-100 text-sky-700'
        };
    }, [priorityCounts.high, priorityCounts.medium, suggestions.length]);

    if (loading) {
        return (
            <div className="bg-white rounded-lg p-6 shadow-sm border h-full">
                <h3 className="font-semibold text-gray-900 mb-4">Condition and Suggestion</h3>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 h-full flex flex-col">
            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Condition overview</p>
                        <h3 className="text-lg font-semibold text-gray-900">Condition & Suggestion</h3>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1.5 rounded-full bg-slate-100 text-sm font-semibold text-slate-700 shadow-inner">{suggestions.length} live tips</span>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusTone.accent} shadow-sm`}>{statusTone.title}</span>
                </div>
            </div>

            <div className={`mb-4 rounded-xl border ${statusTone.border} ${statusTone.bg} p-4`}>
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/80 shadow-sm">
                        <statusTone.Icon className="w-5 h-5 text-gray-700" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{statusTone.title}</p>
                        <p className="text-xs text-gray-600 leading-relaxed">{statusTone.message}</p>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="flex items-center justify-between rounded-lg bg-white/70 border border-gray-200 px-3 py-2">
                                <span className="text-xs text-gray-500">High</span>
                                <span className="text-sm font-semibold text-rose-600">{priorityCounts.high}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-white/70 border border-gray-200 px-3 py-2">
                                <span className="text-xs text-gray-500">Medium</span>
                                <span className="text-sm font-semibold text-amber-600">{priorityCounts.medium}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-white/70 border border-gray-200 px-3 py-2">
                                <span className="text-xs text-gray-500">Low</span>
                                <span className="text-sm font-semibold text-emerald-600">{priorityCounts.low}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {suggestions.map((suggestion) => {
                    const Icon = suggestion.icon;
                    return (
                        <div
                            key={suggestion.id}
                            className={`relative p-5 rounded-xl border ${suggestion.bgColor} ${suggestion.borderColor} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden`}
                        >
                            {/* Background Pattern */}
                            <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
                                <Icon className="w-full h-full" />
                            </div>
                            
                            <div className="relative z-10">
                                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${suggestion.iconBg}`}>
                                            <Icon className={`w-5 h-5 ${suggestion.color}`} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">Guidance</p>
                                            <h4 className={`font-semibold text-base ${suggestion.color}`}>
                                                {suggestion.title}
                                            </h4>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm ${
                                            suggestion.priority === 'high' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
                                            suggestion.priority === 'medium' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 
                                            'bg-gradient-to-r from-emerald-500 to-teal-500'
                                        }`}>
                                            {suggestion.priority === 'high' ? 'High priority' :
                                             suggestion.priority === 'medium' ? 'Medium priority' : 'Low priority'}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs text-gray-600 bg-white/70 px-2 py-1 rounded-full border border-white/60">
                                            <Clock className="w-3 h-3" />
                                            <span>{suggestion.timeframe}</span>
                                        </div>
                                        {getPriorityIcon(suggestion.priority)}
                                    </div>
                                </div>
                                
                                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                                    {suggestion.description}
                                </p>

                                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-white/60 mb-3 shadow-sm">
                                    <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                        <Lightbulb className="w-3 h-3" />
                                        Recommended action
                                    </p>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {suggestion.action}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {suggestions.length === 0 && (
                <div className="text-center py-8 text-gray-500 border border-dashed border-emerald-200 rounded-lg bg-emerald-50/70 mt-2">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                    <p className="font-semibold text-emerald-800">All parameters are in optimal condition</p>
                    <p className="text-sm text-emerald-700 mt-1">We will surface targeted actions here when something needs attention.</p>
                </div>
            )}
        </div>
    );
};

export default FarmingSuggestions;
