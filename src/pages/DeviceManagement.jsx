import React, { useState, useMemo } from 'react';
import {
    Plus, Search, Cpu, Wifi, WifiOff, Trash2, Pencil,
    X, AlertCircle, Check, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import Header from '../components/layout/header';
import Sidebar from '../components/layout/sidebar';
import { useAuth } from '../auth/AuthContext';

const DeviceManagement = () => {
    const { userDevicesData, addDevice, removeDevice, user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('name');
    const [sortDir, setSortDir] = useState('asc');
    const [showAddModal, setShowAddModal] = useState(false);
    const [toast, setToast] = useState(null);

    // Add form state
    const [newDevice, setNewDevice] = useState({ device_id: '', name: '', orchard: '' });
    const [addError, setAddError] = useState('');
    const [addLoading, setAddLoading] = useState(false);

    // Delete state
    const [deleteLoading, setDeleteLoading] = useState(null);

    const devices = userDevicesData || [];

    // Helper: get timestamp value
    const getTs = (val) => {
        if (!val) return 0;
        if (typeof val?.toDate === 'function') return val.toDate().getTime();
        return new Date(val).getTime() || 0;
    };

    const getStatusLabel = (d) => {
        if (!d?.last_seen) return 'Unknown';
        return (Date.now() - getTs(d.last_seen) < 3600000) ? 'Online' : 'Offline';
    };

    // Filtered + Sorted
    const filteredDevices = useMemo(() => {
        let list = [...devices];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(d =>
                (d.name || '').toLowerCase().includes(q) ||
                (d.device_id || '').toLowerCase().includes(q) ||
                (d.orchard || '').toLowerCase().includes(q)
            );
        }

        list.sort((a, b) => {
            let cmp = 0;
            if (sortField === 'name') {
                cmp = (a.name || '').localeCompare(b.name || '');
            } else if (sortField === 'last_seen') {
                cmp = getTs(b.last_seen) - getTs(a.last_seen);
            } else if (sortField === 'status') {
                cmp = getStatusLabel(a).localeCompare(getStatusLabel(b));
            }
            return sortDir === 'asc' ? cmp : -cmp;
        });

        return list;
    }, [devices, searchQuery, sortField, sortDir]);

    const toggleSort = (field) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <ChevronDown className="w-3 h-3 text-slate-300" />;
        return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-emerald-600" /> : <ChevronDown className="w-3 h-3 text-emerald-600" />;
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setAddError('');

        if (!newDevice.device_id.trim()) {
            setAddError('Device Token / ID is required');
            return;
        }
        if (!/^[A-Za-z0-9_-]{3,64}$/.test(newDevice.device_id.trim())) {
            setAddError('Invalid token format. Use 3–64 alphanumeric characters, hyphens, or underscores.');
            return;
        }
        // Check duplicate
        if (devices.some(d => d.device_id === newDevice.device_id.trim())) {
            setAddError('This device is already registered to your account.');
            return;
        }

        setAddLoading(true);
        try {
            await addDevice({
                device_id: newDevice.device_id.trim(),
                name: newDevice.name.trim() || undefined,
                orchard: newDevice.orchard.trim() || undefined,
            });
            setShowAddModal(false);
            setNewDevice({ device_id: '', name: '', orchard: '' });
            showToast('Device registered successfully!');
        } catch (err) {
            setAddError(err.message || 'Failed to add device');
        } finally {
            setAddLoading(false);
        }
    };

    const handleDelete = async (docId, deviceName) => {
        if (!window.confirm(`Remove "${deviceName}" from your account?`)) return;
        setDeleteLoading(docId);
        try {
            await removeDevice(docId);
            showToast(`"${deviceName}" removed.`);
        } catch (err) {
            showToast(err.message || 'Failed to remove device', 'error');
        } finally {
            setDeleteLoading(null);
        }
    };

    const maskId = (id) => {
        if (!id || id.length <= 8) return id;
        return id.slice(0, 4) + '…' + id.slice(-4);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)}
            />

            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <Header onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 px-4 sm:px-6 py-6 overflow-auto">
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">My Devices</h2>
                            <p className="text-sm text-slate-500 mt-1">Manage your registered IoT devices and sensors.</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md"
                        >
                            <Plus className="w-4 h-4" />
                            Add Device
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-4">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, ID, or orchard…"
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                            />
                        </div>
                    </div>

                    {/* Devices Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-slate-700">
                                                Device <SortIcon field="name" />
                                            </button>
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Token / ID</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Orchard</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            <button onClick={() => toggleSort('status')} className="flex items-center gap-1 hover:text-slate-700">
                                                Status <SortIcon field="status" />
                                            </button>
                                        </th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                                            <button onClick={() => toggleSort('last_seen')} className="flex items-center gap-1 hover:text-slate-700">
                                                Last Seen <SortIcon field="last_seen" />
                                            </button>
                                        </th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredDevices.length > 0 ? (
                                        filteredDevices.map((d) => {
                                            const status = getStatusLabel(d);
                                            const isOnline = status === 'Online';
                                            return (
                                                <tr key={d.docId} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                                <Cpu className="w-4.5 h-4.5 text-slate-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-800">{d.name || `Device ${d.device_id}`}</p>
                                                                <p className="text-[11px] text-slate-400 md:hidden">{maskId(d.device_id)}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 hidden md:table-cell">
                                                        <code className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">{maskId(d.device_id)}</code>
                                                    </td>
                                                    <td className="px-4 py-3.5 hidden lg:table-cell">
                                                        <span className="text-sm text-slate-600">{d.orchard || '—'}</span>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isOnline ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                                                            {status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 hidden sm:table-cell">
                                                        <span className="text-xs text-slate-500">
                                                            {d.last_seen ? new Date(getTs(d.last_seen)).toLocaleString() : 'Never'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right">
                                                        <button
                                                            onClick={() => handleDelete(d.docId, d.name || d.device_id)}
                                                            disabled={deleteLoading === d.docId}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                            title="Remove device"
                                                        >
                                                            {deleteLoading === d.docId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                        <Cpu className="w-8 h-8 text-slate-300" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-600">
                                                            {searchQuery ? 'No matching devices' : 'No devices registered yet'}
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            {searchQuery ? 'Try a different search term.' : 'Register your first IoT device to get started.'}
                                                        </p>
                                                    </div>
                                                    {!searchQuery && (
                                                        <button
                                                            onClick={() => setShowAddModal(true)}
                                                            className="mt-2 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                            Add Your First Device
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* Add Device Modal Overlay */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Add Device</h3>
                            <button onClick={() => { setShowAddModal(false); setAddError(''); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAdd} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Device Token / ID <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={newDevice.device_id}
                                    onChange={(e) => { setNewDevice({ ...newDevice, device_id: e.target.value }); setAddError(''); }}
                                    placeholder="e.g. ESP32-GREENHOUSE-001"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 placeholder:text-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Device Name <span className="text-slate-400 font-normal">(optional)</span></label>
                                <input
                                    type="text"
                                    value={newDevice.name}
                                    onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                                    placeholder="e.g. Greenhouse Sensor"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 placeholder:text-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Orchard / Group <span className="text-slate-400 font-normal">(optional)</span></label>
                                <input
                                    type="text"
                                    value={newDevice.orchard}
                                    onChange={(e) => setNewDevice({ ...newDevice, orchard: e.target.value })}
                                    placeholder="e.g. Nipis Orchard"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 placeholder:text-slate-400"
                                />
                            </div>

                            {addError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
                                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                    <p className="text-sm text-red-600">{addError}</p>
                                </div>
                            )}

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowAddModal(false); setAddError(''); }}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addLoading}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
                                >
                                    {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    {addLoading ? 'Registering…' : 'Register Device'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[110] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold animate-fade-in-up ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                    {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}
        </div>
    );
};

export default DeviceManagement;
