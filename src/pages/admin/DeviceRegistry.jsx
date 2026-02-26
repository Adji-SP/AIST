import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../auth/AuthContext';
import AdminLayout from '../../components/layout/AdminLayout';

const DeviceRegistry = () => {
    const [devices, setDevices] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [isAdding, setIsAdding] = useState(false);
    const [newDevice, setNewDevice] = useState({
        device_id: '',
        name: '',
        assigned_to_uid: '',
        status: 'active'
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Devices
            const deviceSnap = await getDocs(collection(db, 'devices'));
            setDevices(deviceSnap.docs.map(d => ({ id: d.id, ...d.data() })));

            // Fetch Users for assignment dropdown
            const userSnap = await getDocs(collection(db, 'users'));
            setUsers(userSnap.docs.map(u => ({ id: u.id, ...u.data() })));
        } catch (error) {
            console.error("Error fetching registry data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddDevice = async (e) => {
        e.preventDefault();
        try {
            const assignedUser = users.find(u => u.id === newDevice.assigned_to_uid);

            const devicePayload = {
                ...newDevice,
                assigned_to_email: assignedUser ? assignedUser.email : 'Unassigned',
                registered_at: serverTimestamp()
            };

            await addDoc(collection(db, 'devices'), devicePayload);
            setIsAdding(false);
            setNewDevice({ device_id: '', name: '', assigned_to_uid: '', status: 'active' });
            fetchData(); // Refresh list
        } catch (error) {
            console.error("Error adding device:", error);
            alert("Failed to register device.");
        }
    };

    const handleDelete = async (docId) => {
        if (!window.confirm("Are you sure you want to delete this device mapping?")) return;
        try {
            await deleteDoc(doc(db, 'devices', docId));
            setDevices(devices.filter(d => d.id !== docId));
        } catch (error) {
            console.error("Error deleting device:", error);
        }
    };

    return (
        <AdminLayout>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-black">
                    Device Registry
                </h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex w-full items-center justify-center rounded bg-blue-600 p-3 font-medium text-white hover:bg-blue-700 sm:w-auto"
                >
                    {isAdding ? 'Cancel' : 'Register New Device'}
                </button>
            </div>

            {isAdding && (
                <div className="rounded-sm border border-gray-200 bg-white shadow-sm mb-6 p-6">
                    <h3 className="font-medium text-black mb-4">Register Hardware</h3>
                    <form onSubmit={handleAddDevice}>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className="mb-2.5 block text-black">Hardware Serial (Device ID)</label>
                                <input
                                    type="text"
                                    required
                                    value={newDevice.device_id}
                                    onChange={(e) => setNewDevice({ ...newDevice, device_id: e.target.value })}
                                    placeholder="e.g. ESP32-GREENHOUSE-001"
                                    className="w-full rounded border-[1.5px] border-gray-300 bg-transparent py-3 px-5 font-medium outline-none transition focus:border-blue-500 active:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="mb-2.5 block text-black">Friendly Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newDevice.name}
                                    onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                                    placeholder="e.g. Main Farm Kasturi"
                                    className="w-full rounded border-[1.5px] border-gray-300 bg-transparent py-3 px-5 font-medium outline-none transition focus:border-blue-500 active:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="mb-2.5 block text-black">Assign to User</label>
                                <select
                                    required
                                    value={newDevice.assigned_to_uid}
                                    onChange={(e) => setNewDevice({ ...newDevice, assigned_to_uid: e.target.value })}
                                    className="w-full rounded border-[1.5px] border-gray-300 bg-transparent py-3 px-5 font-medium outline-none transition focus:border-blue-500 active:border-blue-500"
                                >
                                    <option value="" disabled>Select a user...</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.email}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2.5 block text-white hidden md:block">.</label>
                                <button type="submit" className="w-full flex justify-center rounded bg-blue-600 p-3 font-medium text-white hover:bg-opacity-90">
                                    Save Device
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="rounded-sm border border-gray-200 bg-white shadow-sm">
                <div className="py-6 px-4 md:px-6 xl:px-7.5">
                    <h4 className="text-xl font-semibold text-black">Hardware Access List</h4>
                </div>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="max-w-full overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="bg-gray-50 text-left">
                                    <th className="min-w-[150px] py-4 px-4 font-medium text-black xl:pl-11">Name</th>
                                    <th className="min-w-[200px] py-4 px-4 font-medium text-black">Device Serial ID</th>
                                    <th className="min-w-[200px] py-4 px-4 font-medium text-black">Assigned User</th>
                                    <th className="min-w-[150px] py-4 px-4 font-medium text-black">Status</th>
                                    <th className="py-4 px-4 font-medium text-black">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devices.map((d, key) => (
                                    <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-5 px-4 xl:pl-11"><p className="text-black font-medium">{d.name}</p></td>
                                        <td className="py-5 px-4"><p className="text-sm font-mono text-gray-600 bg-gray-100 py-1 px-2 rounded inline">{d.device_id}</p></td>
                                        <td className="py-5 px-4"><p className="text-black text-sm">{d.assigned_to_email}</p></td>
                                        <td className="py-5 px-4">
                                            <span className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${d.status === 'active' ? 'bg-green-500 text-green-600' : 'bg-red-500 text-red-600'
                                                }`}>
                                                {d.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="py-5 px-4">
                                            <button
                                                onClick={() => handleDelete(d.id)}
                                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                                            >
                                                Revoke
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {devices.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-5 px-4 text-center text-gray-500">
                                            No devices registered yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default DeviceRegistry;
