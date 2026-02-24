import React, { useState, useEffect, useCallback } from 'react';
import {
    Save, RotateCcw, Plus, Trash2, ChevronDown, ChevronRight,
    Leaf, Eye, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// ── Default content (keep in sync with Landing.jsx) ─────────────────────
const DEFAULT_CONTENT = {
    hero: {
        badge: 'Precision Agriculture Platform',
        titleLine1: 'Smart Farming,',
        titleHighlight: 'Real-Time Insights',
        subtitle:
            'Monitor your orchards with live sensor data, predictive analytics, and AI-powered recommendations — all in one unified dashboard.',
        ctaPrimary: 'Get Started',
        ctaSecondary: 'Learn More',
    },
    partners: ['Partner 1', 'Partner 2', 'Partner 3', 'Partner 4', 'Partner 5'],
    features: [
        { icon: 'Activity', title: 'Real-Time Monitoring', description: 'Live sensor data from soil, weather and NPK sensors streamed directly to your dashboard.', color: 'green' },
        { icon: 'BarChart3', title: 'AI-Powered Suggestions', description: "Smart farming recommendations generated based on your orchard's current conditions.", color: 'blue' },
        { icon: 'Globe', title: 'Multi-Site Management', description: 'Switch between Nipis and Kasturi orchards from a single unified dashboard.', color: 'purple' },
        { icon: 'Zap', title: 'Instant Alerts', description: 'Get notified immediately when sensor readings cross critical thresholds.', color: 'amber' },
        { icon: 'Shield', title: 'Secure Access', description: 'Role-based access control keeps your farm data private and protected.', color: 'red' },
        { icon: 'Leaf', title: 'Yield Prediction', description: 'Regression-based yield & revenue forecasting from your latest soil parameters.', color: 'teal' },
    ],
    featuresHeader: {
        label: 'Features',
        title: 'Everything you need to run a smart farm',
        subtitle: 'Built for precision agriculture with industrial-grade sensor integration.',
    },
    howItWorks: {
        label: 'How It Works',
        title: 'Three simple steps to smarter farming',
        subtitle: 'Get up and running in minutes with our easy-to-use platform.',
        steps: [
            { number: '1', title: 'Connect Sensors', description: 'Install IoT sensors in your orchard and connect them to the AIST platform.' },
            { number: '2', title: 'Monitor Data', description: 'Watch real-time data flow into your personalized dashboard from anywhere.' },
            { number: '3', title: 'Get Insights', description: 'Receive AI-powered recommendations and predictions to optimize your yield.' },
        ],
    },
    stats: [
        { value: '2', label: 'Orchards Monitored' },
        { value: '50K+', label: 'Data Points Collected' },
        { value: '99.9%', label: 'Uptime Reliability' },
        { value: '24/7', label: 'Live Monitoring' },
    ],
    testimonials: [
        { name: 'Ahmad Razali', role: 'Farm Manager', text: 'AIST has completely transformed how we manage our orchards.', initials: 'AR' },
        { name: 'Dr. Siti Aminah', role: 'Agricultural Researcher', text: "The AI-powered insights are incredibly accurate.", initials: 'SA' },
        { name: 'Mohd Faizal', role: 'IoT Specialist', text: 'Setting up the sensors was straightforward, and the dashboard is intuitive.', initials: 'MF' },
    ],
    cta: {
        title: 'Ready to monitor your orchard?',
        subtitle: 'Sign in to access your precision agriculture dashboard and start making data-driven decisions today.',
        button: 'Sign In to Dashboard',
    },
    footer: {
        description: 'Precision agriculture platform for modern farming. Monitor, analyze, and optimize your orchards with real-time data.',
        copyright: 'AIST Precision Agriculture Platform',
    },
};

const ICON_OPTIONS = ['Leaf', 'Activity', 'BarChart3', 'Zap', 'Shield', 'Globe', 'Cpu', 'Monitor', 'Sprout'];
const COLOR_OPTIONS = ['green', 'blue', 'purple', 'amber', 'red', 'teal'];

// ── Styles ──────────────────────────────────────────────────────────────
const S = {
    page: {
        padding: 24,
        maxWidth: 960,
        margin: '0 auto',
        fontFamily: "'DM Sans', 'Poppins', sans-serif",
    },
    header: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 32, flexWrap: 'wrap', gap: 12,
    },
    title: { fontSize: 24, fontWeight: 800, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 10 },
    subtitle: { fontSize: 14, color: '#71718a', marginTop: 4 },
    actions: { display: 'flex', gap: 10, flexWrap: 'wrap' },
    btn: (bg, color) => ({
        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
        background: bg, color, border: 'none', borderRadius: 12, cursor: 'pointer',
        fontWeight: 600, fontSize: 14, fontFamily: 'inherit', transition: 'all .2s',
        boxShadow: bg === '#1B5E20' ? '0 4px 12px rgba(27,94,32,.25)' : 'none',
    }),
    section: (open) => ({
        background: '#fff', border: '1px solid #e5e5e5', borderRadius: 16,
        marginBottom: 16, overflow: 'hidden',
        boxShadow: open ? '0 4px 16px rgba(0,0,0,.05)' : 'none',
        transition: 'box-shadow .3s',
    }),
    sectionHead: {
        padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', userSelect: 'none', background: '#fafafa',
    },
    sectionTitle: { fontSize: 16, fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 8 },
    sectionBody: { padding: '0 20px 20px' },
    field: { marginBottom: 16 },
    label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 },
    input: {
        width: '100%', padding: '10px 14px', border: '1.5px solid #ddd', borderRadius: 10,
        fontSize: 14, fontFamily: 'inherit', color: '#333', transition: 'border-color .2s',
        outline: 'none', background: '#fafafa',
    },
    textarea: {
        width: '100%', padding: '10px 14px', border: '1.5px solid #ddd', borderRadius: 10,
        fontSize: 14, fontFamily: 'inherit', color: '#333', minHeight: 80, resize: 'vertical',
        outline: 'none', background: '#fafafa',
    },
    select: {
        padding: '8px 12px', border: '1.5px solid #ddd', borderRadius: 8,
        fontSize: 13, fontFamily: 'inherit', color: '#333', background: '#fafafa', cursor: 'pointer',
    },
    card: {
        background: '#f9fafb', border: '1px solid #e8e8e8', borderRadius: 12,
        padding: 16, marginBottom: 12, position: 'relative',
    },
    cardRow: { display: 'flex', gap: 12, flexWrap: 'wrap' },
    removeBtn: {
        position: 'absolute', top: 10, right: 10, background: '#fee2e2', border: 'none',
        borderRadius: 8, padding: 6, cursor: 'pointer', color: '#dc2626', display: 'flex',
    },
    addBtn: {
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
        background: '#f0fdf4', border: '1.5px dashed #4caf50', borderRadius: 10,
        color: '#2e7d32', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
    },
    toast: (type) => ({
        position: 'fixed', bottom: 24, right: 24, padding: '14px 24px',
        background: type === 'success' ? '#1B5E20' : '#c62828',
        color: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10,
        fontWeight: 600, fontSize: 14, boxShadow: '0 8px 24px rgba(0,0,0,.15)', zIndex: 9999,
        fontFamily: "'DM Sans', sans-serif",
    }),
    inline: (w = '100%') => ({ flex: `0 0 ${w}`, minWidth: 0 }),
};

