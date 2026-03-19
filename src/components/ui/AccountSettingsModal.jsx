import React, { useState, useEffect } from 'react';
import { X, Mail, User, Save, Loader2, Check, Phone, MapPin, Building2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AccountSettingsModal = ({ isOpen, onClose }) => {
    const { user, role, db } = useAuth();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(false);

    const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
    const email = user?.email || '';
    const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const roleBadge = role === 'superadmin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'User';
    const roleBadgeColor = role === 'superadmin' ? 'bg-amber-100 text-amber-700'
        : role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700';

    const [form, setForm] = useState({
        displayName: displayName,
        phone: '',
        address: '',
        organization: '',
        bio: '',
    });

    // Load extra profile fields from Firestore when modal opens
    useEffect(() => {
        if (isOpen && user) {
            setLoadingProfile(true);
            setSaveError('');
            const userDocRef = doc(db, 'users', user.uid);
            getDoc(userDocRef).then(snap => {
                if (snap.exists()) {
                    const data = snap.data();
                    setForm(prev => ({
                        ...prev,
                        displayName: data.displayName || displayName,
                        phone: data.phone || '',
                        address: data.address || '',
                        organization: data.organization || '',
                        bio: data.bio || '',
                    }));
                }
            }).catch(err => {
                console.error('Failed to load profile:', err);
                setSaveError('Failed to load profile data.');
            }).finally(() => setLoadingProfile(false));
        }
    }, [isOpen, user]);

    const updateField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setSaveError('');
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        setSaveError('');
        try {
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
                displayName: form.displayName.trim() || displayName,
                phone: form.phone.trim(),
                address: form.address.trim(),
                organization: form.organization.trim(),
                bio: form.bio.trim(),
            }, { merge: true });
            setSaved(true);
            setTimeout(() => { setSaved(false); onClose(); }, 1200);
        } catch (err) {
            console.error('Failed to update profile:', err);
            setSaveError(err.message || 'Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative flex-shrink-0">
                    {/* Gradient Banner */}
                    <div className="h-24 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Avatar */}
                    <div className="flex justify-center -mt-10 relative z-10">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center ring-4 ring-white shadow-lg">
                            <span className="text-white text-xl font-bold">{initials}</span>
                        </div>
                    </div>
                </div>

                {/* Profile Summary */}
                <div className="text-center mt-2 px-6 flex-shrink-0">
                    <h3 className="text-lg font-bold text-slate-800">{form.displayName || displayName}</h3>
                    <p className="text-xs text-slate-500">{email}</p>
                    <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${roleBadgeColor}`}>
                        {roleBadge}
                    </span>
                </div>

                {/* Form Fields — Scrollable */}
                <div className="px-6 pt-4 pb-6 space-y-3.5 overflow-y-auto flex-1">
                    {loadingProfile ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Display Name */}
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    <User className="w-3 h-3" /> Display Name
                                </label>
                                <input
                                    type="text"
                                    value={form.displayName}
                                    onChange={(e) => updateField('displayName', e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                                />
                            </div>

                            {/* Email (read-only) */}
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    <Mail className="w-3 h-3" /> Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    readOnly
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-100 bg-slate-50 text-sm text-slate-400 cursor-not-allowed"
                                />
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    <Phone className="w-3 h-3" /> Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => updateField('phone', e.target.value)}
                                    placeholder="+60 12-345 6789"
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 placeholder:text-slate-400"
                                />
                            </div>

                            {/* Organization */}
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    <Building2 className="w-3 h-3" /> Organization
                                </label>
                                <input
                                    type="text"
                                    value={form.organization}
                                    onChange={(e) => updateField('organization', e.target.value)}
                                    placeholder="e.g. University / Farm name"
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 placeholder:text-slate-400"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    <MapPin className="w-3 h-3" /> Address
                                </label>
                                <textarea
                                    value={form.address}
                                    onChange={(e) => updateField('address', e.target.value)}
                                    placeholder="Street, City, State"
                                    rows={2}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 placeholder:text-slate-400 resize-none"
                                />
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    <User className="w-3 h-3" /> Bio
                                </label>
                                <textarea
                                    value={form.bio}
                                    onChange={(e) => updateField('bio', e.target.value)}
                                    placeholder="A short description about yourself"
                                    rows={2}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 placeholder:text-slate-400 resize-none"
                                />
                            </div>
                        </>
                    )}

                    {/* Error Display */}
                    {saveError && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-600">{saveError}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-1">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || saved || loadingProfile}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${saved
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                } disabled:opacity-70`}
                        >
                            {saved ? (
                                <><Check className="w-4 h-4" /> Saved!</>
                            ) : saving ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                            ) : (
                                <><Save className="w-4 h-4" /> Save Changes</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountSettingsModal;
