import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Wifi, WifiOff, Plus, Cpu } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

const DeviceSelector = ({ selectedDeviceId, onDeviceChange }) => {
    const { userDevicesData } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    const devices = userDevicesData || [];
    const selected = devices.find(d => d.device_id === selectedDeviceId) || devices[0] || null;

    const getStatusColor = (d) => {
        if (!d) return 'bg-slate-300';
        const lastSeen = d.last_seen;
        if (!lastSeen) return 'bg-slate-300';
        const ts = typeof lastSeen?.toDate === 'function' ? lastSeen.toDate().getTime() : new Date(lastSeen).getTime();
        return (Date.now() - ts < 3600000) ? 'bg-green-500' : 'bg-slate-300';
    };

    const getStatusLabel = (d) => {
        if (!d?.last_seen) return 'Unknown';
        const ts = typeof d.last_seen?.toDate === 'function' ? d.last_seen.toDate().getTime() : new Date(d.last_seen).getTime();
        return (Date.now() - ts < 3600000) ? 'Online' : 'Offline';
    };

    // Empty state
    if (devices.length === 0) {
        return (
            <button
                onClick={() => navigate('/devices')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 hover:border-emerald-400 transition-colors"
            >
                <Plus className="w-3.5 h-3.5" />
                Add Device
            </button>
        );
    }

    return (
        <div className="relative" ref={ref}>
            {/* Trigger Button */}
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 hover:border-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-300 min-w-[140px]"
            >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(selected)}`} />
                <span className="truncate max-w-[120px]">{selected?.name || 'Select Device'}</span>
                {selected?.orchard && (
                    <span className="hidden sm:inline text-[10px] text-emerald-500 font-normal truncate max-w-[80px]">{selected.orchard}</span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in-up">
                    <div className="p-2.5 border-b border-slate-100 bg-slate-50">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Your Devices</p>
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1">
                        {devices.map((d) => {
                            const isSelected = d.device_id === (selected?.device_id);
                            return (
                                <button
                                    key={d.docId || d.device_id}
                                    onClick={() => { onDeviceChange(d.device_id); setOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${isSelected ? 'bg-emerald-50' : 'hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                        <Cpu className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${isSelected ? 'text-emerald-700' : 'text-slate-800'}`}>
                                            {d.name || `Device ${d.device_id}`}
                                        </p>
                                        {d.orchard && (
                                            <p className="text-[11px] text-slate-400 truncate">{d.orchard}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(d)}`} />
                                        <span className="text-[10px] text-slate-400 font-medium">{getStatusLabel(d)}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    {/* Add Device CTA */}
                    <div className="border-t border-slate-100 p-2">
                        <button
                            onClick={() => { navigate('/devices'); setOpen(false); }}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add New Device
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeviceSelector;