// ══════════════════════════════════════════════════════════════════════════
// LandingEditor component
// ══════════════════════════════════════════════════════════════════════════
const LandingEditor = () => {
    const { db, role } = useAuth();
    const [content, setContent] = useState(structuredClone(DEFAULT_CONTENT));
    const [openSections, setOpenSections] = useState({ hero: true });
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Load saved content from Firestore
    useEffect(() => {
        if (!db) return;
        const load = async () => {
            try {
                const snap = await getDoc(doc(db, 'siteConfig', 'landingPage'));
                if (snap.exists()) {
                    setContent(prev => ({ ...structuredClone(DEFAULT_CONTENT), ...snap.data() }));
                }
            } catch (e) {
                console.warn('Failed to load landing content:', e.message);
            }
        };
        load();
    }, [db]);

    // Toast helper
    const showToast = useCallback((type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // Guard: superadmin only
    if (role !== 'superadmin') {
        return (
            <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
                <AlertCircle size={48} style={{ marginBottom: 12 }} />
                <h3>Access Denied</h3>
                <p>Only superadmin users can edit the landing page.</p>
            </div>
        );
    }

    // ── Helpers ──────────────────────────────────────────────────────────
    const toggle = (key) => setOpenSections((o) => ({ ...o, [key]: !o[key] }));

    const update = (path, value) => {
        setContent((prev) => {
            const copy = structuredClone(prev);
            const keys = path.split('.');
            let cur = copy;
            for (let i = 0; i < keys.length - 1; i++) {
                const k = isNaN(keys[i]) ? keys[i] : Number(keys[i]);
                cur = cur[k];
            }
            cur[keys[keys.length - 1]] = value;
            return copy;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'siteConfig', 'landingPage'), content);
            showToast('success', 'Landing page saved successfully!');
        } catch (e) {
            showToast('error', 'Failed to save: ' + e.message);
        }
        setSaving(false);
    };

    const handleReset = async () => {
        if (!window.confirm('Reset all landing page content to defaults? This cannot be undone.')) return;
        setSaving(true);
        try {
            const defaults = structuredClone(DEFAULT_CONTENT);
            await setDoc(doc(db, 'siteConfig', 'landingPage'), defaults);
            setContent(defaults);
            showToast('success', 'Reset to defaults!');
        } catch (e) {
            showToast('error', 'Failed to reset: ' + e.message);
        }
        setSaving(false);
    };

    const addFeature = () => {
        update('features', [
            ...content.features,
            { icon: 'Leaf', title: 'New Feature', description: 'Description here', color: 'green' },
        ]);
    };

    const removeFeature = (i) => {
        const copy = [...content.features];
        copy.splice(i, 1);
        update('features', copy);
    };

    const addTestimonial = () => {
        update('testimonials', [
            ...content.testimonials,
            { name: 'Name', role: 'Role', text: 'Testimonial text', initials: 'N' },
        ]);
    };

    const removeTestimonial = (i) => {
        const copy = [...content.testimonials];
        copy.splice(i, 1);
        update('testimonials', copy);
    };

    const addStat = () => {
        update('stats', [...content.stats, { value: '0', label: 'Label' }]);
    };

    const removeStat = (i) => {
        const copy = [...content.stats];
        copy.splice(i, 1);
        update('stats', copy);
    };

    const addPartner = () => {
        update('partners', [...content.partners, 'New Partner']);
    };

    const removePartner = (i) => {
        const copy = [...content.partners];
        copy.splice(i, 1);
        update('partners', copy);
    };

    const addStep = () => {
        const steps = [...content.howItWorks.steps, { number: String(content.howItWorks.steps.length + 1), title: 'New Step', description: 'Description' }];
        update('howItWorks.steps', steps);
    };

    const removeStep = (i) => {
        const copy = [...content.howItWorks.steps];
        copy.splice(i, 1);
        update('howItWorks.steps', copy);
    };

    // ── Section renderer helper ─────────────────────────────────────────
    const Section = ({ id, title, icon: Icon, children }) => {
        const isOpen = openSections[id];
        return (
            <div style={S.section(isOpen)}>
                <div style={S.sectionHead} onClick={() => toggle(id)}>
                    <span style={S.sectionTitle}>
                        <Icon size={18} /> {title}
                    </span>
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
                {isOpen && <div style={S.sectionBody}>{children}</div>}
            </div>
        );
    };

    const Field = ({ label, value, onChange, textarea, ...props }) => (
        <div style={S.field}>
            <label style={S.label}>{label}</label>
            {textarea ? (
                <textarea style={S.textarea} value={value} onChange={(e) => onChange(e.target.value)} {...props} />
            ) : (
                <input style={S.input} value={value} onChange={(e) => onChange(e.target.value)} {...props} />
            )}
        </div>
    );

    // ── Render ──────────────────────────────────────────────────────────
    return (
        <div style={S.page}>
            {/* Header */}
            <div style={S.header}>
                <div>
                    <div style={S.title}>
                        <Leaf size={24} color="#2e7d32" /> Landing Page Editor
                    </div>
                    <p style={S.subtitle}>Edit the public-facing landing page content. Changes are saved to Firestore.</p>
                </div>
                <div style={S.actions}>
                    <a href="/" target="_blank" rel="noreferrer" style={{ ...S.btn('#f0f0f5', '#555'), textDecoration: 'none' }}>
                        <Eye size={16} /> Preview
                    </a>
                    <button style={S.btn('#fee2e2', '#c62828')} onClick={handleReset} disabled={saving}>
                        <RotateCcw size={16} /> Reset
                    </button>
                    <button style={S.btn('#1B5E20', '#fff')} onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* ── Hero Section ── */}
            <Section id="hero" title="Hero Section" icon={Leaf}>
                <Field label="Badge Text" value={content.hero.badge} onChange={(v) => update('hero.badge', v)} />
                <div style={S.cardRow}>
                    <div style={S.inline('60%')}>
                        <Field label="Title Line 1" value={content.hero.titleLine1} onChange={(v) => update('hero.titleLine1', v)} />
                    </div>
                    <div style={S.inline('38%')}>
                        <Field label="Highlighted Text" value={content.hero.titleHighlight} onChange={(v) => update('hero.titleHighlight', v)} />
                    </div>
                </div>
                <Field label="Subtitle" value={content.hero.subtitle} onChange={(v) => update('hero.subtitle', v)} textarea />
                <div style={S.cardRow}>
                    <div style={S.inline('48%')}>
                        <Field label="Primary CTA Text" value={content.hero.ctaPrimary} onChange={(v) => update('hero.ctaPrimary', v)} />
                    </div>
                    <div style={S.inline('48%')}>
                        <Field label="Secondary CTA Text" value={content.hero.ctaSecondary} onChange={(v) => update('hero.ctaSecondary', v)} />
                    </div>
                </div>
            </Section>

            {/* ── Partners ── */}
            <Section id="partners" title="Partners Bar" icon={Leaf}>
                {content.partners.map((p, i) => (
                    <div key={i} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input
                            style={{ ...S.input, flex: 1 }}
                            value={p}
                            onChange={(e) => {
                                const copy = [...content.partners];
                                copy[i] = e.target.value;
                                update('partners', copy);
                            }}
                        />
                        <button style={S.removeBtn} onClick={() => removePartner(i)}><Trash2 size={14} /></button>
                    </div>
                ))}
                <button style={S.addBtn} onClick={addPartner}><Plus size={14} /> Add Partner</button>
            </Section>

            {/* ── Features ── */}
            <Section id="features" title="Features" icon={Leaf}>
                <Field label="Section Label" value={content.featuresHeader.label} onChange={(v) => update('featuresHeader.label', v)} />
                <Field label="Section Title" value={content.featuresHeader.title} onChange={(v) => update('featuresHeader.title', v)} />
                <Field label="Section Subtitle" value={content.featuresHeader.subtitle} onChange={(v) => update('featuresHeader.subtitle', v)} textarea />

                <label style={{ ...S.label, marginTop: 16, marginBottom: 12 }}>Feature Cards</label>
                {content.features.map((f, i) => (
                    <div key={i} style={S.card}>
                        <button style={S.removeBtn} onClick={() => removeFeature(i)}><Trash2 size={14} /></button>
                        <div style={S.cardRow}>
                            <div style={S.inline('30%')}>
                                <Field label="Title" value={f.title} onChange={(v) => update(`features.${i}.title`, v)} />
                            </div>
                            <div style={S.inline('20%')}>
                                <div style={S.field}>
                                    <label style={S.label}>Icon</label>
                                    <select style={S.select} value={f.icon} onChange={(e) => update(`features.${i}.icon`, e.target.value)}>
                                        {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={S.inline('20%')}>
                                <div style={S.field}>
                                    <label style={S.label}>Color</label>
                                    <select style={S.select} value={f.color} onChange={(e) => update(`features.${i}.color`, e.target.value)}>
                                        {COLOR_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <Field label="Description" value={f.description} onChange={(v) => update(`features.${i}.description`, v)} textarea />
                    </div>
                ))}
                <button style={S.addBtn} onClick={addFeature}><Plus size={14} /> Add Feature</button>
            </Section>

            {/* ── How It Works ── */}
            <Section id="howItWorks" title="How It Works" icon={Leaf}>
                <Field label="Section Label" value={content.howItWorks.label} onChange={(v) => update('howItWorks.label', v)} />
                <Field label="Section Title" value={content.howItWorks.title} onChange={(v) => update('howItWorks.title', v)} />
                <Field label="Section Subtitle" value={content.howItWorks.subtitle} onChange={(v) => update('howItWorks.subtitle', v)} textarea />

                <label style={{ ...S.label, marginTop: 16, marginBottom: 12 }}>Steps</label>
                {content.howItWorks.steps.map((step, i) => (
                    <div key={i} style={S.card}>
                        <button style={S.removeBtn} onClick={() => removeStep(i)}><Trash2 size={14} /></button>
                        <div style={S.cardRow}>
                            <div style={S.inline('15%')}>
                                <Field label="Number" value={step.number} onChange={(v) => update(`howItWorks.steps.${i}.number`, v)} />
                            </div>
                            <div style={S.inline('40%')}>
                                <Field label="Title" value={step.title} onChange={(v) => update(`howItWorks.steps.${i}.title`, v)} />
                            </div>
                        </div>
                        <Field label="Description" value={step.description} onChange={(v) => update(`howItWorks.steps.${i}.description`, v)} textarea />
                    </div>
                ))}
                <button style={S.addBtn} onClick={addStep}><Plus size={14} /> Add Step</button>
            </Section>

            {/* ── Stats ── */}
            <Section id="stats" title="Stats / Fun Facts" icon={Leaf}>
                {content.stats.map((stat, i) => (
                    <div key={i} style={{ ...S.card, display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
                        <button style={S.removeBtn} onClick={() => removeStat(i)}><Trash2 size={14} /></button>
                        <div style={S.inline('30%')}>
                            <Field label="Value" value={stat.value} onChange={(v) => update(`stats.${i}.value`, v)} />
                        </div>
                        <div style={S.inline('50%')}>
                            <Field label="Label" value={stat.label} onChange={(v) => update(`stats.${i}.label`, v)} />
                        </div>
                    </div>
                ))}
                <button style={S.addBtn} onClick={addStat}><Plus size={14} /> Add Stat</button>
            </Section>

            {/* ── Testimonials ── */}
            <Section id="testimonials" title="Testimonials" icon={Leaf}>
                {content.testimonials.map((t, i) => (
                    <div key={i} style={S.card}>
                        <button style={S.removeBtn} onClick={() => removeTestimonial(i)}><Trash2 size={14} /></button>
                        <div style={S.cardRow}>
                            <div style={S.inline('35%')}>
                                <Field label="Name" value={t.name} onChange={(v) => update(`testimonials.${i}.name`, v)} />
                            </div>
                            <div style={S.inline('30%')}>
                                <Field label="Role" value={t.role} onChange={(v) => update(`testimonials.${i}.role`, v)} />
                            </div>
                            <div style={S.inline('15%')}>
                                <Field label="Initials" value={t.initials} onChange={(v) => update(`testimonials.${i}.initials`, v)} />
                            </div>
                        </div>
                        <Field label="Testimonial Text" value={t.text} onChange={(v) => update(`testimonials.${i}.text`, v)} textarea />
                    </div>
                ))}
                <button style={S.addBtn} onClick={addTestimonial}><Plus size={14} /> Add Testimonial</button>
            </Section>

            {/* ── CTA ── */}
            <Section id="cta" title="Call to Action" icon={Leaf}>
                <Field label="Title" value={content.cta.title} onChange={(v) => update('cta.title', v)} />
                <Field label="Subtitle" value={content.cta.subtitle} onChange={(v) => update('cta.subtitle', v)} textarea />
                <Field label="Button Text" value={content.cta.button} onChange={(v) => update('cta.button', v)} />
            </Section>

            {/* ── Footer ── */}
            <Section id="footer" title="Footer" icon={Leaf}>
                <Field label="Description" value={content.footer.description} onChange={(v) => update('footer.description', v)} textarea />
                <Field label="Copyright Text" value={content.footer.copyright} onChange={(v) => update('footer.copyright', v)} />
            </Section>

            {/* Toast */}
            {toast && (
                <div style={S.toast(toast.type)}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {toast.msg}
                </div>
            )}
        </div>
    );
};

export default LandingEditor;
