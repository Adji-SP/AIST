import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Leaf, Activity, BarChart3, Zap, Shield, Globe,
    ArrowRight, Cpu, Monitor, Sprout, PlayCircle, Menu, X, Linkedin, Instagram, CheckCircle,
    Star, Droplets, Droplets as Thermometer, Wind, Target, Check, Mail, ChevronDown
} from 'lucide-react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getApps } from 'firebase/app';

// ==============================================================================
// 1. DATA AND CONTENT (Dynamic via Firestore, fallback to complete dummy data)
// ==============================================================================
const DEFAULT_CONTENT = {
    hero: {
        badge: 'Precision Agriculture Platform',
        titleLine1: 'Bring Fresh Growth',
        titleHighlight: 'To Agriculture.',
        subtitle: 'Experience the ultimate farming journey with expert tips, premium gear, and professional insights delivered straight to your unified dashboard.',
        ctaPrimary: 'Get Started',
        ctaSecondary: 'Watch Demo'
    },
    metrics: [
        { value: '50+', label: 'Years Of Experience' },
        { value: '200+', label: 'Fields In Progress' },
        { value: '120,000+', label: 'Farmers Worldwide' },
        { value: '$15 Billion', label: 'Agricultural Product' }
    ],
    featuresIntro: {
        title: 'Next-Gen Solutions For Optimal Crop Growth',
        subtitle: 'We provide cutting-edge services to help farmers maximize crop yields. Our precision farming, crop monitoring, and automation solutions aim to revolutionize agriculture.'
    },
    features: [
        { icon: 'Monitor', title: 'Farming Precision', description: 'Our precision farming employs state-of-the-art technology to optimize every aspect of farm operations.', img: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=600' },
        { icon: 'Activity', title: 'Crop Surveillance', description: 'Track your crops\' health and growth in real-time with our innovative solutions.', img: 'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&q=80&w=600' },
        { icon: 'Cpu', title: 'Automated Farming', description: 'Enhance farm efficiency and productivity with our cutting-edge automation solutions.', img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=600' },
        { icon: 'BarChart3', title: 'AI Recommendations', description: 'Receive smart, data-driven suggestions tailored to your specific field conditions.', img: 'https://images.unsplash.com/photo-1592982537447-6f2aa6c08fe2?auto=format&fit=crop&q=80&w=600' },
        { icon: 'Zap', title: 'Real-time Alerts', description: 'Instant notifications when thresholds are crossed to prevent crop loss.', img: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=600' },
        { icon: 'Globe', title: 'Multi-Site Sync', description: 'Manage multiple orchards seamlessly from a single unified command center.', img: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=600' }
    ],
    howItWorks: [
        { num: '01', title: 'Connect Sensors', description: 'Install IoT devices across your fields to stream live soil and weather data directly to the cloud.' },
        { num: '02', title: 'AI Analysis', description: 'Our platform processes millions of data points, using advanced models to detect patterns and anomalies.' },
        { num: '03', title: 'Take Action', description: 'Receive actionable insights and automated trigger commands for irrigation and fertilization.' }
    ],
    solutions: [
        { id: 'farmers', label: 'Farmers', text: 'Empower your daily operations with real-time insights.', bullets: ['Increase crop yield by up to 25%', 'Reduce water consumption', 'Predict disease outbreaks'], img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80' },
        { id: 'coops', label: 'Co-Ops', text: 'Manage multiple member farms from a unified oversight board.', bullets: ['Aggregate yield forecasting', 'Resource sharing optimization', 'Member performance tracking'], img: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80' },
        { id: 'agri-biz', label: 'Agri-Business', text: 'Scale your enterprise with enterprise-grade data pipelines.', bullets: ['Supply chain integration', 'Sustainability reporting', 'Automated compliance'], img: 'https://images.unsplash.com/photo-1592982537447-6f2aa6c08fe2?auto=format&fit=crop&w=800&q=80' }
    ],
    testimonials: [
        { name: 'Ahmad Razali', role: 'Farm Manager, EcoYield', text: 'Rultiva has completely transformed how we manage our orchards. The real-time data helps us make faster, better decisions every single day.', avatar: 'https://i.pravatar.cc/150?img=11' },
        { name: 'Dr. Siti Aminah', role: 'Agricultural Researcher', text: 'The AI-powered insights are incredibly accurate. We\'ve seen a 30% improvement in yield prediction since using the platform.', avatar: 'https://i.pravatar.cc/150?img=5' },
        { name: 'Mohd Faizal', role: 'Director, GreenFarm', text: 'Setting up the sensors was straightforward, and the dashboard is beautiful and intuitive. The best premium platform for modern agriculture.', avatar: 'https://i.pravatar.cc/150?img=8' }
    ],
    pricing: [
        { plan: 'Starter', price: '$49', period: '/mo', description: 'Perfect for small independent farms starting their tech journey.', features: ['Up to 5 sensor nodes', 'Daily AI insights', 'Basic email support', '7-day data retention'], btnText: 'Start Free Trial', isPro: false },
        { plan: 'Professional', price: '$129', period: '/mo', description: 'Advanced tools for commercial farms focused on yield optimization.', features: ['Up to 25 sensor nodes', 'Real-time AI recommendations', 'Priority 24/7 support', 'Unlimited data retention', 'Multi-user access'], btnText: 'Get Started', isPro: true },
        { plan: 'Enterprise', price: 'Custom', period: '', description: 'Custom-built solutions for massive co-ops and agri-businesses.', features: ['Unlimited sensor nodes', 'Custom AI model training', 'Dedicated account manager', 'API access & integrations', 'White-labeling options'], btnText: 'Contact Sales', isPro: false }
    ],
    faq: [
        { q: 'What sensors are compatible with Rultiva?', a: 'Rultiva is hardware-agnostic and integrates with most standard commercial IoT sensors via MQTT, HTTP, and LoRaWAN protocols.' },
        { q: 'How long does setup take?', a: 'Hardware installation depends on your farm size, but connecting your devices to our dashboard takes less than 5 minutes per node.' },
        { q: 'Can I access the dashboard on mobile?', a: 'Yes! Our platform is perfectly responsive, meaning you get the full premium experience on your smartphone or tablet.' },
        { q: 'Is my farm data secure?', a: 'Absolutely. We use banking-grade 256-bit encryption for all data transmission and storage. Your data belongs entirely to you.' }
    ],
    finalCta: {
        title: 'Ready to modernize your farm?',
        subtitle: 'Join thousands of farmers tracking real-time insights to maximize their yields and build a sustainable future.',
        btnText: 'Sign Up Free',
        disclaimer: 'No credit card required. 14-day free trial on Pro plans.'
    },
    team: {
        supervisor: {
            name: 'Ir. Safira Firdaus',
            role: 'Project Supervisor',
            imageUrl: 'https://avatar.iran.liara.run/public/job/teacher/male',
            responsibilities: ['Oversee project direction', 'Provide technical guidance', 'Ensure academic alignment']
        },
        students: [
            { name: 'M. Riandy Pratama', role: 'Team Leader', studentId: 'NIM: 2021001', imageUrl: 'https://avatar.iran.liara.run/public/girl', responsibilities: ['Frontend Dev', 'UI/UX Design'], email: 'ndyy@example.com', linkedin: '#', instagram: '#' },
            { name: 'Satrio Adji Purwo', role: 'Backend Dev', studentId: 'NIM: 2021002', imageUrl: 'https://avatar.iran.liara.run/public/boy', responsibilities: ['APIs', 'Database'], email: 'jii@example.com', linkedin: '#', instagram: '#' },
            { name: 'A. Maulvin Nazir Z.', role: 'IoT Hardare', studentId: 'NIM: 2021003', imageUrl: 'https://avatar.iran.liara.run/public/boy', responsibilities: ['Sensors', 'Serial Comm'], email: 'jonathan@example.com', linkedin: '#', instagram: '#' },
            { name: 'Yus Putri Arum S.', role: 'Data Analyst', studentId: 'NIM: 2021004', imageUrl: 'https://avatar.iran.liara.run/public/girl', responsibilities: ['Predictive Models', 'Reports'], email: 'yuuuss@example.com', linkedin: '#', instagram: '#' },
        ]
    }
};

const ICON_MAP = { Leaf, Activity, BarChart3, Zap, Shield, Globe, Cpu, Monitor, Sprout, PlayCircle, Star, Target, CheckCircle };
const resolveIcon = (name) => ICON_MAP[name] || Leaf;

// ==============================================================================
// 2. MAIN COMPONENT
// ==============================================================================
const Landing = () => {
    const [content, setContent] = useState(DEFAULT_CONTENT);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSolutionTab, setActiveSolutionTab] = useState(0);
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                if (getApps().length === 0) return;
                const db = getFirestore();
                const snap = await getDoc(doc(db, 'siteConfig', 'landingPage'));
                if (snap.exists()) setContent((prev) => ({ ...prev, ...snap.data() }));
            } catch (e) {
                console.warn('Failed to load landing content:', e.message);
            }
        };
        fetchContent();

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const { hero, metrics, featuresIntro, features, howItWorks, solutions, testimonials, pricing, faq, finalCta, team } = content || DEFAULT_CONTENT;

    // Fallbacks just in case the db document overwrites objects/strings
    const safeHero = hero || DEFAULT_CONTENT.hero;
    const safeFeaturesIntro = featuresIntro || DEFAULT_CONTENT.featuresIntro;
    const safeFinalCta = finalCta || DEFAULT_CONTENT.finalCta;

    return (
        <div className="min-h-screen bg-[#F6F5F0] text-[#1D1C1A] font-sans selection:bg-[#A9E8C8] selection:text-[#1D1C1A] overflow-x-hidden">

            {/* --- 1. Top Navigation --- */}
            <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#F6F5F0]/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-[1440px] mx-auto px-6 lg:px-20 2xl:px-24 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#3FAE49] text-white shadow-md group-hover:bg-[#359740] transition-colors">
                            <Leaf size={18} />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-[#1D1C1A]">Rultiva.</span>
                    </Link>

                    {/* Desktop Menu */}
                    <ul className="hidden lg:flex items-center gap-8 font-medium text-sm text-[#1D1C1A]/70">
                        <li><a href="#features" className="hover:text-[#3FAE49] transition-colors">Features</a></li>
                        <li><a href="#how-it-works" className="hover:text-[#3FAE49] transition-colors">How it works</a></li>
                        <li><a href="#solutions" className="hover:text-[#3FAE49] transition-colors">Solutions</a></li>
                        <li><a href="#pricing" className="hover:text-[#3FAE49] transition-colors">Pricing</a></li>
                    </ul>

                    {/* Desktop Actions */}
                    <div className="hidden lg:flex items-center gap-5">
                        <Link to="/login" className="font-semibold text-sm text-[#1D1C1A] py-2 px-4 hover:bg-[#1D1C1A]/5 rounded-full transition-colors">
                            Sign In
                        </Link>
                        <Link to="/register" className="font-bold text-sm px-6 py-3 rounded-full bg-[#3FAE49] text-white shadow-lg shadow-[#3FAE49]/20 hover:bg-[#359740] hover:-translate-y-0.5 transition-all outline-none focus:ring-4 focus:ring-[#A9E8C8]">
                            Join the Beta
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button className="lg:hidden text-[#1D1C1A] p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* --- 2. Hero Section --- */}
            <section className="relative pt-[160px] pb-16 lg:pt-[200px] lg:pb-24 px-6 lg:px-20 2xl:px-24 max-w-[1440px] mx-auto overflow-hidden">
                <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-center">
                    {/* Left Column */}
                    <div className="max-w-xl relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A9E8C8]/30 border border-[#A9E8C8] text-[#3FAE49] text-xs font-bold mb-8 uppercase tracking-wider animate-fade-in-up">
                            <Star size={12} className="fill-current" />
                            {safeHero.badge || 'Precision Agriculture Platform'}
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-[72px] lg:leading-[1.05] font-extrabold text-[#1D1C1A] tracking-[-0.02em] mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            {safeHero.titleLine1 || 'Bring Fresh Growth'} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3FAE49] to-emerald-400">
                                {safeHero.titleHighlight || 'To Agriculture.'}
                            </span>
                        </h1>

                        <p className="text-lg lg:text-xl text-[#1D1C1A]/70 mb-10 leading-relaxed font-normal animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            {safeHero.subtitle || DEFAULT_CONTENT.hero.subtitle}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-[#1D1C1A] text-white px-8 py-4 rounded-full font-bold shadow-xl hover:bg-black hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 text-base">
                                {safeHero.ctaPrimary || 'Get Started'} <ArrowRight size={18} />
                            </Link>
                            <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 bg-transparent text-[#1D1C1A] px-8 py-4 rounded-full font-bold border-2 border-[#1D1C1A]/10 hover:border-[#1D1C1A]/20 hover:bg-[#1D1C1A]/5 transition-all text-base">
                                <PlayCircle size={20} className="text-[#1D1C1A]" /> {safeHero.ctaSecondary || 'Watch Demo'}
                            </a>
                        </div>

                        <div className="mt-12 flex items-center gap-4 text-sm font-medium text-[#1D1C1A]/60 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#F6F5F0] overflow-hidden bg-gray-200 z-${50 - i * 10}`}>
                                        <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="avatar" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <p>Trusted by <span className="text-[#1D1C1A] font-bold">5,000+</span> Modern Farms.</p>
                        </div>
                    </div>

                    {/* Right Column / Hero Visual */}
                    <div className="relative animate-fade-in h-[500px] lg:h-[650px] w-full rounded-[32px] overflow-hidden shadow-2xl isolate" style={{ animationDelay: '500ms' }}>
                        <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop" alt="Precision Farm" className="absolute inset-0 w-full h-full object-cover -z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent -z-10" />

                        {/* Floating Micro UI Cards */}
                        <div className="absolute top-10 right-8 bg-[#F6F5F0] p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce-slow border border-white/40 backdrop-blur-sm">
                            <div className="w-12 h-12 rounded-full bg-[#E5F5EC] flex items-center justify-center text-[#3FAE49]">
                                <Droplets size={24} />
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-[#1D1C1A]/60 uppercase tracking-wider">Soil Moisture</div>
                                <div className="text-lg font-extrabold text-[#1D1C1A]">68% <span className="text-xs font-bold text-[#3FAE49] ml-1">Optimal</span></div>
                            </div>
                        </div>

                        <div className="absolute bottom-10 left-8 bg-[#F6F5F0]/90 p-5 rounded-[24px] shadow-2xl backdrop-blur-md border border-white/50 w-64 animate-bounce-slow" style={{ animationDelay: '2s' }}>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-[#1D1C1A]/60">NPK TREND</span>
                                <BarChart3 className="text-[#1A73E8] w-4 h-4" />
                            </div>
                            <div className="h-16 flex items-end justify-between gap-1">
                                {[30, 45, 25, 60, 80, 50, 90].map((h, i) => (
                                    <div key={i} className="w-full bg-[#1A73E8]/20 rounded-t-sm" style={{ height: `${h}%` }}>
                                        {i === 6 && <div className="w-full h-full bg-[#1A73E8] rounded-t-sm" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="absolute top-1/2 left-8 bg-[#3FAE49] text-white p-3 rounded-full shadow-lg animate-pulse">
                            <CheckCircle size={24} />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 3. Quick Metrics Strip --- */}
            <section className="bg-white border-y border-[#1D1C1A]/5 py-10 my-10 relative z-20">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-20 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-[#1D1C1A]/5">
                    {Array.isArray(metrics) && metrics.map((m, i) => (
                        <div key={i} className={`flex flex-col items-center justify-center text-center ${i === 0 ? 'border-l-0' : ''}`}>
                            <div className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1D1C1A] tracking-tight mb-2">{m.value}</div>
                            <div className="text-sm font-semibold text-[#1D1C1A]/60 uppercase tracking-wider">{m.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- 4. Features Section --- */}
            <section id="features" className="py-24 max-w-[1440px] mx-auto px-6 lg:px-20">
                <div className="grid lg:grid-cols-2 gap-12 items-end mb-16">
                    <div>
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1D1C1A] tracking-tight leading-tight mb-6">
                            {safeFeaturesIntro.title}
                        </h2>
                    </div>
                    <div>
                        <p className="text-lg text-[#1D1C1A]/70 leading-relaxed font-medium">
                            {safeFeaturesIntro.subtitle}
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.isArray(features) && features.map((feat, i) => {
                        const Icon = resolveIcon(feat.icon);
                        return (
                            <div key={i} className="group bg-white rounded-[24px] p-2 border border-[#1D1C1A]/5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.06)] transition-all duration-300">
                                <div className="h-48 rounded-[16px] overflow-hidden mb-6 relative bg-gray-100">
                                    <img src={feat.img} alt={feat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                    <div className="absolute top-4 left-4 w-12 h-12 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-[#3FAE49] shadow-sm">
                                        <Icon size={24} />
                                    </div>
                                </div>
                                <div className="px-6 pb-6">
                                    <h3 className="text-xl font-bold text-[#1D1C1A] mb-3">{feat.title}</h3>
                                    <p className="text-[#1D1C1A]/60 leading-relaxed text-sm">
                                        {feat.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* --- 5. Stepper: How It Works --- */}
            <section id="how-it-works" className="py-24 bg-[#EAF7EE]/50 border-y border-[#3FAE49]/10">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1D1C1A] tracking-tight mb-4">How It Works</h2>
                        <p className="text-lg text-[#1D1C1A]/70 max-w-2xl mx-auto">Three simple steps to transform your farm into a data-driven powerhouse.</p>
                    </div>

                    <div className="grid lg:grid-cols-[1fr_1.5fr] gap-16 items-center">
                        <div className="space-y-8">
                            {Array.isArray(howItWorks) && howItWorks.map((step, i) => (
                                <div key={i} className="flex gap-6 group">
                                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-xl font-black text-[#3FAE49] group-hover:bg-[#3FAE49] group-hover:text-white transition-colors duration-300">
                                        {step.num}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#1D1C1A] mb-2">{step.title}</h3>
                                        <p className="text-[#1D1C1A]/70 leading-relaxed">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white p-4 lg:p-6 rounded-[32px] shadow-2xl border border-gray-100 transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
                            <img src="https://images.unsplash.com/photo-1590682680695-43b964a3ae17?q=80&w=2000&auto=format&fit=crop" alt="Dashboard Illustration" className="w-full h-auto rounded-[20px]" />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 6. Solutions Tabs --- */}
            <section id="solutions" className="py-24 max-w-[1440px] mx-auto px-6 lg:px-20">
                <div className="text-center mb-12">
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1D1C1A] tracking-tight mb-4">Built for Everyone</h2>
                    <p className="text-lg text-[#1D1C1A]/70 max-w-2xl mx-auto">Tailored precision environments depending on the scale and scope of your agricultural goals.</p>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-6 justify-start lg:justify-center no-scrollbar">
                    {Array.isArray(solutions) && solutions.map((s, i) => (
                        <button
                            key={s.id || i}
                            onClick={() => setActiveSolutionTab(i)}
                            className={`px-8 py-3 rounded-full whitespace-nowrap font-bold text-sm transition-all outline-none focus:ring-4 focus:ring-[#A9E8C8] ${activeSolutionTab === i ? 'bg-[#3FAE49] text-white shadow-lg shadow-[#3FAE49]/20 translate-y-[-2px]' : 'bg-white text-[#1D1C1A]/60 hover:bg-gray-50 border border-gray-200 hover:text-[#1D1C1A]'}`}>
                            {s.label}
                        </button>
                    ))}
                </div>

                {Array.isArray(solutions) && solutions.map((s, i) => (
                    <div key={s.id || i} className={`${activeSolutionTab === i ? 'block' : 'hidden'} animate-fade-in`}>
                        <div className="bg-white rounded-[32px] p-8 lg:p-12 border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.03)] grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h3 className="text-3xl font-extrabold text-[#1D1C1A] mb-4">{s.label} Overview</h3>
                                <p className="text-lg text-[#1D1C1A]/70 mb-8">{s.text}</p>
                                <ul className="space-y-4">
                                    {Array.isArray(s.bullets) && s.bullets.map((b, _bi) => (
                                        <li key={_bi} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-[#E5F5EC] text-[#3FAE49] flex items-center justify-center flex-shrink-0">
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                            <span className="font-semibold text-[#1D1C1A]">{b}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button className="mt-10 font-bold text-[#3FAE49] flex items-center gap-2 hover:gap-3 transition-all">Explore {s.label} Solutions <ArrowRight size={18} /></button>
                            </div>
                            <div className="h-64 lg:h-[400px] rounded-[24px] overflow-hidden">
                                <img src={s.img} alt={s.label} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {/* --- 7. Product Showcase / View --- */}
            <section className="py-24 bg-[#1D1C1A] text-white relative overflow-hidden">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-20 text-center relative z-10">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-[#A9E8C8] text-xs font-bold mb-6 uppercase tracking-widest border border-white/20">The Command Center</div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-16">Monitor everything.<br />From anywhere.</h2>

                    <div className="relative rounded-[24px] lg:rounded-[40px] bg-[#3FAE49]/10 p-4 lg:p-8 backdrop-blur-xl border border-[#3FAE49]/20 mx-auto max-w-5xl shadow-2xl">
                        <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" alt="Dashboard" className="rounded-[16px] lg:rounded-[24px] w-full shadow-2xl border border-white/10" />

                        {/* Callouts */}
                        <div className="hidden md:flex absolute -top-8 -right-8 bg-white p-5 rounded-2xl shadow-2xl items-center gap-4 animate-bounce-slow text-[#1D1C1A]">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600"><Thermometer size={24} /></div>
                            <div className="text-left"><div className="text-xs uppercase tracking-wider font-bold text-gray-500">Alert Detected</div><div className="text-lg font-black text-red-600">High Temp. Zone B</div></div>
                        </div>

                        <div className="hidden md:flex absolute -bottom-8 -left-8 bg-white p-4 rounded-xl shadow-2xl items-center gap-3 animate-bounce-slow text-[#1D1C1A]" style={{ animationDelay: '1s' }}>
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><Wind size={20} /></div>
                            <div className="text-left"><div className="text-xs uppercase tracking-wider font-bold text-gray-500">Weather API</div><div className="text-md font-black">Sync Complete</div></div>
                        </div>
                    </div>
                </div>
                {/* Background Blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#3FAE49]/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#1A73E8]/20 rounded-full blur-[120px]" />
                </div>
            </section>

            {/* --- 8. Testimonials Section --- */}
            <section className="py-24 max-w-[1440px] mx-auto px-6 lg:px-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1D1C1A] tracking-tight mb-4">Trusted Worldwide</h2>
                    <p className="text-lg text-[#1D1C1A]/70">Hear from the farmers rewriting their legacy with Rultiva.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {Array.isArray(testimonials) && testimonials.map((t, i) => (
                        <div key={i} className="bg-white p-8 lg:p-10 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className="flex gap-1 text-[#F2C94C] mb-8">
                                {[1, 2, 3, 4, 5].map(v => <Star key={v} size={20} className="fill-current" />)}
                            </div>
                            <p className="text-[#1D1C1A]/80 font-medium mb-10 text-lg leading-relaxed h-32">"{t.text}"</p>
                            <div className="flex items-center gap-4">
                                <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-full bg-gray-100 object-cover" />
                                <div>
                                    <h4 className="font-bold text-[#1D1C1A] text-lg">{t.name}</h4>
                                    <p className="text-sm font-semibold text-[#1D1C1A]/50">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- 4.5 Team (Merged dynamically inside redesign) --- */}
            <section id="team" className="py-24 bg-white border-y border-gray-100">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-20 text-center">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#E5F5EC] text-[#3FAE49] text-xs font-bold mb-6 uppercase tracking-wider">Credits</div>
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1D1C1A] tracking-tight mb-16">The Minds Behind Rultiva</h2>

                    {/* Supervisor */}
                    {team && team.supervisor && (
                        <div className="max-w-xl mx-auto mb-16 relative">
                            <div className="bg-[#F6F5F0] rounded-[32px] p-8 border border-white shadow-xl hover:-translate-y-1 transition-transform group">
                                <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-[#3FAE49] text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-md">Supervisor</div>
                                <div className="w-28 h-28 rounded-full bg-white mx-auto mb-6 p-1 border-2 border-[#A9E8C8]">
                                    <img src={team.supervisor.imageUrl} alt={team.supervisor.name} className="w-full h-full rounded-full object-cover" />
                                </div>
                                <h3 className="text-2xl font-extrabold text-[#1D1C1A] mb-2">{team.supervisor.name}</h3>
                                <p className="text-[#3FAE49] font-bold mb-6">{team.supervisor.role}</p>
                                <ul className="text-sm text-[#1D1C1A]/70 text-left space-y-3 px-8">
                                    {Array.isArray(team.supervisor.responsibilities) && team.supervisor.responsibilities.map((r, ri) => (
                                        <li key={ri} className="flex gap-3 items-start"><Check className="text-[#3FAE49] w-5 h-5 flex-shrink-0" /> <span>{r}</span></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Students */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.isArray(team?.students) && team.students.map((s, si) => (
                            <div key={si} className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center">
                                <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-gray-50 overflow-hidden">
                                    <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover" />
                                </div>
                                <h4 className="font-bold text-lg text-[#1D1C1A] leading-tight mb-1">{s.name}</h4>
                                <p className="text-xs font-bold text-[#3FAE49] bg-[#E5F5EC] inline-block px-2 py-1 rounded-md mb-2">{s.role}</p>
                                <p className="text-xs text-[#1D1C1A]/40 font-semibold mb-6">{s.studentId}</p>
                                <div className="flex justify-center gap-3 pt-6 border-t border-gray-100">
                                    <a href={`mailto:${s.email}`} className="text-gray-400 hover:text-[#3FAE49]"><Mail size={18} /></a>
                                    <a href={s.linkedin} className="text-gray-400 hover:text-[#3FAE49]"><Linkedin size={18} /></a>
                                    <a href={s.instagram} className="text-gray-400 hover:text-[#3FAE49]"><Instagram size={18} /></a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 9. Pricing Section --- */}
            <section id="pricing" className="py-24 max-w-[1440px] mx-auto px-6 lg:px-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1D1C1A] tracking-tight mb-4">Simple, Transparent Pricing</h2>
                    <p className="text-lg text-[#1D1C1A]/70">Choose the plan that best fits your farming magnitude.</p>
                </div>
                <div className="grid lg:grid-cols-3 gap-8 items-center">
                    {Array.isArray(pricing) && pricing.map((p, i) => (
                        <div key={i} className={`bg-white rounded-[32px] p-8 lg:p-10 border shadow-sm transition-all hover:shadow-2xl ${p.isPro ? 'border-[#3FAE49] shadow-xl lg:scale-105 relative' : 'border-gray-100'}`}>
                            {p.isPro && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#3FAE49] text-white px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase">Most Popular</div>}
                            <h3 className="text-xl font-bold text-[#1D1C1A] mb-4">{p.plan}</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-5xl font-extrabold text-[#1D1C1A]">{p.price}</span>
                                <span className="text-lg font-bold text-[#1D1C1A]/50">{p.period}</span>
                            </div>
                            <p className="text-sm text-[#1D1C1A]/60 mb-8 h-10">{p.description}</p>
                            <button className={`w-full py-4 rounded-full font-bold text-sm mb-8 transition-colors ${p.isPro ? 'bg-[#3FAE49] text-white hover:bg-[#359740]' : 'bg-[#F6F5F0] text-[#1D1C1A] hover:bg-gray-200'}`}>
                                {p.btnText}
                            </button>
                            <ul className="space-y-4">
                                {Array.isArray(p.features) && p.features.map((f, fi) => (
                                    <li key={fi} className="flex items-center gap-3 text-sm font-medium text-[#1D1C1A]/80">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${p.isPro ? 'bg-[#3FAE49]/20 text-[#3FAE49]' : 'bg-gray-100 text-gray-500'}`}>
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- 10. FAQ Accordion --- */}
            <section className="py-24 bg-[#FDFDFD] border-t border-gray-100">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-extrabold text-[#1D1C1A] tracking-tight mb-4">Frequently Asked Questions</h2>
                    </div>
                    <div className="space-y-4">
                        {Array.isArray(faq) && faq.map((f, i) => (
                            <div key={i} className="bg-white border border-gray-100 rounded-[20px] overflow-hidden transition-all duration-300">
                                <button onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)} className="w-full flex items-center justify-between p-6 text-left outline-none">
                                    <span className="font-bold text-lg text-[#1D1C1A] pr-4">{f.q}</span>
                                    <ChevronDown className={`flex-shrink-0 text-gray-400 transition-transform duration-300 ${openFaqIndex === i ? 'rotate-180 text-[#3FAE49]' : ''}`} />
                                </button>
                                <div className={`px-6 pb-6 text-[#1D1C1A]/70 leading-relaxed ${openFaqIndex === i ? 'block' : 'hidden'}`}>
                                    {f.a}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 11. Final Big CTA --- */}
            <section className="py-24 px-6 lg:px-20 max-w-[1440px] mx-auto">
                <div className="bg-gradient-to-br from-[#A9E8C8] to-[#3FAE49] rounded-[48px] p-12 lg:p-24 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-4xl lg:text-6xl font-extrabold text-[#1D1C1A] tracking-tight mb-6">{safeFinalCta.title}</h2>
                        <p className="text-xl text-[#1D1C1A]/80 font-medium mb-12">{safeFinalCta.subtitle}</p>
                        <Link to="/register" className="inline-flex items-center gap-2 bg-[#1D1C1A] text-white px-10 py-5 rounded-full font-extrabold text-lg shadow-xl hover:scale-105 hover:shadow-2xl transition-all">
                            {safeFinalCta.btnText} <ArrowRight size={20} />
                        </Link>
                        <p className="mt-6 text-sm font-semibold text-[#1D1C1A]/60">{safeFinalCta.disclaimer}</p>
                    </div>
                </div>
            </section>

            {/* --- 12. Footer --- */}
            <footer className="bg-white pt-20 pb-10 border-t border-gray-100">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
                        <div className="col-span-2 lg:col-span-2">
                            <Link to="/" className="flex items-center gap-2 mb-6">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#3FAE49] text-white">
                                    <Leaf size={18} />
                                </div>
                                <span className="font-bold text-xl text-[#1D1C1A]">Rultiva.</span>
                            </Link>
                            <p className="text-[#1D1C1A]/60 max-w-xs mb-8">{content?.footer?.description || "Empowering the future of agriculture with smart sensing and AI metrics."}</p>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#3FAE49] hover:bg-[#E5F5EC] transition-colors"><Linkedin size={18} /></a>
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#3FAE49] hover:bg-[#E5F5EC] transition-colors"><Instagram size={18} /></a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-extrabold text-[#1D1C1A] mb-6 tracking-wide uppercase text-xs">Product</h4>
                            <ul className="space-y-4 text-sm text-[#1D1C1A]/70 font-medium">
                                <li><a href="#features" className="hover:text-[#3FAE49]">Features</a></li>
                                <li><a href="#solutions" className="hover:text-[#3FAE49]">Solutions</a></li>
                                <li><a href="#pricing" className="hover:text-[#3FAE49]">Pricing</a></li>
                                <li><a href="#team" className="hover:text-[#3FAE49]">Our Team</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-extrabold text-[#1D1C1A] mb-6 tracking-wide uppercase text-xs">Resources</h4>
                            <ul className="space-y-4 text-sm text-[#1D1C1A]/70 font-medium">
                                <li><a href="#" className="hover:text-[#3FAE49]">Documentation</a></li>
                                <li><a href="#" className="hover:text-[#3FAE49]">API Reference</a></li>
                                <li><a href="#" className="hover:text-[#3FAE49]">Blog</a></li>
                                <li><a href="#" className="hover:text-[#3FAE49]">Help Center</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-extrabold text-[#1D1C1A] mb-6 tracking-wide uppercase text-xs">Legal</h4>
                            <ul className="space-y-4 text-sm text-[#1D1C1A]/70 font-medium">
                                <li><a href="#" className="hover:text-[#3FAE49]">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-[#3FAE49]">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-[#3FAE49]">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-[#1D1C1A]/40">© {new Date().getFullYear()} Rultiva Agriculture. All rights reserved.</p>
                        <p className="text-sm font-semibold text-[#1D1C1A]/40">Made with ❤️ for Better Farming</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
